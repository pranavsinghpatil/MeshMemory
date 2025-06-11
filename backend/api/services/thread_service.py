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
            summary = await self._get_thread_summary(thread_id)
            result["summary"] = summary
        
        return result

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

    async def _get_thread_summary(self, thread_id: str) -> Optional[str]:
        """Get or generate a summary for a thread"""
        # In production, this would be stored in the thread metadata
        # For demo purposes, generate a new summary
        
        # Get chunks for this thread
        chunks = [chunk for chunk in self.db_service.chunks.values() 
                 if chunk.get("thread_id") == thread_id]
        
        if not chunks:
            return None
        
        # Concatenate chunks for summarization (limit to avoid token limits)
        text_chunks = [chunk["text_chunk"] for chunk in chunks[:10]]
        conversation_text = "\n\n".join(text_chunks)
        
        # Generate summary using LLM
        try:
            summary = await self.llm_service.generate_summary(conversation_text)
            return summary
        except Exception as e:
            print(f"Error generating thread summary: {e}")
            return None

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