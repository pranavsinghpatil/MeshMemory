from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
from .database_service import DatabaseService
from .llm_service import LLMService

class ConversationService:
    def __init__(self):
        self.db_service = DatabaseService()
        self.llm_service = LLMService()

    async def get_conversation_by_source(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Get full conversation data for a source"""
        source = await self.db_service.get_source(source_id)
        if not source:
            return None

        chunks = await self.db_service.get_chunks_by_source(source_id)
        
        # Convert chunks to response format
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
            "sourceId": source_id,
            "title": source["title"],
            "sourceType": source["type"],
            "chunks": formatted_chunks,
            "metadata": source.get("metadata", {})
        }

    async def get_chunks_by_source(self, source_id: str) -> List[Dict[str, Any]]:
        """Get chunks for a source"""
        chunks = await self.db_service.get_chunks_by_source(source_id)
        
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

        return sorted(formatted_chunks, key=lambda x: x["timestamp"])

    async def get_source_metadata(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a source"""
        source = await self.db_service.get_source(source_id)
        if not source:
            return None

        chunk_count = await self.db_service.count_chunks_by_source(source_id)

        return {
            "id": source["id"],
            "title": source["title"],
            "type": source["type"],
            "url": source.get("url"),
            "createdAt": source["created_at"],
            "chunkCount": chunk_count,
            "metadata": source.get("metadata", {})
        }
        
    async def generate_conversation_summary(self, source_id: str) -> Optional[str]:
        """Generate a summary of the conversation"""
        chunks = await self.db_service.get_chunks_by_source(source_id)
        if not chunks:
            return None
            
        # Concatenate chunks for summarization
        # Limit to first 10 chunks to avoid token limits
        text_chunks = [chunk["text_chunk"] for chunk in chunks[:10]]
        conversation_text = "\n\n".join(text_chunks)
        
        # Generate summary using LLM
        summary = await self.llm_service.generate_summary(conversation_text)
        return summary

    def _determine_role(self, participant_label: str) -> str:
        """Determine if participant is user or assistant"""
        if not participant_label:
            return "user"
        
        participant_lower = participant_label.lower()
        if any(term in participant_lower for term in ["user", "human", "you"]):
            return "user"
        else:
            return "assistant"