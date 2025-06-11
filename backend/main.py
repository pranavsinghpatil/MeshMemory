from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Union
import uvicorn
import os
from datetime import datetime
import uuid

# Import route modules
from api.routes import import_routes, conversations, threads, search, micro_threads, user_settings

app = FastAPI(
    title="KnitChat API",
    description="AI Conversation Management Backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Include routers
app.include_router(import_routes.router, prefix="/api", tags=["import"])
app.include_router(conversations.router, prefix="/api", tags=["conversations"])
app.include_router(threads.router, prefix="/api", tags=["threads"])
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(micro_threads.router, prefix="/api", tags=["micro-threads"])
app.include_router(user_settings.router, prefix="/api", tags=["user-settings"])

@app.get("/")
async def root():
    return {"message": "KnitChat API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )