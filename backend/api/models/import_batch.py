from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from uuid import UUID, uuid4

class ImportBatch(BaseModel):
    """
    Model representing a batch of imported artefacts that should be grouped together.
    """
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    title: str
    created_at: datetime = Field(default_factory=datetime.now)
    artefact_count: int = 0
    chunks_processed: int = 0
    artefacts: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user_123",
                "title": "Research Papers Batch 1",
                "created_at": "2023-01-01T12:00:00Z",
                "artefact_count": 3,
                "chunks_processed": 45,
                "artefacts": [
                    {
                        "id": "source_1",
                        "type": "pdf",
                        "title": "Paper 1",
                        "chunks_processed": 15
                    },
                    {
                        "id": "source_2",
                        "type": "url",
                        "title": "Blog Post",
                        "chunks_processed": 20
                    },
                    {
                        "id": "source_3",
                        "type": "text",
                        "title": "Notes",
                        "chunks_processed": 10
                    }
                ],
                "metadata": {
                    "tags": ["research", "ai"],
                    "project": "Knowledge Base"
                }
            }
        }
