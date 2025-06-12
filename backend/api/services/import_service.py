import asyncio
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import UploadFile
import aiofiles
import tempfile
import os

from .llm_service import LLMService
from .embedding_service import EmbeddingService
from .database_service import DatabaseService

class ImportService:
    def __init__(self):
        self.llm_service = LLMService()
        self.embedding_service = EmbeddingService()
        self.db_service = DatabaseService()

    async def process_import(
        self,
        source_type: str,
        url: Optional[str] = None,
        title: Optional[str] = None,
        file: Optional[UploadFile] = None
    ) -> Dict[str, Any]:
        """
        Process import from various sources
        """
        source_id = str(uuid.uuid4())
        
        # Create source record
        source_data = {
            "id": source_id,
            "type": self._map_source_type(source_type),
            "url": url,
            "title": title or f"{source_type.title()} Import",
            "created_at": datetime.now(),
            "metadata": {}
        }
        
        await self.db_service.create_source(source_data)
        
        # Extract content based on source type
        if source_type == "chatgpt":
            chunks = await self._process_chatgpt_link(url)
        elif source_type == "youtube":
            chunks = await self._process_youtube_link(url)
        elif source_type == "claude":
            chunks = await self._process_claude_screenshot(file)
        elif source_type == "gemini":
            chunks = await self._process_gemini_pdf(file)
        else:
            raise ValueError(f"Unsupported source type: {source_type}")
        
        # Process chunks and generate embeddings
        processed_chunks = []
        for chunk_data in chunks:
            # Generate embedding
            embedding = await self.embedding_service.generate_embedding(chunk_data["text"])
            
            chunk = {
                "id": str(uuid.uuid4()),
                "source_id": source_id,
                "text_chunk": chunk_data["text"],
                "embedding": embedding,
                "timestamp": chunk_data.get("timestamp", datetime.now()),
                "participant_label": chunk_data.get("participant", "Unknown"),
                "model_name": chunk_data.get("model"),
                "metadata": chunk_data.get("metadata", {})
            }
            
            await self.db_service.create_chunk(chunk)
            processed_chunks.append(chunk)
        
        return {
            "source_id": source_id,
            "chunks_processed": len(processed_chunks)
        }

    def _map_source_type(self, source_type: str) -> str:
        """Map frontend source types to database types"""
        mapping = {
            "chatgpt": "chatgpt-link",
            "youtube": "youtube-link",
            "claude": "text",
            "gemini": "pdf"
        }
        return mapping.get(source_type, "text")

    async def _process_chatgpt_link(self, url: str) -> list:
        """Process ChatGPT share link"""
        # For demo purposes, return mock data
        # In production, you'd scrape the ChatGPT share link
        return [
            {
                "text": "Hello! I'm working on a React project and need help with state management.",
                "participant": "User",
                "timestamp": datetime.now(),
                "metadata": {"source": "chatgpt"}
            },
            {
                "text": "I'd be happy to help with React state management! For simple local state, useState is perfect. For more complex scenarios, consider useReducer or external libraries like Redux or Zustand.",
                "participant": "Assistant",
                "model": "gpt-4",
                "timestamp": datetime.now(),
                "metadata": {"source": "chatgpt"}
            }
        ]

    async def _process_youtube_link(self, url: str) -> list:
        """Process YouTube video transcript"""
        # For demo purposes, return mock data
        # In production, you'd extract YouTube transcript
        return [
            {
                "text": "Welcome to this tutorial on React best practices. Today we'll cover state management, component architecture, and performance optimization.",
                "participant": "Narrator",
                "timestamp": datetime.now(),
                "metadata": {"source": "youtube", "url": url}
            }
        ]

    async def _process_claude_screenshot(self, file: UploadFile) -> list:
        """Process Claude conversation screenshot"""
        # For demo purposes, return mock data
        # In production, you'd use OCR to extract text from image
        return [
            {
                "text": "Can you explain the concept of closures in JavaScript?",
                "participant": "User",
                "timestamp": datetime.now(),
                "metadata": {"source": "claude", "filename": file.filename}
            },
            {
                "text": "A closure in JavaScript is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. This creates a persistent scope that can be used for data privacy and creating specialized functions.",
                "participant": "Claude",
                "timestamp": datetime.now(),
                "metadata": {"source": "claude", "filename": file.filename}
            }
        ]

    async def _process_gemini_pdf(self, file: UploadFile) -> list:
        """Process Gemini PDF export"""
        # For demo purposes, return mock data
        # In production, you'd parse the PDF content
        return [
            {
                "text": "What are the key principles of good software architecture?",
                "participant": "User",
                "timestamp": datetime.now(),
                "metadata": {"source": "gemini", "filename": file.filename}
            },
            {
                "text": "Good software architecture follows several key principles: 1) Separation of concerns, 2) Single responsibility principle, 3) Loose coupling and high cohesion, 4) Scalability and maintainability, 5) Clear interfaces and abstractions.",
                "participant": "Gemini",
                "timestamp": datetime.now(),
                "metadata": {"source": "gemini", "filename": file.filename}
            }
        ]

    async def get_import_status(self, source_id: str) -> Dict[str, Any]:
        """Get the status of an import operation"""
        source = await self.db_service.get_source(source_id)
        if not source:
            raise ValueError("Source not found")
        
        chunks_count = await self.db_service.count_chunks_by_source(source_id)
        
        return {
            "sourceId": source_id,
            "status": "completed",
            "chunksProcessed": chunks_count,
            "createdAt": source["created_at"]
        }