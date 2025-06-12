# knitter.app Deployment Guide

This guide covers deploying knitter.app to production environments with best practices for security, performance, and scalability.

## Overview

knitter.app consists of:
- **Frontend**: React application (static files)
- **Backend**: FastAPI application (Python)
- **Database**: PostgreSQL with pgvector extension
- **Cache**: Redis (optional but recommended)
- **Monitoring**: Sentry for error tracking

## Prerequisites

- Docker and Docker Compose
- Domain name with SSL certificate
- Supabase project (or self-hosted PostgreSQL with pgvector)
- API keys for OpenAI, Gemini, etc.
- Sentry project (optional)

## Environment Configuration

### Production Environment Variables

Create production environment files:

```bash
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=your-openai-key
VITE_GEMINI_API_KEY=your-gemini-key
ENVIRONMENT=production

# backend/.env.production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
SENTRY_DSN=your-sentry-dsn
REDIS_URL=redis://redis:6379
ENCRYPTION_KEY=your-32-byte-base64-key
ENVIRONMENT=production
```

### Security Considerations

1. **API Keys**: Store sensitive keys in environment variables, never in code
2. **Encryption**: Generate a secure 32-byte encryption key for API key storage
3. **CORS**: Configure CORS for your production domain only
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **SSL**: Always use HTTPS in production

## Deployment Options

### Option 1: Docker Compose (Recommended for small to medium deployments)

1. **Create production Docker Compose file**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        - NODE_ENV=production
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - SENTRY_DSN=${SENTRY_DSN}
      - REDIS_URL=redis://redis:6379
      - ENVIRONMENT=production
    depends_on:
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

2. **Create production Dockerfile for frontend**

```dockerfile
# Dockerfile.frontend.prod
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
ARG NODE_ENV=production
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

3. **Configure Nginx**

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=search:10m rate=5r/s;

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Frontend
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Search endpoints with stricter rate limiting
        location /api/search {
            limit_req zone=search burst=10 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

4. **Deploy**

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Option 2: Kubernetes Deployment

1. **Create Kubernetes manifests**

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: knitter
---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: knitter-config
  namespace: knitter
data:
  ENVIRONMENT: "production"
  REDIS_URL: "redis://redis-service:6379"
---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: knitter-secrets
  namespace: knitter
type: Opaque
stringData:
  SUPABASE_URL: "your-supabase-url"
  SUPABASE_KEY: "your-supabase-key"
  OPENAI_API_KEY: "your-openai-key"
  GEMINI_API_KEY: "your-gemini-key"
  SENTRY_DSN: "your-sentry-dsn"
  ENCRYPTION_KEY: "your-encryption-key"
---
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: knitter-backend
  namespace: knitter
spec:
  replicas: 3
  selector:
    matchLabels:
      app: knitter-backend
  template:
    metadata:
      labels:
        app: knitter-backend
    spec:
      containers:
      - name: backend
        image: knitter/backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: knitter-config
        - secretRef:
            name: knitter-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: knitter-frontend
  namespace: knitter
spec:
  replicas: 2
  selector:
    matchLabels:
      app: knitter-frontend
  template:
    metadata:
      labels:
        app: knitter-frontend
    spec:
      containers:
      - name: frontend
        image: knitter/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

2. **Deploy to Kubernetes**

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n knitter
kubectl get services -n knitter
```

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend) + Railway (Backend)

1. **Deploy Frontend to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

2. **Deploy Backend to Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

#### AWS ECS with Fargate

1. **Create ECS task definitions**
2. **Set up Application Load Balancer**
3. **Configure auto-scaling**
4. **Set up CloudWatch monitoring**

## Database Setup

### Supabase (Recommended)

1. **Create Supabase project**
2. **Run migrations**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

3. **Configure Row Level Security**
4. **Set up database backups**

### Self-hosted PostgreSQL

1. **Install PostgreSQL with pgvector**

```dockerfile
# Dockerfile.postgres
FROM postgres:15

RUN apt-get update && apt-get install -y \
    postgresql-15-pgvector \
    && rm -rf /var/lib/apt/lists/*
```

2. **Configure for production**

```sql
-- postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

## Monitoring and Logging

### Sentry Integration

1. **Configure Sentry in backend**

```python
# backend/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment=os.getenv("ENVIRONMENT", "development"),
)
```

2. **Configure Sentry in frontend**

```javascript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  tracesSampleRate: 0.1,
});
```

### Application Monitoring

1. **Health checks**

```python
# backend/main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

2. **Metrics collection**

```python
# backend/middleware.py
import time
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('request_duration_seconds', 'Request latency')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    REQUEST_LATENCY.observe(duration)
    
    return response
```

## Performance Optimization

### Caching Strategy

1. **Redis configuration**

```yaml
# docker-compose.prod.yml
redis:
  image: redis:7-alpine
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
  volumes:
    - redis_data:/data
```

2. **Application-level caching**

```python
# backend/services/cache_service.py
import redis
import json
from typing import Optional, Any

class CacheService:
    def __init__(self):
        self.redis = redis.from_url(os.getenv("REDIS_URL"))
    
    async def get(self, key: str) -> Optional[Any]:
        value = self.redis.get(key)
        return json.loads(value) if value else None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        self.redis.setex(key, ttl, json.dumps(value))
```

### Database Optimization

1. **Connection pooling**

```python
# backend/database.py
import asyncpg

async def create_pool():
    return await asyncpg.create_pool(
        dsn=DATABASE_URL,
        min_size=10,
        max_size=20,
        command_timeout=60
    )
```

2. **Query optimization**

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX CONCURRENTLY idx_chunks_search_vector ON chunks USING gin(search_vector);
CREATE INDEX CONCURRENTLY idx_sources_user_id ON sources(user_id);
CREATE INDEX CONCURRENTLY idx_chunks_source_id ON chunks(source_id);
```

### CDN Configuration

1. **CloudFlare setup**

```javascript
// cloudflare-workers/cache-control.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  
  // Cache static assets for 1 year
  if (request.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return newResponse
  }
  
  return response
}
```

## Security Hardening

### API Security

1. **Rate limiting**

```python
# backend/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/search")
@limiter.limit("10/minute")
async def search(request: Request):
    # Search implementation
    pass
```

2. **Input validation**

```python
# backend/models/validation.py
from pydantic import BaseModel, validator
import re

class SearchRequest(BaseModel):
    query: str
    limit: int = 10
    
    @validator('query')
    def validate_query(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('Query cannot be empty')
        if len(v) > 1000:
            raise ValueError('Query too long')
        return v.strip()
    
    @validator('limit')
    def validate_limit(cls, v):
        if v < 1 or v > 50:
            raise ValueError('Limit must be between 1 and 50')
        return v
```

### Infrastructure Security

1. **Firewall rules**

```bash
# UFW configuration
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

2. **SSL/TLS configuration**

```bash
# Let's Encrypt with Certbot
certbot --nginx -d your-domain.com
```

## Backup and Recovery

### Database Backups

1. **Automated backups**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="knitter_backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/database/

# Keep only last 30 days
find . -name "knitter_backup_*.sql.gz" -mtime +30 -delete
```

2. **Backup verification**

```bash
#!/bin/bash
# verify_backup.sh
LATEST_BACKUP=$(ls -t knitter_backup_*.sql.gz | head -1)
gunzip -c $LATEST_BACKUP | head -100
```

### Application State Backup

1. **Redis backup**

```bash
# Redis backup
redis-cli --rdb backup.rdb
```

2. **Configuration backup**

```bash
# Backup environment and configs
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  .env.production \
  nginx.conf \
  docker-compose.prod.yml
```

## Scaling Considerations

### Horizontal Scaling

1. **Load balancer configuration**

```nginx
# nginx-lb.conf
upstream backend_servers {
    least_conn;
    server backend1:8000 weight=1 max_fails=3 fail_timeout=30s;
    server backend2:8000 weight=1 max_fails=3 fail_timeout=30s;
    server backend3:8000 weight=1 max_fails=3 fail_timeout=30s;
}
```

2. **Database read replicas**

```python
# backend/database.py
class DatabaseService:
    def __init__(self):
        self.write_pool = create_pool(WRITE_DB_URL)
        self.read_pool = create_pool(READ_DB_URL)
    
    async def read_query(self, query: str):
        async with self.read_pool.acquire() as conn:
            return await conn.fetch(query)
    
    async def write_query(self, query: str):
        async with self.write_pool.acquire() as conn:
            return await conn.execute(query)
```

### Vertical Scaling

1. **Resource allocation**

```yaml
# k8s/backend-deployment.yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

2. **Auto-scaling**

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: knitter-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: knitter-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Troubleshooting

### Common Issues

1. **High memory usage**

```bash
# Check memory usage
docker stats
kubectl top pods -n knitter

# Analyze memory leaks
docker exec -it backend python -m memory_profiler app.py
```

2. **Database connection issues**

```bash
# Check connection pool
docker exec -it backend python -c "
import asyncpg
import asyncio
async def test():
    conn = await asyncpg.connect('$DATABASE_URL')
    print(await conn.fetchval('SELECT 1'))
asyncio.run(test())
"
```

3. **Search performance issues**

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM chunks 
WHERE embedding <=> '[0.1,0.2,...]' < 0.3
ORDER BY embedding <=> '[0.1,0.2,...]'
LIMIT 10;
```

### Monitoring Commands

```bash
# Check application health
curl -f http://localhost:8000/health

# Monitor logs
docker-compose logs -f backend
kubectl logs -f deployment/knitter-backend -n knitter

# Check resource usage
docker system df
kubectl describe node

# Database monitoring
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

## Maintenance

### Regular Tasks

1. **Update dependencies**

```bash
# Update Node.js dependencies
npm audit fix
npm update

# Update Python dependencies
pip-review --local --auto
```

2. **Database maintenance**

```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Update statistics
ANALYZE;

-- Reindex if needed
REINDEX INDEX CONCURRENTLY idx_chunks_embedding;
```

3. **Log rotation**

```bash
# Configure logrotate
cat > /etc/logrotate.d/knitter << EOF
/var/log/knitter/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose restart backend
    endscript
}
EOF
```

This deployment guide provides a comprehensive approach to deploying knitter.app in production environments with proper security, monitoring, and scaling considerations.