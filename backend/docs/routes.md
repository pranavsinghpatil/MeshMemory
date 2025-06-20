# API Routes Documentation

## Table of Contents
- [Authentication](#authentication)
- [Conversations](#conversations)
- [Messages](#messages)
- [Import](#import)
- [Merge](#merge)
- [Search](#search)
- [User Settings](#user-settings)
- [Analytics](#analytics)
- [Data Management](#data-management)

## Authentication

### `POST /auth/token`
Generate JWT token for authentication.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer"
}
```

## Conversations

### `GET /conversations`
List all conversations with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)

**Response (200 OK):**
```json
{
  "items": [{
    "id": "uuid",
    "title": "Conversation Title",
    "created_at": "2023-06-20T10:00:00Z",
    "updated_at": "2023-06-20T10:30:00Z",
    "is_hybrid": false
  }],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

### `POST /conversations`
Create a new conversation.

**Request:**
```json
{
  "title": "New Conversation",
  "initial_message": "Hello!"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "title": "New Conversation",
  "created_at": "2023-06-20T10:00:00Z",
  "updated_at": "2023-06-20T10:00:00Z",
  "is_hybrid": false
}
```

## Messages

### `GET /conversations/{conversation_id}/messages`
Get messages in a conversation.

**Response (200 OK):**
```json
{
  "items": [{
    "id": "msg_uuid",
    "content": "Hello!",
    "role": "user",
    "timestamp": "2023-06-20T10:05:00Z"
  }],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

## Import

### `POST /import`
Import content from various sources.

**Supported Types:**
- `copy_paste`: Plain text
- `html`: HTML content
- `pdf`: PDF files
- `screenshot`: Images with OCR
- `link`: Web page URLs

**Example (Text Import):**
```http
POST /import
Content-Type: multipart/form-data

{
  "type": "copy_paste",
  "title": "My Notes",
  "text": "Important notes..."
}
```

## Merge

### `POST /merge`
Merge multiple conversations into a hybrid chat.

**Request:**
```json
{
  "title": "Merged Discussion",
  "source_ids": ["uuid1", "uuid2"]
}
```

**Response (201 Created):**
```json
{
  "hybrid_chat_id": "new_uuid",
  "title": "Merged Discussion",
  "source_ids": ["uuid1", "uuid2"],
  "created_at": "2023-06-20T11:00:00Z"
}
```

## Search

### `GET /search`
Search across conversations and messages.

**Query Parameters:**
- `q`: Search query
- `conversation_id`: Filter by conversation
- `limit`: Max results (default: 10)

## User Settings

### `GET /user/settings`
Get user preferences and settings.

### `PUT /user/settings`
Update user settings.

## Analytics

### `GET /analytics/usage`
Get usage statistics.

## Data Management

### `POST /data/export`
Export user data.

### `DELETE /data`
Delete user data.
