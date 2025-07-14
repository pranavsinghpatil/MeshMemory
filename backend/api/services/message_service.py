from typing import List, Dict, Any, Optional
from ..services.database_service import DatabaseService

class MessageService:
    def __init__(self):
        self.db = DatabaseService()

    async def list_messages(self, source_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        return await self.db.list_messages(source_id, limit, offset)

    async def get_message(self, message_id: str) -> Optional[Dict[str, Any]]:
        return await self.db.get_message(message_id)

    async def create_message(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.db.create_message(data)
