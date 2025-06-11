from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from .database_service import DatabaseService
from .llm_service import LLMService

class ThreadService:
    def __init__(self):
        self.db_service = DatabaseService()
        self.llm_service = LLMService()

    async def get_all_threads(self) -> List[Dict[str, Any]]:
        """Get all threads with summary information"""
        threads = await self.db_service.get_all_threads()
        
        thread_summaries = []
        for thread in threads:
            # Get chunk count for this thread
            chunks = [chunk for chunk in self.db_service.chunks.values() 
                     if chunk.get("thread_id") == thread["id"]]
            
            # Generate topics (mock for demo)
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

    async def get_thread_by_id(self, thread_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific thread with all its chunks"""
        thread = await self.db_service.get_thread(thread_id)
        if not thread:
            return None

        # Get chunks for this thread
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
            formatted_chunks.append(formatted_chunk)

        # Sort chunks by timestamp
        formatted_chunks.sort(key=lambda x: x["timestamp"])

        return {
            "id": thread["id"],
            "title": thread["title"],
            "chunks": formatted_chunks,
            "centroidEmbedding": thread.get("centroid_embedding"),
            "created_at": thread["created_at"],
            "updated_at": thread["updated_at"],
            "metadata": thread.get("metadata", {})
        }

    async def auto_generate_threads(self) -> Dict[str, Any]:
        """Automatically generate threads from unassigned chunks"""
        # For demo purposes, create a few sample threads
        sample_threads = [
            {
                "id": str(uuid.uuid4()),
                "title": "React Development Discussion",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "metadata": {"auto_generated": True}
            },
            {
                "id": str(uuid.uuid4()),
                "title": "AI and Machine Learning",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "metadata": {"auto_generated": True}
            }
        ]
        
        threads_created = 0
        for thread_data in sample_threads:
            await self.db_service.create_thread(thread_data)
            threads_created += 1
        
        return {
            "threads_created": threads_created,
            "chunks_processed": len(self.db_service.chunks)
        }

    async def get_thread_statistics(self) -> Dict[str, Any]:
        """Get statistics about threads"""
        threads = await self.db_service.get_all_threads()
        total_chunks = len(self.db_service.chunks)
        
        return {
            "totalThreads": len(threads),
            "totalChunks": total_chunks,
            "averageChunksPerThread": total_chunks / len(threads) if threads else 0,
            "threadsCreatedToday": len([t for t in threads if t["created_at"].date() == datetime.now().date()])
        }

    async def _generate_topics_for_thread(self, thread_id: str) -> List[str]:
        """Generate topics for a thread"""
        # For demo purposes, return mock topics
        # In production, this would analyze the thread content
        all_topics = [
            "React", "JavaScript", "AI/ML", "Career", "Productivity", 
            "Design", "Backend", "Database", "DevOps", "Mobile"
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