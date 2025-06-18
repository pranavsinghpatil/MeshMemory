"""
Pydantic models for Hybrid Chat related requests and responses.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class HybridChatCreate(BaseModel):
    """Request model for creating a new hybrid chat."""
    title: str = Field(..., description="Title for the new hybrid chat")
    chatIds: List[str] = Field(..., min_items=2, alias="chatIds", description="List of source chat IDs to merge")

class HybridChatResponse(BaseModel):
    """Response model for hybrid chat data."""
    message: str = Field(..., description="Status message")
    hybridChatId: str = Field(..., description="Unique identifier for the hybrid chat")
    title: str = Field(..., description="Title of the hybrid chat")
    chunkCount: int = Field(..., description="Number of chunks in the hybrid chat")
    sourceChats: List[str] = Field(..., description="List of source chat IDs that were merged")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Chats merged successfully into hybrid chat",
                "hybridChatId": "hy_1234567890abcdef",
                "title": "Merged Project Discussion",
                "chunkCount": 42,
                "sourceChats": ["src_123", "src_456"]
            }
        }

class HybridChatDetailResponse(HybridChatResponse):
    """Extended response model with hybrid chat chunks and metadata."""
    chunks: List[Dict[str, Any]] = Field(..., description="List of chat chunks in the hybrid chat")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the hybrid chat")
    createdAt: str = Field(..., description="ISO 8601 timestamp when the hybrid chat was created")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Chats merged successfully into hybrid chat",
                "hybridChatId": "hy_1234567890abcdef",
                "title": "Merged Project Discussion",
                "chunkCount": 2,
                "sourceChats": ["src_123", "src_456"],
                "createdAt": "2025-06-17T10:30:00Z",
                "chunks": [
                    {
                        "id": "chk_123",
                        "text_chunk": "First message in the merged chat",
                        "participant_label": "User",
                        "metadata": {
                            "original_chunk_id": "orig_123",
                            "original_source_id": "src_123"
                        }
                    },
                    {
                        "id": "chk_456",
                        "text_chunk": "Second message from another source",
                        "participant_label": "Assistant",
                        "metadata": {
                            "original_chunk_id": "orig_456",
                            "original_source_id": "src_456"
                        }
                    }
                ],
                "metadata": {
                    "source_types": ["chatgpt", "claude"],
                    "import_methods": ["link", "screenshot"]
                }
            }
        }
