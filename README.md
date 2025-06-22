# MeshMemory - AI Conversation Manager

MeshMemory is a comprehensive web application that helps you manage, search, and extract insights from your AI conversations across multiple platforms like ChatGPT, Claude, Gemini, and YouTube.

## 🚀 Features

### Core Functionality
- **Multi-Platform Import**: Import conversations from ChatGPT links, Claude screenshots, Gemini PDFs, and YouTube videos
- **Semantic Search**: AI-powered search across all your conversations with hybrid text and vector search
- **Micro-Threads**: Create follow-up conversations from specific chunks
- **Thread Management**: Automatic and manual thread creation, merging, and splitting
- **Thread Explorer**: Discover patterns and topics across your conversations
- **Persistent Summaries**: AI-generated summaries for threads with caching and regeneration
- **Enhanced Analytics**: Comprehensive insights into your conversation patterns and AI usage

### Advanced Features
- **Enhanced Search**: Multiple search modes (semantic, text, hybrid) with advanced filters
- **Real-time Analytics**: Dashboard with conversation trends, model usage, and search insights
- **Error Monitoring**: Integrated Sentry for comprehensive error tracking and logging
- **Guest Mode**: Try the app without signing up (limited features)
- **Dark/Light Theme**: Supports system preference and manual toggle
- **Responsive Design**: Optimized for desktop and mobile devices

### Performance Features
- **Redis Caching**: Intelligent caching for search results, threads, and embeddings
- **Pagination**: Efficient loading of large conversation threads
- **Virtualization**: Smooth scrolling for long conversations using react-window
- **Memoization**: Optimized React components with proper memoization

### Security Features
- **Authentication**: Secure JWT-based authentication with Supabase
- **Encryption**: API keys and sensitive data encrypted at rest
- **Data Privacy**: Complete user data deletion and export capabilities
- **Row Level Security**: Database-level user data isolation

### Technical Features
- **Vector Embeddings**: OpenAI embeddings for semantic search
- **Full-text Search**: PostgreSQL tsvector for traditional keyword search
- **API Key Management**: Secure storage and testing of user API keys
- **Export Functionality**: Export conversations and analytics in multiple formats

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for analytics visualization
- **Lucide React** for icons
- **React Window** for virtualization
- **Sentry** for error monitoring

### Backend
- **FastAPI** (Python) with async support
- **Supabase** (PostgreSQL with pgvector extension)
- **Redis** for caching
- **Sentry** for error monitoring
- **Cryptography** for data encryption

### AI & ML
- **OpenAI API** (GPT-4, GPT-3.5, Embeddings)
- **Google Gemini API**
- **Anthropic Claude API** (planned)

### DevOps & Testing
- **Docker** and Docker Compose
- **GitHub Actions** CI/CD
- **Jest** and React Testing Library
- **Pytest** for backend testing
- **Nginx** for production deployment

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker and Docker Compose (optional)
- Redis (optional, for caching)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/MeshMemory.git
   cd MeshMemory
   ```

2. **Set up environment variables**
   ```bash

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
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

<<<<<<< HEAD
3. **Configure your environment files**
   ```env
   # .env (Frontend)
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   VITE_SENTRY_DSN=your-sentry-dsn
   VITE_ENVIRONMENT=development
   
   # backend/.env (Backend)
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-service-key
   OPENAI_API_KEY=your-openai-api-key
   GEMINI_API_KEY=your-gemini-api-key
   SENTRY_DSN=your-sentry-dsn
   REDIS_URL=redis://localhost:6379
   ENCRYPTION_KEY=your-32-byte-base64-encryption-key
   ENVIRONMENT=development
   ```

### Running with Docker (Recommended)

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

This will start:
- Frontend at http://localhost:5173 (dev) or http://localhost (prod)
- Backend at http://localhost:8000
- Redis at localhost:6379

### Running Locally

#### Frontend
=======
2. Fill in your API keys and configuration in both `.env` files

### Running with Docker

```bash
docker-compose up
```

### Running Locally

#### Frontend

>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
```bash
npm install
npm run dev
```

#### Backend
<<<<<<< HEAD
=======

>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

<<<<<<< HEAD
#### Redis (Optional)
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install locally
# macOS: brew install redis && redis-server
# Ubuntu: sudo apt install redis-server && redis-server
```

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following key tables:

### Core Tables
- **sources**: Store imported content sources
- **chunks**: Text chunks with embeddings for vector search
- **threads**: Conversation threads with centroid embeddings
- **micro_threads**: Follow-up conversations on specific chunks
- **models**: AI model configurations

### Analytics Tables
- **conversation_summaries**: Cached AI-generated summaries
- **search_history**: User search patterns for analytics
- **usage_logs**: AI model usage tracking
- **user_settings**: User preferences and encrypted API keys

### Advanced Features
- **chunk_relationships**: Semantic relationships between chunks
- **thread_tags**: Tagging system for organization
- **shared_threads**: Public thread sharing
- **export_jobs**: Background export processing
- **user_profiles**: Extended user information

## 🔧 API Endpoints

### Import API
- `POST /api/import` - Import conversation sources
- `GET /api/import/status/{source_id}` - Get import status

### Search API
- `GET /api/search` - Basic semantic search
- `GET /api/search/enhanced` - Advanced search with filters
- `GET /api/search/paginated` - Paginated search results
- `GET /api/search/suggestions` - Search suggestions

### Conversations API
- `GET /api/conversations/{source_id}` - Get conversation data
- `GET /api/conversations/{source_id}/summary` - Get conversation summary
- `GET /api/sources/{source_id}/chunks` - Get paginated chunks

### Threads API
- `GET /api/threads` - Get all threads
- `GET /api/threads/{thread_id}` - Get specific thread
- `GET /api/threads/{thread_id}/chunks` - Get paginated thread chunks
- `GET /api/threads/{thread_id}/summary` - Get thread summary
- `POST /api/threads/{thread_id}/summary/regenerate` - Regenerate summary
- `POST /api/threads/{thread_id}/merge` - Merge threads
- `POST /api/threads/{thread_id}/split` - Split threads

### Data Management API
- `DELETE /api/sources/{source_id}` - Delete source and related data
- `DELETE /api/threads/{thread_id}` - Delete thread
- `DELETE /api/user/data` - Delete all user data (requires confirmation)
- `GET /api/user/data/export` - Export all user data

### Analytics API
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/conversation-trends` - Conversation trends
- `GET /api/analytics/search-insights` - Search insights
- `GET /api/analytics/model-usage` - Model usage statistics

### Health & Monitoring
- `GET /api/health` - Health check endpoint

## 🧪 Testing

### Frontend Tests
```bash
npm test                    # Run tests once
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

### Backend Tests
```bash
cd backend
pytest                     # Run all tests
pytest --cov=api          # Run with coverage
pytest tests/test_import.py # Run specific test file
```

### End-to-End Testing
```bash
docker-compose up -d       # Start services
npm run test:e2e          # Run E2E tests (if configured)
```

## 📈 Performance & Monitoring

### Caching Strategy
- **Redis Caching**: Search results, thread data, and embeddings
- **Database Optimization**: Proper indexing for vector and text search
- **Summary Caching**: Persistent storage of AI-generated summaries
- **Frontend Memoization**: React.memo and useMemo for expensive operations

### Error Monitoring
- **Sentry Integration**: Comprehensive error tracking for both frontend and backend
- **Structured Logging**: Detailed request/response logging with context
- **Performance Monitoring**: Request duration and token usage tracking
- **Health Checks**: Automated monitoring of service health

### Performance Optimizations
- **Pagination**: Efficient loading of large datasets
- **Virtualization**: Smooth scrolling for long lists
- **Lazy Loading**: Components and data loaded on demand
- **Connection Pooling**: Optimized database connections

## 🔒 Security

### Data Protection
- **Row Level Security (RLS)**: Database-level user data isolation
- **API Key Encryption**: Secure storage of user API keys using Fernet encryption
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Proper cross-origin request handling
- **Rate Limiting**: API endpoint protection against abuse

### Authentication & Authorization
- **Supabase Auth**: Email/password authentication with JWT tokens
- **Guest Mode**: Limited functionality without registration
- **Session Management**: Secure session handling
- **Route Protection**: All sensitive endpoints require authentication

### Privacy Features
- **Data Deletion**: Complete user data removal with cascading deletes
- **Data Export**: Full user data export in JSON format
- **Privacy Controls**: User control over data sharing and visibility

## 🚀 Deployment

### Production Deployment Options

#### Option 1: Docker Compose (Recommended)
```bash
# Set up environment variables
cp .env.example .env.production
# Edit .env.production with production values

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: Vercel (Frontend) + Cloud Provider (Backend)
```bash
# Deploy frontend to Vercel
npm install -g vercel
vercel --prod

# Deploy backend to your preferred cloud provider
# (AWS, GCP, Azure, DigitalOcean, etc.)
```

#### Option 3: Netlify (Frontend) + Serverless (Backend)
```bash
# Deploy frontend to Netlify
npm run build
# Upload dist/ folder to Netlify

# Deploy backend as serverless functions
# (AWS Lambda, Vercel Functions, etc.)
```

### Environment Configuration

#### Production Environment Variables
```env
# Frontend (.env.production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ENVIRONMENT=production

# Backend (.env.production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SENTRY_DSN=your-sentry-dsn
REDIS_URL=redis://your-redis-host:6379
ENCRYPTION_KEY=your-32-byte-base64-key
ENVIRONMENT=production
```

### Database Migration
```bash
# Run Supabase migrations
supabase db push

# Or manually run migration files
psql $DATABASE_URL -f supabase/migrations/latest.sql
```

### Monitoring & Health Checks
- Health check endpoint: `/api/health`
- Sentry error monitoring
- Redis connection monitoring
- Database connection monitoring

### Scaling Considerations
- **Database**: Use connection pooling and read replicas
- **Caching**: Implement Redis cluster for high availability
- **CDN**: Use CDN for static assets
- **Load Balancing**: Multiple backend instances behind load balancer

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run the test suite**
   ```bash
   npm test && cd backend && pytest
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Development Guidelines
- **Code Style**: Follow ESLint and Prettier configurations
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Update README and API docs for new features
- **Type Safety**: Use TypeScript for all new code
- **Performance**: Consider caching and optimization for new features
- **Security**: Follow security best practices for data handling

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT models and embeddings
- **Google** for Gemini API
- **Supabase** for database and authentication
- **Vercel** for hosting and deployment
- **Sentry** for error monitoring
- **Redis** for caching solutions
- **The open-source community** for amazing tools and libraries

## 📞 Support

- **Documentation**: [docs.MeshMemory](https://docs.MeshMemory)
- **Issues**: [GitHub Issues](https://github.com/yourusername/MeshMemory/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/MeshMemory/discussions)
- **Email**: support@MeshMemory

---

**MeshMemory** - Transform your AI conversations into searchable knowledge. Built with ❤️ for the AI community.
=======
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
MeshMemory/
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
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
