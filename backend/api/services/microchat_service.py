"""
Service for managing microchats - focused conversations about specific messages.
Uses Supabase as the database backend.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from ..services.database_service import DatabaseService
from ..services.llm_service import LLMService

class MicrochatService:
    def __init__(self):
        self.db = DatabaseService()
        self.llm = LLMService()

    async def create_microchat(self, parent_message_id: str, user_message: str, user_id: str) -> Dict[str, Any]:
        microchat_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        microchat_data = {
            "id": microchat_id,
            "parent_message_id": parent_message_id,
            "user_id": user_id,
            "created_at": now,
            "updated_at": now,
            "messages": [
                {"id": str(uuid.uuid4()), "role": "user", "content": user_message, "timestamp": now, "metadata": {}}
            ]
        }
        # Get context
        parent = await self.db.get_message(parent_message_id)
        if parent:
            microchat_data["context"] = {"content": parent.get("content"), "role": parent.get("role"), "timestamp": parent.get("timestamp", now)}
        # Generate assistant response
        try:
            res = await self.llm.generate_response(messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Question: {user_message}"}
            ])
            microchat_data["messages"].append({"id": str(uuid.uuid4()), "role": "assistant", "content": res, "timestamp": datetime.utcnow().isoformat(), "metadata": {}})
            return await self.db.create_microchat(microchat_data)
        except Exception:
            await self.db.delete_microchat(microchat_id)
            raise

    async def add_message(self, microchat_id: str, content: str, role: str = "user") -> Dict[str, Any]:
        msg = {"id": str(uuid.uuid4()), "role": role, "content": content, "timestamp": datetime.utcnow().isoformat(), "metadata": {}}
        if role == "user":
            mc = await self.db.get_microchat(microchat_id)
            if not mc:
                raise ValueError("Microchat not found")
            # Generate response
            history = [{"role": m["role"], "content": m["content"]} for m in mc.get("messages", [])]
            try:
                res = await self.llm.generate_response(messages=[{"role": "system", "content": "You are a helpful assistant."}, *history, {"role": "user", "content": content}])
                await self.db.add_microchat_message(microchat_id, msg)
                asm = {"id": str(uuid.uuid4()), "role": "assistant", "content": res, "timestamp": datetime.utcnow().isoformat(), "metadata": {}}
                await self.db.add_microchat_message(microchat_id, asm)
                return {"user_message": msg, "assistant_message": asm}
            except Exception:
                raise
        else:
            return {"message": await self.db.add_microchat_message(microchat_id, msg)}

    async def get_microchat(self, microchat_id: str) -> Optional[Dict[str, Any]]:
        return await self.db.get_microchat(microchat_id)

    async def search_microchats(self, query: str, user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        return await self.db.search_microchats(query, user_id, limit)

    async def delete_microchat(self, microchat_id: str) -> bool:
        return await self.db.delete_microchat(microchat_id)
