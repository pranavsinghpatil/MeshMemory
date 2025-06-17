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
        return {
            "id": source["id"],
            "title": source.get("title", "Untitled"),
            "chunks": chunks,
            "created_at": source.get("created_at"),
            "metadata": source.get("metadata", {})
        }
            
    async def list_imported_chats(self, limit: int = 50, offset: int = 0, source_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all imported chats with pagination and optional filtering.
        
        Args:
            limit: Maximum number of chats to return
            offset: Offset for pagination
            source_type: Optional filter by source type (e.g., 'chatgpt', 'hybrid', 'claude', etc.)
        
        Returns:
            List of chat objects with metadata and consistent source types
        """
        try:
            # Normalize source_type for consistent filtering
            normalized_source_type = None
            if source_type:
                normalized_source_type = source_type.lower()
                # Map 'hybrid' to the correct filter value
                if normalized_source_type == 'hybrid':
                    normalized_source_type = 'hybrid'
                # Map 'chatgpt' to include both 'chatgpt' and 'chatgpt-link'
                elif normalized_source_type == 'chatgpt':
                    normalized_source_type = 'chatgpt'
            
            # Get chats from the database with the specified filters
            chats = await self.db_service.list_imported_chats(limit, offset, normalized_source_type)
            
            # Ensure consistent response format
            formatted_chats = []
            for chat in chats:
                # Ensure metadata is always a dict with import_method
                meta = chat.get("metadata", {}) or {}
                if not isinstance(meta, dict):
                    meta = {"import_method": "manual", "original_metadata": meta}
                
                # Get source type from the database result
                source_type_value = chat.get("sourceType", "unknown")
                
                # For hybrid chats, ensure consistent type
                is_hybrid = meta.get("is_hybrid") or meta.get("import_method") == "hybrid-merge"
                if is_hybrid:
                    source_type_value = "hybrid"
                
                # Ensure import_method is always set
                if "import_method" not in meta:
                    meta["import_method"] = source_type_value
                
                formatted_chats.append({
                    "id": chat["id"],
                    "title": chat.get("title", "Untitled"),
                    "sourceType": source_type_value,
                    "importDate": chat.get("importDate"),
                    "chunkCount": chat.get("chunkCount", 0),
                    "metadata": meta
                })
            
            return formatted_chats
            
        except Exception as e:
            # Log the error for debugging
            print(f"Error listing imported chats: {str(e)}")
            raise
        
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