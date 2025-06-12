from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import numpy as np
from .database_service import DatabaseService
from .llm_service import LLMService
from .embedding_service import EmbeddingService

class ThreadService:
    def __init__(self):
        self.db_service = DatabaseService()
        self.llm_service = LLMService()
        self.embedding_service = EmbeddingService()

    async def get_all_threads(self) -> List[Dict[str, Any]]:
        """Get all threads with summary information"""
        threads = await self.db_service.get_all_threads()
        
        thread_summaries = []
        for thread in threads:
            # Get chunk count for this thread
            chunks = [chunk for chunk in self.db_service.chunks.values() 
                     if chunk.get("thread_id") == thread["id"]]
            
            # Generate topics (in production, these would be stored in the thread metadata)
            topics = await self._generate_topics_for_thread(thread["id"])
            
            summary = {
                "id": thread["id"],
                "title": thread["title"],
                "created_at": thread["created_at"],
                "updated_at": thread["updated_at"],
                "chunkCount": len(chunks),
                "topics": topics,
                "metadata": thread.get("metadata", {})
            }
            thread_summaries.append(summary)
        
        return sorted(thread_summaries, key=lambda x: x["updated_at"], reverse=True)

    async def get_thread_by_id(
        self, 
        thread_id: str, 
        include_chunks: bool = True,
        include_summary: bool = True
    ) -> Optional[Dict[str, Any]]:
        """Get a specific thread with all its chunks"""
        thread = await self.db_service.get_thread(thread_id)
        if not thread:
            return None

        result = {
            "id": thread["id"],
            "title": thread["title"],
            "centroidEmbedding": thread.get("centroid_embedding"),
            "created_at": thread["created_at"],
            "updated_at": thread["updated_at"],
            "metadata": thread.get("metadata", {})
        }
        
        # Get chunks for this thread if requested
        if include_chunks:
            chunks = [chunk for chunk in self.db_service.chunks.values() 
                    if chunk.get("thread_id") == thread_id]
            
            # Format chunks
            formatted_chunks = []
            for chunk in chunks:
                formatted_chunk = {
                    "id": chunk["id"],
                    "role": self._determine_role(chunk["participant_label"]),
                    "text": chunk["text_chunk"],
                    "timestamp": chunk["timestamp"],
                    "participantLabel": chunk["participant_label"],
                    "modelName": chunk.get("model_name"),
                    "metadata": chunk.get("metadata", {})
                }
                
                # Get micro-threads for this chunk
                micro_threads = await self.db_service.get_micro_threads_by_chunk(chunk["id"])
                if micro_threads:
                    formatted_micro_threads = []
                    for mt in micro_threads:
                        formatted_mt = {
                            "id": mt["id"],
                            "userPrompt": mt["user_prompt"],
                            "assistantResponse": mt["assistant_response"],
                            "modelUsed": mt["model_used"],
                            "createdAt": mt["created_at"],
                            "metadata": mt.get("metadata", {})
                        }
                        formatted_micro_threads.append(formatted_mt)
                    
                    formatted_chunk["microThreads"] = formatted_micro_threads
                
                formatted_chunks.append(formatted_chunk)

            # Sort chunks by timestamp
            formatted_chunks.sort(key=lambda x: x["timestamp"])
            result["chunks"] = formatted_chunks
        
        # Generate or retrieve summary if requested
        if include_summary:
            summary = await self.get_or_generate_summary(thread_id)
            if summary:
                result["summary"] = summary["summary"]
        
        return result

    async def get_or_generate_summary(self, thread_id: str, regenerate: bool = False) -> Optional[Dict[str, Any]]:
        """Get existing summary or generate new one"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Check for existing summary
                if not regenerate:
                    existing_summary = await conn.fetchrow('''
                        SELECT cs.* FROM conversation_summaries cs
                        JOIN sources s ON cs.source_id = s.id
                        JOIN chunks c ON c.source_id = s.id
                        WHERE c.thread_id = $1
                        LIMIT 1
                    ''', thread_id)
                    
                    if existing_summary:
                        return dict(existing_summary)
                
                # Generate new summary
                return await self.regenerate_summary(thread_id)
                
            except Exception as e:
                print(f"Database error getting summary: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        return None

    async def regenerate_summary(self, thread_id: str) -> Dict[str, Any]:
        """Force regenerate thread summary"""
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Get all chunks for this thread
                chunks = await conn.fetch('''
                    SELECT c.*, s.id as source_id
                    FROM chunks c
                    JOIN sources s ON c.source_id = s.id
                    WHERE c.thread_id = $1
                    ORDER BY c.timestamp
                ''', thread_id)
                
                if not chunks:
                    raise ValueError("No chunks found for thread")
                
                # Prepare conversation text for summarization
                conversation_parts = []
                participants = set()
                
                for chunk in chunks:
                    participant = chunk["participant_label"] or "Unknown"
                    participants.add(participant)
                    conversation_parts.append(f"{participant}: {chunk['text_chunk']}")
                
                conversation_text = "\n\n".join(conversation_parts)
                
                # Generate summary using LLM
                summary_prompt = f"""Please provide a comprehensive summary of the following conversation thread in 2-3 paragraphs. 
                
                Focus on:
                1. Main topics discussed
                2. Key insights or conclusions
                3. Important questions asked and answered
                4. Any actionable items or recommendations
                
                Conversation:
                {conversation_text}
                
                Provide a clear, well-structured summary:"""
                
                llm_response = await self.llm_service.route_to_llm(
                    prompt=summary_prompt,
                    system_prompt="You are an expert at creating comprehensive, insightful summaries of AI conversations. Focus on extracting key insights, main topics, and actionable information."
                )
                
                summary_text = llm_response["responseText"]
                
                # Extract key topics using LLM
                topics_prompt = f"""Based on this conversation summary, extract 3-5 key topics or themes. Return only a comma-separated list of topics:
                
                {summary_text}"""
                
                topics_response = await self.llm_service.route_to_llm(
                    prompt=topics_prompt,
                    system_prompt="Extract key topics from conversation summaries. Return only comma-separated topics."
                )
                
                key_topics = [topic.strip() for topic in topics_response["responseText"].split(",")][:5]
                
                # Save summary to database
                source_id = chunks[0]["source_id"]
                
                summary_data = {
                    "source_id": source_id,
                    "summary": summary_text,
                    "key_topics": key_topics,
                    "participant_count": len(participants),
                    "message_count": len(chunks),
                    "generated_at": datetime.now(),
                    "model_used": llm_response["modelUsed"],
                    "confidence_score": 0.85  # Mock confidence score
                }
                
                # Upsert summary
                await conn.execute('''
                    INSERT INTO conversation_summaries 
                    (source_id, summary, key_topics, participant_count, message_count, generated_at, model_used, confidence_score)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (source_id) 
                    DO UPDATE SET 
                        summary = EXCLUDED.summary,
                        key_topics = EXCLUDED.key_topics,
                        participant_count = EXCLUDED.participant_count,
                        message_count = EXCLUDED.message_count,
                        generated_at = EXCLUDED.generated_at,
                        model_used = EXCLUDED.model_used,
                        confidence_score = EXCLUDED.confidence_score
                ''', source_id, summary_text, key_topics, len(participants), len(chunks), 
                datetime.now(), llm_response["modelUsed"], 0.85)
                
                return summary_data
                
            except Exception as e:
                print(f"Error regenerating summary: {e}")
                raise e
            finally:
                await self.db_service.release_connection(conn)
        
        raise Exception("Database connection failed")

    async def create_thread(self, title: str, chunk_ids: List[str]) -> Dict[str, Any]:
        """Create a new thread from existing chunks"""
        # Validate chunks exist
        chunks = []
        for chunk_id in chunk_ids:
            chunk = self.db_service.chunks.get(chunk_id)
            if chunk:
                chunks.append(chunk)
        
        if not chunks:
            raise ValueError("No valid chunks found")
        
        # Calculate centroid embedding
        embeddings = [chunk.get("embedding") for chunk in chunks if chunk.get("embedding")]
        centroid_embedding = None
        if embeddings:
            centroid_embedding = np.mean(embeddings, axis=0).tolist()
        
        # Create thread
        thread_id = str(uuid.uuid4())
        thread_data = {
            "id": thread_id,
            "title": title,
            "centroid_embedding": centroid_embedding,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "metadata": {
                "chunk_count": len(chunks),
                "source_ids": list(set(chunk.get("source_id") for chunk in chunks if chunk.get("source_id")))
            }
        }
        
        await self.db_service.create_thread(thread_data)
        
        # Update chunks with thread_id
        for chunk in chunks:
            chunk["thread_id"] = thread_id
            await self.db_service.create_chunk(chunk)  # This will update the existing chunk
        
        # Log the thread creation in the changelog
        await self._log_thread_change(
            thread_id=thread_id,
            change_type="create",
            description=f"Created thread '{title}' with {len(chunks)} chunks"
        )
        
        return thread_data

    async def merge_threads(self, thread_id: str, target_thread_id: str) -> Dict[str, Any]:
        """Merge two threads together"""
        # Get both threads
        source_thread = await self.db_service.get_thread(thread_id)
        target_thread = await self.db_service.get_thread(target_thread_id)
        
        if not source_thread or not target_thread:
            raise ValueError("One or both threads not found")
        
        # Get chunks from source thread
        source_chunks = [chunk for chunk in self.db_service.chunks.values() 
                        if chunk.get("thread_id") == thread_id]
        
        # Update chunks to point to target thread
        for chunk in source_chunks:
            chunk["thread_id"] = target_thread_id
            await self.db_service.create_chunk(chunk)  # This will update the existing chunk
        
        # Update target thread metadata
        target_thread["updated_at"] = datetime.now()
        if "metadata" not in target_thread:
            target_thread["metadata"] = {}
        
        # Update chunk count
        target_chunks = [chunk for chunk in self.db_service.chunks.values() 
                        if chunk.get("thread_id") == target_thread_id]
        target_thread["metadata"]["chunk_count"] = len(target_chunks)
        
        # Recalculate centroid embedding
        embeddings = [chunk.get("embedding") for chunk in target_chunks if chunk.get("embedding")]
        if embeddings:
            target_thread["centroid_embedding"] = np.mean(embeddings, axis=0).tolist()
        
        await self.db_service.create_thread(target_thread)  # This will update the existing thread
        
        # Log the merge in the changelog
        await self._log_thread_change(
            thread_id=target_thread_id,
            change_type="merge",
            description=f"Merged thread '{source_thread['title']}' into '{target_thread['title']}'",
            metadata={
                "source_thread_id": thread_id,
                "source_thread_title": source_thread["title"],
                "chunks_merged": len(source_chunks)
            }
        )
        
        return {
            "thread_id": target_thread_id,
            "title": target_thread["title"],
            "chunk_count": len(target_chunks)
        }

    async def split_thread(self, thread_id: str, chunk_id: str) -> Dict[str, Any]:
        """Split a thread at a specific chunk"""
        # Get the thread
        thread = await self.db_service.get_thread(thread_id)
        if not thread:
            raise ValueError("Thread not found")
        
        # Get all chunks for this thread
        all_chunks = [chunk for chunk in self.db_service.chunks.values() 
                     if chunk.get("thread_id") == thread_id]
        
        # Sort chunks by timestamp
        all_chunks.sort(key=lambda x: x["timestamp"])
        
        # Find the index of the split point
        split_index = next((i for i, chunk in enumerate(all_chunks) if chunk["id"] == chunk_id), -1)
        if split_index == -1:
            raise ValueError("Chunk not found in thread")
        
        # Split the chunks
        original_chunks = all_chunks[:split_index]
        new_chunks = all_chunks[split_index:]
        
        if not new_chunks:
            raise ValueError("No chunks to split off")
        
        # Create a new thread for the split chunks
        new_thread_title = f"{thread['title']} (Split)"
        new_thread_id = str(uuid.uuid4())
        
        # Calculate centroid embedding for new thread
        new_embeddings = [chunk.get("embedding") for chunk in new_chunks if chunk.get("embedding")]
        new_centroid_embedding = None
        if new_embeddings:
            new_centroid_embedding = np.mean(new_embeddings, axis=0).tolist()
        
        new_thread_data = {
            "id": new_thread_id,
            "title": new_thread_title,
            "centroid_embedding": new_centroid_embedding,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "metadata": {
                "chunk_count": len(new_chunks),
                "split_from": thread_id,
                "source_ids": list(set(chunk.get("source_id") for chunk in new_chunks if chunk.get("source_id")))
            }
        }
        
        await self.db_service.create_thread(new_thread_data)
        
        # Update chunks to point to new thread
        for chunk in new_chunks:
            chunk["thread_id"] = new_thread_id
            await self.db_service.create_chunk(chunk)  # This will update the existing chunk
        
        # Update original thread metadata
        thread["updated_at"] = datetime.now()
        if "metadata" not in thread:
            thread["metadata"] = {}
        thread["metadata"]["chunk_count"] = len(original_chunks)
        
        # Recalculate centroid embedding for original thread
        original_embeddings = [chunk.get("embedding") for chunk in original_chunks if chunk.get("embedding")]
        if original_embeddings:
            thread["centroid_embedding"] = np.mean(original_embeddings, axis=0).tolist()
        
        await self.db_service.create_thread(thread)  # This will update the existing thread
        
        # Log the split in the changelog
        await self._log_thread_change(
            thread_id=thread_id,
            change_type="split",
            description=f"Split thread '{thread['title']}' at chunk {chunk_id}",
            metadata={
                "new_thread_id": new_thread_id,
                "new_thread_title": new_thread_title,
                "split_chunk_id": chunk_id,
                "chunks_in_original": len(original_chunks),
                "chunks_in_new": len(new_chunks)
            }
        )
        
        return {
            "original_thread_id": thread_id,
            "new_thread_id": new_thread_id,
            "new_thread_title": new_thread_title,
            "chunks_in_original": len(original_chunks),
            "chunks_in_new": len(new_chunks)
        }

    async def auto_generate_threads(self) -> Dict[str, Any]:
        """Automatically generate threads from unassigned chunks"""
        # Get unassigned chunks
        unassigned_chunks = [chunk for chunk in self.db_service.chunks.values() 
                            if not chunk.get("thread_id")]
        
        if not unassigned_chunks:
            return {
                "threads_created": 0,
                "chunks_processed": 0
            }
        
        # Group chunks by source_id
        chunks_by_source = {}
        for chunk in unassigned_chunks:
            source_id = chunk.get("source_id")
            if source_id:
                if source_id not in chunks_by_source:
                    chunks_by_source[source_id] = []
                chunks_by_source[source_id].append(chunk)
        
        # Create a thread for each source
        threads_created = 0
        chunks_processed = 0
        
        for source_id, chunks in chunks_by_source.items():
            # Get source info
            source = await self.db_service.get_source(source_id)
            if not source:
                continue
                
            # Create thread
            title = source.get("title", "Untitled Thread")
            chunk_ids = [chunk["id"] for chunk in chunks]
            
            try:
                await self.create_thread(title, chunk_ids)
                threads_created += 1
                chunks_processed += len(chunks)
            except Exception as e:
                print(f"Error creating thread for source {source_id}: {e}")
        
        return {
            "threads_created": threads_created,
            "chunks_processed": chunks_processed
        }

    async def get_thread_statistics(self) -> Dict[str, Any]:
        """Get statistics about threads"""
        threads = await self.db_service.get_all_threads()
        
        # Count chunks in threads
        thread_chunks = {}
        for chunk in self.db_service.chunks.values():
            thread_id = chunk.get("thread_id")
            if thread_id:
                if thread_id not in thread_chunks:
                    thread_chunks[thread_id] = 0
                thread_chunks[thread_id] += 1
        
        total_chunks = sum(thread_chunks.values())
        
        # Get today's threads
        today = datetime.now().date()
        threads_today = [t for t in threads if t["created_at"].date() == today]
        
        # Get thread changelog entries
        changelog_entries = await self._get_thread_changelog_entries(limit=10)
        
        return {
            "totalThreads": len(threads),
            "totalChunks": total_chunks,
            "averageChunksPerThread": total_chunks / len(threads) if threads else 0,
            "threadsCreatedToday": len(threads_today),
            "topThreads": sorted(thread_chunks.items(), key=lambda x: x[1], reverse=True)[:5],
            "recentChanges": changelog_entries
        }

    async def _generate_topics_for_thread(self, thread_id: str) -> List[str]:
        """Generate topics for a thread"""
        # Get chunks for this thread
        chunks = [chunk for chunk in self.db_service.chunks.values() 
                 if chunk.get("thread_id") == thread_id]
        
        if not chunks:
            return []
        
        # In production, we would analyze the chunks and extract topics
        # For demo purposes, return mock topics
        all_topics = [
            "React", "JavaScript", "AI/ML", "Career", "Productivity", 
            "Design", "Backend", "Database", "DevOps", "Mobile",
            "Web3", "Security", "Testing", "Performance", "Architecture"
        ]
        
        # Return 2-4 random topics
        import random
        return random.sample(all_topics, random.randint(2, 4))

    def _determine_role(self, participant_label: str) -> str:
        """Determine if participant is user or assistant"""
        if not participant_label:
            return "user"
        
        participant_lower = participant_label.lower()
        if any(term in participant_lower for term in ["user", "human", "you"]):
            return "user"
        else:
            return "assistant"
            
    async def _log_thread_change(
        self, 
        thread_id: str, 
        change_type: str, 
        description: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Log a thread change to the changelog"""
        changelog_id = str(uuid.uuid4())
        
        # In a real implementation, this would be stored in a database table
        changelog_entry = {
            "id": changelog_id,
            "thread_id": thread_id,
            "change_type": change_type,
            "description": description,
            "metadata": metadata or {},
            "timestamp": datetime.now()
        }
        
        # For demo purposes, just print the changelog entry
        print(f"Thread changelog: {changelog_entry}")
        
        return changelog_id
        
    async def _get_thread_changelog_entries(self, thread_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Get thread changelog entries"""
        # In a real implementation, this would query a database table
        # For demo purposes, return mock data
        
        mock_entries = [
            {
                "id": str(uuid.uuid4()),
                "threadId": "thread-1",
                "changeType": "create",
                "description": "Created thread 'React Best Practices'",
                "timestamp": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "threadId": "thread-2",
                "changeType": "merge",
                "description": "Merged thread 'JavaScript Tips' into 'React Best Practices'",
                "timestamp": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "threadId": "thread-3",
                "changeType": "split",
                "description": "Split thread 'AI/ML Career Guidance' at chunk abc123",
                "timestamp": datetime.now()
            }
        ]
        
        if thread_id:
            return [entry for entry in mock_entries if entry["threadId"] == thread_id][:limit]
        
        return mock_entries[:limit]