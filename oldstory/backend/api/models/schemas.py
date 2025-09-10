from pydantic import BaseModel, Field, EmailStr, validator, root_validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from fastapi import UploadFile
import uuid

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

# Microchat Schemas
class MicrochatCreate(BaseModel):
    parent_message_id: str = Field(..., description="ID of the parent message")
    user_message: str = Field(..., min_length=1, max_length=1000, description="Initial user message")
    is_branch: bool = Field(False, description="Whether this is a branch microchat")
    parent_chat_id: Optional[str] = Field(None, description="ID of the parent chat (required if is_branch=True)")
    branch_type: Optional[str] = Field(None, description="Type of branch (deep-dive, refactor, translate, summarize, custom)")

    @validator('parent_message_id', 'parent_chat_id')
    def validate_id(cls, v, values):
        if v is None and 'is_branch' in values and values['is_branch'] and values.get('parent_chat_id') is None:
            # Only validate parent_chat_id if is_branch is True
            if v is None and values.get('parent_chat_id') is None:
                return v
        
        if v is not None:
            try:
                uuid.UUID(v)
                return v
            except ValueError:
                field_name = 'parent_message_id' if v == values.get('parent_message_id') else 'parent_chat_id'
                raise ValueError(f"Invalid UUID format for {field_name}")
        return v
    
    @validator('branch_type')
    def validate_branch_type(cls, v, values):
        if v is not None and values.get('is_branch'):
            valid_types = ['deep-dive', 'refactor', 'translate', 'summarize', 'custom']
            if v not in valid_types:
                raise ValueError(f"branch_type must be one of {valid_types}")
        return v
        
    @root_validator
    def validate_branch_fields(cls, values):
        is_branch = values.get('is_branch')
        parent_chat_id = values.get('parent_chat_id')
        branch_type = values.get('branch_type')
        
        if is_branch:
            if not parent_chat_id:
                raise ValueError("parent_chat_id is required when is_branch is True")
            if not branch_type:
                raise ValueError("branch_type is required when is_branch is True")
        
        return values

class MessageCreate(BaseModel):
    """Model for creating a new message in a microchat."""
    content: str = Field(..., min_length=1, max_length=10000, description="The message content")
    role: str = Field("user", description="The role of the message sender (e.g., 'user' or 'assistant')")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata for the message")

    @validator('role')
    def validate_role(cls, v):
        valid_roles = ['user', 'assistant', 'system']
        if v not in valid_roles:
            raise ValueError(f"role must be one of {valid_roles}")
        return v

class MicrochatResponse(BaseModel):
    id: str
    parent_message_id: str
    user_id: str
    created_at: Union[datetime, str]
    updated_at: Union[datetime, str]
    messages: List[Dict[str, Any]]
    context: Dict[str, Any]
    is_branch: bool = False
    branch_status: Optional[str] = None
    promoted_to_message_id: Optional[str] = None
    title: Optional[str] = None



class DeleteMicrochatRequest(BaseModel):
    microchat_id: str

class UpdateBranchStatusRequest(BaseModel):
    microchat_id: str
    status: str
    
    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['ephemeral', 'pinned']
        if v not in valid_statuses:
            raise ValueError(f"status must be one of {valid_statuses}")
        return v
    
    @validator('microchat_id')
    def validate_id(cls, v):
        try:
            uuid.UUID(v)
            return v
        except ValueError:
            raise ValueError("Invalid UUID format for microchat_id")

class PromoteBranchRequest(BaseModel):
    microchat_id: str
    
    @validator('microchat_id')
    def validate_id(cls, v):
        try:
            uuid.UUID(v)
            return v
        except ValueError:
            raise ValueError("Invalid UUID format for microchat_id")

class BranchesResponse(BaseModel):
    branches: List[MicrochatResponse]

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

