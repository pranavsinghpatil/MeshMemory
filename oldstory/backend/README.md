# MeshMemory Backend

[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](https://MeshMemory.app/terms)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Server](#running-the-server)
- [Import Workflow](#import-workflow)
  - [Supported Import Types](#supported-import-types)
  - [Import Examples](#import-examples)
- [Merge Workflow](#merge-workflow)
  - [Merging Conversations](#merging-conversations)
  - [Hybrid Chats](#hybrid-chats)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

MeshMemory is a powerful chat and knowledge management platform that allows users to organize, search, and merge conversations from various sources. This repository contains the backend API built with FastAPI.

## Features

- **Conversation Management**: Create, read, update, and delete conversations
- **Message Handling**: Send and retrieve messages with different roles (user/assistant/system)
- **Content Import**: Import from multiple sources (text, HTML, PDF, OCR, URLs)
- **Conversation Merging**: Combine multiple conversations into hybrid chats
- **Search**: Full-text search across conversations and messages
- **User Authentication**: JWT-based authentication
- **Pagination**: Efficient data retrieval with pagination

## API Documentation

Interactive API documentation is available at `/docs` when running the server locally:

- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`

For detailed API reference, see the [OpenAPI specification](./docs/openapi/openapi.yaml).

## Getting Started

### Prerequisites

- Python 3.9+
- pip (Python package manager)
- PostgreSQL (for production)
- Redis (for caching and rate limiting)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/MeshMemory.git
   cd MeshMemory/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/MeshMemory

# JWT
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
FRONTEND_URL=http://localhost:3000

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379/0
```

### Running the Server

Start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## Import Workflow

### Supported Import Types

1. **Text** (`copy_paste`): Plain text content
2. **HTML**: HTML documents
3. **PDF**: PDF documents with text extraction
4. **Screenshot**: Images with OCR (Optical Character Recognition)
5. **Link**: Web page URL (fetches and parses content)

### Import Examples

#### 1. Import Plain Text

```http
POST /import
Content-Type: multipart/form-data

{
  "type": "copy_paste",
  "title": "My Notes",
  "text": "This is some important content.\n\nWith multiple paragraphs."
}
```

#### 2. Import HTML

```http
POST /import
Content-Type: multipart/form-data

{
  "type": "html",
  "title": "Web Page Content",
  "html": "<h1>Title</h1><p>Content</p>"
}
```

#### 3. Import PDF

```http
POST /import
Content-Type: multipart/form-data

{
  "type": "pdf",
  "title": "Document"
}
File: document.pdf
```

#### 4. Import Screenshot (OCR)

```http
POST /import
Content-Type: multipart/form-data

{
  "type": "screenshot",
  "title": "Meeting Notes"
}
File: screenshot.png
```

#### 5. Import from URL

```http
POST /import
Content-Type: multipart/form-data

{
  "type": "link",
  "title": "Blog Post",
  "url": "https://example.com/blog/post"
}
```

## Merge Workflow

### Merging Conversations

Merge multiple conversations into a new hybrid chat:

```http
POST /merge
Content-Type: application/json

{
  "title": "Merged Project Discussion",
  "source_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ]
}
```

### Hybrid Chats

Hybrid chats maintain references to their source conversations while providing a unified view:

- Messages are interleaved chronologically
- Source information is preserved in message metadata
- You can trace each message back to its original conversation

## API Reference

### Authentication

All endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Rate Limiting

- 1000 requests per hour per user
- 100 requests per minute per endpoint

### Error Handling

Errors follow this format:

```json
{
  "detail": "Error message"
}
```

Common status codes:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Testing

Run tests with pytest:

```bash
pytest tests/
```

## Deployment

### Production

For production deployment, use a production-grade ASGI server like Uvicorn with Gunicorn:

```bash
pip install gunicorn
```

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

### Docker

Build and run with Docker:

```bash
docker build -t MeshMemory-backend .
docker run -p 8000:8000 MeshMemory-backend
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - © 2023 MeshMemory. All rights reserved.
