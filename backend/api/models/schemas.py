from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Import/Export Schemas
class ImportRequest(BaseModel):
    type: str
    url: Optional[str] = None
    title: Optional[str] = None

class ImportResponse(BaseModel):
    sourceId: str
    status: str
    message: str
    chunksProcessed: int = 0

# Conversation Schemas
class ChunkResponse(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    text: str
    timestamp: datetime
    participantLabel: Optional[str] = None
    modelName: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ConversationResponse(BaseModel):
    sourceId: str
    title: str
    sourceType: str
    chunks: List[ChunkResponse]
    metadata: Optional[Dict[str, Any]] = None

# Search Schemas
class SearchResult(BaseModel):
    id: str
    text_chunk: str
    similarity: float
    source: Dict[str, Any]
    participant_label: Optional[str] = None
    timestamp: datetime

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    aiResponse: Optional[str] = None
    totalResults: int

# Thread Schemas
class ThreadSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    chunkCount: int
    topics: List[str]
    metadata: Optional[Dict[str, Any]] = None

class ThreadResponse(BaseModel):
    id: str
    title: str
    chunks: List[ChunkResponse]
    centroidEmbedding: Optional[List[float]] = None
    created_at: datetime
    updated_at: datetime
    metadata: Optional[Dict[str, Any]] = None

# Micro-thread Schemas
class MicroThreadRequest(BaseModel):
    chunkId: str
    question: str
    context: Optional[str] = None

class MicroThreadResponse(BaseModel):
    threadId: str
    answer: str
    modelUsed: str
    timestamp: datetime