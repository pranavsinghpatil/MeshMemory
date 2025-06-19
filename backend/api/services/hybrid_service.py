"""
Service for managing hybrid chats created by merging multiple chat sources.
"""
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from .database_service import DatabaseService

class HybridChatService:
    def __init__(self):
        self.db_service = DatabaseService()
    
    async def create_hybrid_chat(self, title: str, source_ids: List[str]) -> Dict[str, Any]:
        """
        Create a new hybrid chat by merging multiple source chats.
        
        Args:
            title: Title for the new hybrid chat
            source_ids: List of source chat IDs to merge
            
        Returns:
            Dictionary containing the new hybrid chat's metadata
        """
        hybrid_chat_id = str(uuid.uuid4())
        now = datetime.now()
        now_iso = now.isoformat()
        
        # Create hybrid chat record with proper is_hybrid flag
        hybrid_chat = {
            "id": hybrid_chat_id,
            "title": title,
            "type": "chatgpt-link",  # Using a valid type that exists in the database
            "created_at": now,
            "updated_at": now,
            "is_hybrid": True,  # Use the dedicated column
            "metadata": {
                "import_method": "hybrid-merge",  # Custom identifier for merged chats
                "merged_from": source_ids,       # Track original source chats
                "source_type": "hybrid"         # For backward compatibility
            }
        }
        
        # Get all chunks from source chats
        all_chunks = []
        for source_id in source_ids:
            chunks = await self.db_service.get_chunks_by_source(source_id)
            all_chunks.extend(chunks)
        
        # Sort chunks by timestamp if available
        all_chunks.sort(key=lambda x: x.get("timestamp", ""))
        
        # Create new chunks for the hybrid chat
        for i, chunk in enumerate(all_chunks, 1):
            chunk_data = {
                "id": str(uuid.uuid4()),
                "source_id": hybrid_chat_id,
                "text_chunk": chunk["text_chunk"],
                "embedding": chunk.get("embedding"),  # Copy the embedding
                "participant_label": chunk.get("participant_label"),
                "model_name": chunk.get("model_name"),
                "timestamp": chunk.get("timestamp") or now,
                "artefact_id": hybrid_chat_id,  # Use hybrid chat ID as artefact ID
                "artefact_order": i,  # Maintain order in the hybrid chat
                "metadata": {
                    **chunk.get("metadata", {}),
                    "original_chunk_id": chunk["id"],
                    "original_source_id": chunk["source_id"],
                    "merged_at": now_iso
                }
            }
            await self.db_service.create_chunk(chunk_data)
        
        # Store the hybrid chat record
        await self.db_service.create_source(hybrid_chat)
        
        # Create entry in hybrid_chats table
        hybrid_chat_entry = {
            "id": hybrid_chat_id,
            "merged_from": source_ids,
            "created_at": now,
            "merged_by": None  # Will be set from the API route
        }
        
        try:
            # Insert into the hybrid_chats table
            self.db_service.supabase.table('hybrid_chats').insert(hybrid_chat_entry).execute()
        except Exception as e:
            print(f"Error creating hybrid_chats entry: {e}")
            # Continue anyway as the main chat record is created
        
        return {
            "message": "Chats merged successfully into hybrid chat",
            "hybridChatId": hybrid_chat_id,
            "title": title,
            "chunkCount": len(all_chunks),
            "sourceChats": source_ids,
            "createdAt": now_iso
        }
    
    async def get_hybrid_chat(self, hybrid_chat_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a hybrid chat by ID with all its chunks.
        """
        try:
            # Log the attempt to fetch the hybrid chat
            print(f"[DEBUG] Fetching hybrid chat with ID: {hybrid_chat_id}")
            
            # Try to get the hybrid chat from the database
            hybrid_chat = await self.db_service.get_source(hybrid_chat_id)
            
            # Debug log the result
            print(f"[DEBUG] Raw hybrid chat from DB: {hybrid_chat}")
            
            # Check if the chat exists and is a hybrid chat
            if not hybrid_chat:
                print(f"[DEBUG] No chat found with ID: {hybrid_chat_id}")
                return None
                
            # Check if it's a hybrid chat by looking at metadata
            meta = hybrid_chat.get("metadata", {})
            if not isinstance(meta, dict):
                meta = {}
                
            is_hybrid = meta.get("is_hybrid") or meta.get("import_method") == "hybrid-merge"
            
            if not is_hybrid:
                print(f"[DEBUG] Chat {hybrid_chat_id} is not a hybrid chat. Metadata: {meta}")
                return None
            
            # Get all chunks for this hybrid chat
            print(f"[DEBUG] Fetching chunks for hybrid chat: {hybrid_chat_id}")
            chunks = await self.db_service.get_chunks_by_source(hybrid_chat_id)
            print(f"[DEBUG] Found {len(chunks)} chunks for hybrid chat {hybrid_chat_id}")
            
            # Prepare the response
            response = {
                "hybridChatId": hybrid_chat.get("id"),
                "title": hybrid_chat.get("title"),
                "chunkCount": len(chunks),
                "sourceChats": hybrid_chat.get("metadata", {}).get("merged_from", []),
                "createdAt": hybrid_chat.get("created_at"),
                "chunks": chunks,
                "metadata": hybrid_chat.get("metadata", {})
            }
            
            return response
            
        except Exception as e:
            # Log the full error for debugging
            import traceback
            error_trace = traceback.format_exc()
            print(f"[ERROR] Failed to get hybrid chat {hybrid_chat_id}: {str(e)}\n{error_trace}")
            # Re-raise the exception to be handled by the route
            raise
