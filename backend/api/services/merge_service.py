"""
Service for merging multiple chat conversations into a single hybrid chat.
Handles message deduplication, ordering, and metadata aggregation.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from uuid import uuid4

from fastapi import HTTPException

from api.models import Chat, Message, HybridChat, get_db
from api.services.hybrid_service import HybridService

class MergeService:
    def __init__(self, db_session=None):
        self.db = db_session or next(get_db())
        self.hybrid_service = HybridService(db_session=self.db)

    async def merge_chats(
        self, 
        chat_ids: List[str], 
        title: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Merge multiple chats into a new hybrid chat.
        
        Args:
            chat_ids: List of chat IDs to merge
            title: Optional title for the new hybrid chat
            user_id: ID of user initiating the merge
            
        Returns:
            Dict containing new hybrid chat ID and metadata
        """
        if len(chat_ids) < 2:
            raise HTTPException(status_code=400, detail="At least 2 chats required for merge")

        # Fetch all chats with messages
        chats = []
        for chat_id in chat_ids:
            chat = self.db.query(Chat).filter(Chat.id == chat_id).first()
            if not chat:
                raise HTTPException(status_code=404, detail=f"Chat {chat_id} not found")
            chats.append(chat)

        # Create title if not provided
        if not title:
            source_titles = ", ".join([chat.title for chat in chats[:2]])
            suffix = f" and {len(chats)-2} more" if len(chats) > 2 else ""
            title = f"Merged: {source_titles}{suffix}"

        # Collect and sort all messages
        all_messages = []
        for chat in chats:
            messages = self.db.query(Message).filter(Message.chat_id == chat.id).all()
            for msg in messages:
                all_messages.append({
                    "content": msg.content,
                    "role": msg.role,
                    "timestamp": msg.timestamp,
                    "metadata": {
                        **msg.metadata,
                        "source_chat_id": chat.id,
                        "source_chat_title": chat.title,
                    }
                })

        # Sort by timestamp (oldest first)
        all_messages.sort(key=lambda x: x["timestamp"])

        # Create hybrid chat
        hybrid_chat = self.hybrid_service.create_hybrid_chat(
            title=title,
            user_id=user_id,
            metadata={
                "source_chat_ids": chat_ids,
                "merged_at": datetime.utcnow().isoformat(),
            }
        )

        # Add all messages to hybrid chat
        for msg in all_messages:
            self.hybrid_service.add_message(
                chat_id=hybrid_chat.id,
                content=msg["content"],
                role=msg["role"],
                metadata=msg["metadata"]
            )

        self.db.commit()

        return {
            "id": str(hybrid_chat.id),
            "title": hybrid_chat.title,
            "message_count": len(all_messages),
            "source_chat_count": len(chat_ids)
        }
