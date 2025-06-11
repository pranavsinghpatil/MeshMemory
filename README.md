# KnitChat - AI Conversation Manager

KnitChat is a web application that helps you manage, search, and extract insights from your AI conversations across multiple platforms like ChatGPT, Claude, Gemini, and YouTube.

## Features

- **Import Conversations**: Import from ChatGPT links, Claude screenshots, Gemini PDFs, and YouTube videos
- **Semantic Search**: Search across all your conversations with AI-powered responses
- **Micro-Threads**: Create follow-up conversations from specific chunks
- **Thread Explorer**: Discover patterns and topics across your conversations
- **Dark/Light Theme**: Supports system preference and manual toggle
- **Guest Mode**: Try the app without signing up

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI**: OpenAI API, Google Gemini API

## Getting Started

### Prerequisites

- Node.js 16+
- Python 3.9+
- Docker and Docker Compose (optional)

### Environment Setup

1. Copy the example environment files:
   ```
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

2. Fill in your API keys and configuration in both `.env` files

### Running with Docker

```bash
docker-compose up
```

### Running Locally

#### Frontend

```bash
npm install
npm run dev
```

#### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## API Endpoints

### Import API

- `POST /api/import` - Import a conversation source
- `GET /api/import/status/{source_id}` - Get import status

### Conversations API

- `GET /api/conversations/{source_id}` - Get conversation data
- `GET /api/conversations/{source_id}/chunks` - Get conversation chunks
- `GET /api/conversations/{source_id}/metadata` - Get conversation metadata

### Search API

- `GET /api/search?q={query}` - Search across conversations
- `GET /api/search/suggestions?q={partial_query}` - Get search suggestions

### Threads API

- `GET /api/threads` - Get all threads
- `GET /api/threads/{thread_id}` - Get a specific thread
- `POST /api/threads/auto-generate` - Auto-generate threads
- `GET /api/threads/stats` - Get thread statistics

### Micro-Threads API

- `POST /api/thread` - Create a micro-thread
- `GET /api/thread/{chunk_id}/micro-threads` - Get micro-threads for a chunk

## Project Structure

```
knitchat/
├── backend/               # FastAPI backend
│   ├── api/
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   ├── main.py            # Entry point
│   └── requirements.txt   # Python dependencies
├── src/                   # React frontend
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React context providers
│   ├── lib/               # Utilities and API clients
│   ├── pages/             # Page components
│   └── utils/             # Helper functions
├── public/                # Static assets
├── docker-compose.yml     # Docker configuration
└── package.json           # Node dependencies
```

## License

MIT