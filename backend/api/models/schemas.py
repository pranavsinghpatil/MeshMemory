from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
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
    microThreads: Optional[List[Any]] = None

class ConversationResponse(BaseModel):
    sourceId: str
    title: str
    sourceType: str
    chunks: List[ChunkResponse]
    metadata: Optional[Dict[str, Any]] = None
    summary: Optional[str] = None

# Search Schemas
class SearchResult(BaseModel):
    id: str
    text_chunk: str
    similarity: float
    source: Dict[str, Any]
    participant_label: Optional[str] = None
    timestamp: Union[datetime, str]

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    aiResponse: Optional[str] = None
    totalResults: int
    metadata: Optional[Dict[str, Any]] = None

# Thread Schemas
class ThreadSummary(BaseModel):
    id: str
    title: str
    created_at: Union[datetime, str]
    updated_at: Union[datetime, str]
    chunkCount: int
    topics: List[str]
    metadata: Optional[Dict[str, Any]] = None

class ThreadResponse(BaseModel):
    id: str
    title: str
    chunks: List[ChunkResponse]
    centroidEmbedding: Optional[List[float]] = None
    created_at: Union[datetime, str]
    updated_at: Union[datetime, str]
    metadata: Optional[Dict[str, Any]] = None
    summary: Optional[str] = None

class MergeThreadRequest(BaseModel):
    targetThreadId: str

class SplitThreadRequest(BaseModel):
    chunkId: str

# Chat Schemas
class ChatListResponse(BaseModel):
    id: str
    title: str
    sourceType: str
    importDate: Union[datetime, str]
    chunkCount: int
    metadata: Optional[Dict[str, Any]] = None

class NewChatRequest(BaseModel):
    title: str = "New Chat"
    source_type: str = "manual"
    chat_id: Optional[str] = None  # Optional custom chat_id
    metadata: Optional[Dict[str, Any]] = None

class NewChatResponse(BaseModel):
    id: str
    title: str
    sourceType: str
    createdAt: Union[datetime, str]
    updatedAt: Union[datetime, str]
    metadata: Optional[Dict[str, Any]] = None

class MergeChatRequest(BaseModel):
    chatIds: List[str]
    title: str

# Micro-thread Schemas
class MicroThreadRequest(BaseModel):
    parentThreadId: str
    selectedText: str
    query: str
    contextBefore: Optional[str] = None
    contextAfter: Optional[str] = None
    responseChunkId: str  # ID of the chunk containing the selected text
    title: Optional[str] = None

class MicroThreadResponse(BaseModel):
    id: str
    parentThreadId: str
    title: str
    query: str
    selectedText: str
    answer: Optional[str] = None
    createdAt: Union[datetime, str]
    modelUsed: Optional[str] = None

# User Settings Schemas
class ApiKeyData(BaseModel):
    openai: Optional[str] = None
    gemini: Optional[str] = None
    claude: Optional[str] = None

class UserPreferences(BaseModel):
    defaultModel: str = "gpt-4"
    autoThreadGeneration: bool = True
    searchResultsCount: int = 10

class UserSettings(BaseModel):
    userId: str
    theme: str = "system"
    notificationsEnabled: bool = True
    apiKeys: Optional[ApiKeyData] = None
    preferences: Optional[UserPreferences] = None
    createdAt: Union[datetime, str]
    updatedAt: Union[datetime, str]

# Usage Logs Schema
class UsageLog(BaseModel):
    id: str
    userId: Optional[str] = None
    modelUsed: str
    promptTokens: int
    completionTokens: int
    totalTokens: int
    latencyMs: int
    success: bool
    errorMessage: Optional[str] = None
    timestamp: Union[datetime, str]

# Thread Changelog Schema
class ThreadChangelogEntry(BaseModel):
    id: str
    threadId: str
    changeType: str  # "merge", "split", "create", "update", "delete"
    description: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Union[datetime, str]