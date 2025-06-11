from typing import Dict, Any, List
import uuid
from datetime import datetime
from .database_service import DatabaseService
from .llm_service import LLMService

class MicroThreadService:
    def __init__(self):
        self.db_service = DatabaseService()
        self.llm_service = LLMService()

    async def create_micro_thread(
        self, 
        chunk_id: str, 
        question: str, 
        context: str = None
    ) -> Dict[str, Any]:
        """Create a micro-thread (follow-up conversation)"""
        
        # Get the original chunk for context
        chunk = self.db_service.chunks.get(chunk_id)
        if not chunk:
            raise ValueError("Chunk not found")
        
        # Prepare context for LLM
        chunk_context = chunk["text_chunk"]
        if context:
            full_context = f"{chunk_context}\n\nAdditional context: {context}"
        else:
            full_context = chunk_context
        
        # Generate response using LLM
        llm_response = await self.llm_service.route_to_llm(
            prompt=question,
            context=full_context,
            system_prompt="You are a helpful assistant answering follow-up questions about AI conversation content. Be concise and reference the context when relevant."
        )
        
        # Create micro-thread record
        micro_thread_id = str(uuid.uuid4())
        micro_thread_data = {
            "id": micro_thread_id,
            "parent_chunk_id": chunk_id,
            "user_prompt": question,
            "assistant_response": llm_response["responseText"],
            "model_used": llm_response["modelUsed"],
            "created_at": datetime.now(),
            "metadata": {"context_provided": bool(context)}
        }
        
        await self.db_service.create_micro_thread(micro_thread_data)
        
        return {
            "thread_id": micro_thread_id,
            "answer": llm_response["responseText"],
            "model_used": llm_response["modelUsed"],
            "timestamp": micro_thread_data["created_at"]
        }

    async def get_micro_threads_by_chunk(self, chunk_id: str) -> List[Dict[str, Any]]:
        """Get all micro-threads for a specific chunk"""
        micro_threads = await self.db_service.get_micro_threads_by_chunk(chunk_id)
        
        formatted_threads = []
        for mt in micro_threads:
            formatted_thread = {
                "id": mt["id"],
                "userPrompt": mt["user_prompt"],
                "assistantResponse": mt["assistant_response"],
                "modelUsed": mt["model_used"],
                "createdAt": mt["created_at"],
                "metadata": mt.get("metadata", {})
            }
            formatted_threads.append(formatted_thread)
        
        return sorted(formatted_threads, key=lambda x: x["createdAt"])