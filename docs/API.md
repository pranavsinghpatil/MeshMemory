# MeshMemory API Documentation

## Overview

The MeshMemory API provides comprehensive endpoints for managing AI conversations, performing semantic search, and generating insights. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, the API uses Supabase authentication. Include the user's JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message description",
  "status_code": 400
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Endpoints

### Import API

#### Import Source
Import conversations from various platforms.

```http
POST /import
Content-Type: multipart/form-data

type: string (required) - Source type: "chatgpt", "claude", "gemini", "youtube"
url: string (optional) - URL for chatgpt/youtube imports
title: string (optional) - Custom title for the source
file: file (optional) - File for claude/gemini imports
```

**Response:**
```json
{
  "sourceId": "uuid",
  "status": "success",
  "message": "Successfully imported chatgpt source",
  "chunksProcessed": 15
}
```

#### Get Import Status
Check the status of an import operation.

```http
GET /import/status/{source_id}
```

**Response:**
```json
{
  "sourceId": "uuid",
  "status": "completed",
  "chunksProcessed": 15,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Search API

#### Basic Search
Perform semantic search across conversations.

```http
GET /search?q={query}&limit={limit}&threshold={threshold}

q: string (required) - Search query
limit: integer (optional, default: 10) - Number of results
threshold: float (optional, default: 0.7) - Similarity threshold
```

**Response:**
```json
{
  "query": "React hooks",
  "results": [
    {
      "id": "chunk-uuid",
      "text_chunk": "React hooks are functions that...",
      "similarity": 0.85,
      "source": {
        "id": "source-uuid",
        "title": "React Tutorial",
        "type": "chatgpt-link",
        "created_at": "2024-01-01T00:00:00Z"
      },
      "participant_label": "Assistant",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "aiResponse": "Based on your conversations, React hooks are...",
  "totalResults": 1,
  "metadata": {
    "processingTimeMs": 150,
    "threshold": 0.7
  }
}
```

#### Enhanced Search
Advanced search with filters and multiple search modes.

```http
GET /search/enhanced?q={query}&search_type={type}&source_types={types}&date_from={date}&date_to={date}&participant={participant}

q: string (required) - Search query
search_type: string (optional, default: "hybrid") - "semantic", "text", or "hybrid"
source_types: array (optional) - Filter by source types
date_from: datetime (optional) - Filter from date
date_to: datetime (optional) - Filter to date
participant: string (optional) - Filter by participant
limit: integer (optional, default: 10) - Number of results
threshold: float (optional, default: 0.7) - Similarity threshold
```

#### Search Suggestions
Get search suggestions based on partial query.

```http
GET /search/suggestions?q={partial_query}&limit={limit}

q: string (required) - Partial query
limit: integer (optional, default: 5) - Number of suggestions
```

**Response:**
```json
{
  "suggestions": [
    "What did I learn about React?",
    "Show me discussions about AI"
  ]
}
```

### Conversations API

#### Get Conversation
Retrieve full conversation data for a source.

```http
GET /conversations/{source_id}?include_micro_threads={boolean}

include_micro_threads: boolean (optional, default: true) - Include micro-threads
```

**Response:**
```json
{
  "sourceId": "uuid",
  "title": "React Tutorial Discussion",
  "sourceType": "chatgpt-link",
  "chunks": [
    {
      "id": "chunk-uuid",
      "role": "user",
      "text": "How do React hooks work?",
      "timestamp": "2024-01-01T00:00:00Z",
      "participantLabel": "User",
      "modelName": null,
      "metadata": {},
      "microThreads": []
    }
  ],
  "metadata": {}
}
```

#### Get Conversation Summary
Get AI-generated summary for a conversation.

```http
GET /conversations/{source_id}/summary
```

**Response:**
```json
{
  "sourceId": "uuid",
  "summary": "This conversation covers React hooks fundamentals..."
}
```

### Threads API

#### Get All Threads
Retrieve all conversation threads.

```http
GET /threads
```

**Response:**
```json
[
  {
    "id": "thread-uuid",
    "title": "React Best Practices",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z",
    "chunkCount": 15,
    "topics": ["React", "JavaScript", "Performance"],
    "metadata": {}
  }
]
```

#### Get Thread
Retrieve a specific thread with chunks.

```http
GET /threads/{thread_id}?include_chunks={boolean}&include_summary={boolean}

include_chunks: boolean (optional, default: true) - Include chunks
include_summary: boolean (optional, default: true) - Include summary
```

#### Get Thread Summary
Get or generate thread summary.

```http
GET /threads/{thread_id}/summary?regenerate={boolean}

regenerate: boolean (optional, default: false) - Force regenerate summary
```

**Response:**
```json
{
  "threadId": "uuid",
  "summary": "This thread discusses React best practices...",
  "keyTopics": ["React", "Performance", "Hooks"],
  "generatedAt": "2024-01-01T00:00:00Z",
  "modelUsed": "gpt-4",
  "confidenceScore": 0.85
}
```

#### Regenerate Thread Summary
Force regenerate thread summary.

```http
POST /threads/{thread_id}/summary/regenerate
```

#### Merge Threads
Merge two threads together.

```http
POST /threads/{thread_id}/merge
Content-Type: application/json

{
  "targetThreadId": "target-thread-uuid"
}
```

#### Split Thread
Split a thread at a specific chunk.

```http
POST /threads/{thread_id}/split
Content-Type: application/json

{
  "chunkId": "chunk-uuid"
}
```

#### Auto-Generate Threads
Automatically create threads from unassigned chunks.

```http
POST /threads/auto-generate
```

**Response:**
```json
{
  "message": "Threads generated successfully",
  "threadsCreated": 3,
  "chunksProcessed": 45
}
```

### Micro-Threads API

#### Create Micro-Thread
Create a follow-up conversation from a chunk.

```http
POST /thread
Content-Type: application/json

{
  "chunkId": "chunk-uuid",
  "question": "Can you explain this in more detail?",
  "context": "Additional context (optional)"
}
```

**Response:**
```json
{
  "threadId": "micro-thread-uuid",
  "answer": "Certainly! Let me explain in more detail...",
  "modelUsed": "gpt-4",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Get Micro-Threads
Get all micro-threads for a specific chunk.

```http
GET /thread/{chunk_id}/micro-threads
```

**Response:**
```json
{
  "microThreads": [
    {
      "id": "micro-thread-uuid",
      "userPrompt": "Can you explain this?",
      "assistantResponse": "Certainly! Here's the explanation...",
      "modelUsed": "gpt-4",
      "createdAt": "2024-01-01T00:00:00Z",
      "metadata": {}
    }
  ]
}
```

### Analytics API

#### Dashboard Analytics
Get comprehensive dashboard analytics.

```http
GET /analytics/dashboard?user_id={user_id}
```

**Response:**
```json
{
  "total_sources": 15,
  "total_chunks": 342,
  "total_threads": 8,
  "total_micro_threads": 23,
  "avg_chunks_per_source": 22.8,
  "most_active_day": "Tuesday",
  "top_participants": ["GPT-4", "Claude", "User"],
  "conversation_growth": {
    "last_30_days": 45,
    "last_7_days": 12,
    "today": 3
  },
  "recent_activity": [],
  "search_trends": []
}
```

#### Conversation Trends
Get conversation trends over time.

```http
GET /analytics/conversation-trends?user_id={user_id}&days={days}

days: integer (optional, default: 30) - Number of days to analyze
```

#### Search Insights
Get insights from user search patterns.

```http
GET /analytics/search-insights?user_id={user_id}
```

#### Model Usage Statistics
Get AI model usage statistics.

```http
GET /analytics/model-usage?user_id={user_id}&days={days}
```

### User Settings API

#### Get User Settings
Retrieve user settings and preferences.

```http
GET /user/settings?user_id={user_id}
```

#### Update User Settings
Update user settings.

```http
POST /user/settings
Content-Type: application/json

{
  "theme": "dark",
  "notifications_enabled": true,
  "preferences": {
    "default_model": "gpt-4",
    "auto_thread_generation": true
  }
}
```

#### Get API Keys
Retrieve user's stored API keys.

```http
GET /user/settings/api-keys?user_id={user_id}
```

#### Save API Keys
Store user's API keys securely.

```http
POST /user/settings/api-keys
Content-Type: application/json

{
  "keys": {
    "openai": "sk-...",
    "gemini": "AI...",
    "claude": "sk-ant-..."
  }
}
```

#### Test API Key
Test if an API key is valid.

```http
POST /user/settings/test-api-key
Content-Type: application/json

{
  "provider": "openai",
  "key": "sk-..."
}
```

**Response:**
```json
{
  "valid": true
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Search endpoints**: 100 requests per minute
- **Import endpoints**: 10 requests per minute
- **Other endpoints**: 200 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

MeshMemory supports webhooks for real-time notifications:

### Import Completion
Triggered when an import operation completes.

```json
{
  "event": "import.completed",
  "data": {
    "sourceId": "uuid",
    "status": "success",
    "chunksProcessed": 15
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Thread Generation
Triggered when auto-thread generation completes.

```json
{
  "event": "threads.generated",
  "data": {
    "threadsCreated": 3,
    "chunksProcessed": 45
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @MeshMemory/sdk
```

```javascript
import { MeshMemoryClient } from '@MeshMemory/sdk';

const client = new MeshMemoryClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:8000/api'
});

// Search conversations
const results = await client.search('React hooks');

// Import source
const importResult = await client.import({
  type: 'chatgpt',
  url: 'https://chat.openai.com/share/...'
});
```

### Python
```bash
pip install MeshMemory-sdk
```

```python
from MeshMemory import MeshMemoryClient

client = MeshMemoryClient(
    api_key='your-api-key',
    base_url='http://localhost:8000/api'
)

# Search conversations
results = client.search('React hooks')

# Import source
import_result = client.import_source(
    type='chatgpt',
    url='https://chat.openai.com/share/...'
)
```

## Examples

### Complete Import and Search Workflow

```javascript
// 1. Import a ChatGPT conversation
const importResult = await fetch('/api/import', {
  method: 'POST',
  body: new FormData({
    type: 'chatgpt',
    url: 'https://chat.openai.com/share/example',
    title: 'React Hooks Tutorial'
  })
});

const { sourceId } = await importResult.json();

// 2. Wait for processing (in real app, use webhooks)
await new Promise(resolve => setTimeout(resolve, 5000));

// 3. Search the imported content
const searchResult = await fetch('/api/search?q=useState hook');
const { results, aiResponse } = await searchResult.json();

// 4. Create a follow-up question
const microThread = await fetch('/api/thread', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chunkId: results[0].id,
    question: 'Can you provide a code example?'
  })
});

const { answer } = await microThread.json();
```

### Analytics Dashboard Data

```javascript
// Get comprehensive analytics
const analytics = await fetch('/api/analytics/dashboard');
const data = await analytics.json();

// Display key metrics
console.log(`Total Sources: ${data.total_sources}`);
console.log(`Total Conversations: ${data.total_chunks}`);
console.log(`Active Threads: ${data.total_threads}`);

// Get conversation trends
const trends = await fetch('/api/analytics/conversation-trends?days=30');
const trendData = await trends.json();

// Visualize daily activity
trendData.daily_activity.forEach(day => {
  console.log(`${day.date}: ${day.chunks_created} messages`);
});
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_SOURCE_TYPE` | Unsupported import source type |
| `MISSING_REQUIRED_FIELD` | Required field missing from request |
| `INVALID_API_KEY` | API key is invalid or expired |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `CHUNK_NOT_FOUND` | Referenced chunk does not exist |
| `THREAD_NOT_FOUND` | Referenced thread does not exist |
| `IMPORT_FAILED` | Import operation failed |
| `SEARCH_FAILED` | Search operation failed |
| `LLM_ERROR` | Error communicating with LLM service |
| `DATABASE_ERROR` | Database operation failed |

## Support

For API support and questions:
- **Documentation**: [docs.MeshMemory/api](https://docs.MeshMemory/api)
- **GitHub Issues**: [github.com/MeshMemory/MeshMemory/issues](https://github.com/MeshMemory/MeshMemory/issues)
- **Email**: api-support@MeshMemory