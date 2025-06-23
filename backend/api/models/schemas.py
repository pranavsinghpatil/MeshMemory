from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from fastapi import UploadFile

# Import/Export Schemas
class ImportRequest(BaseModel):
    type: str
    url: Optional[str] = None
    title: Optional[str] = None

class ImportGroupedRequest(BaseModel):
    userId: str
    artefacts: List[ImportRequest]
    importBatchTitle: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ImportGroupedResponse(BaseModel):
    importBatchId: str
    chunksProcessed: int
    artefactCount: int
    status: str

class ImportRequest(BaseModel):
    type: str
    url: Optional[str] = None
    title: Optional[str] = None

class HybridChatRequest(BaseModel):
    """Request model for creating a hybrid chat by merging multiple chats."""
    chat_ids: List[str] = Field(..., description="List of chat IDs to merge")
    title: str = Field(..., description="Title for the new hybrid chat")
    metadata: Optional[Dict[str, Any]] = Field(
        None, 
        description="Additional metadata for the hybrid chat"
    )
    sort_method: str = Field(
        "timestamp", 
        description="How to sort messages: 'timestamp', 'artefact_order', or 'custom'"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "chat_ids": ["chat_1", "chat_2", "chat_3"],
                "title": "Merged Research Chats",
                "metadata": {"tags": ["research", "ai"]},
                "sort_method": "timestamp"
            }
        }

class ImportBatch(BaseModel):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    title: Optional[str] = None
    artefact_count: int = 0
    metadata: Optional[Dict[str, Any]] = None

class ImportResponse(BaseModel):
    sourceId: str
    chatId: str  # Chat created for this import
    status: str
    message: str
    chunksProcessed: int = 0
    isHybridCandidate: bool = False  # Can this be part of a hybrid chat?
    hybridCompatibleWith: Optional[List[str]] = None  # List of compatible chat IDs

# Conversation Schemas
class ChunkResponse(BaseModel):
    import_batch_id: Optional[str] = None  # For grouped import: batch/group UUID
    id: str
    role: str  # "user" or "assistant"
    text: str
    timestamp: datetime
    participantLabel: Optional[str] = None
    modelName: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    microThreads: Optional[List[Any]] = None
    artefactId: Optional[str] = None  # For grouped import: which artefact/file this message came from
    artefactOrder: Optional[int] = None  # Order of artefact in import batch


class ConversationResponse(BaseModel):
    import_batch_id: Optional[str] = None  # For grouped import
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

# # Thread Schemas  [Not used]
# class ThreadSummary(BaseModel):
#     id: str
#     title: str
#     created_at: Union[datetime, str]
#     updated_at: Union[datetime, str]
#     chunkCount: int
#     topics: List[str]
#     metadata: Optional[Dict[str, Any]] = None

# class ThreadResponse(BaseModel): 
#     id: str
#     title: str
#     chunks: List[ChunkResponse]
#     centroidEmbedding: Optional[List[float]] = None
#     created_at: Union[datetime, str]
#     updated_at: Union[datetime, str]
#     metadata: Optional[Dict[str, Any]] = None
#     summary: Optional[str] = None

# class MergeThreadRequest(BaseModel):
#     targetThreadId: str

# class SplitThreadRequest(BaseModel):
#     chunkId: str

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
    isHybrid: bool = False  # True if this chat is a hybrid/merged chat


class MergeChatRequest(BaseModel):
    chatIds: List[str]
    title: str

# Auth Schemas
from typing import Dict, Any, Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str = ""
    expires_in: int
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False

class UserSession(BaseModel):
    user: Dict[str, Any]
    session: Dict[str, Any]
    error: Optional[str] = None

# Micro-thread Schemas  [Not used]
# class MicroThreadRequest(BaseModel):
#     parentThreadId: str
#     selectedText: str
#     query: str
#     contextBefore: Optional[str] = None
#     contextAfter: Optional[str] = None
#     responseChunkId: str  # ID of the chunk containing the selected text
#     title: Optional[str] = None

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

# Thread Changelog Schema  [Not used]
# class ThreadChangelogEntry(BaseModel):
#     id: str
#     threadId: str
#     changeType: str  # "merge", "split", "create", "update", "delete"
#     description: str
#     metadata: Optional[Dict[str, Any]] = None
#     timestamp: Union[datetime, str]