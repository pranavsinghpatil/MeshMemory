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

    # Allowed high-level source types
    ALLOWED_SOURCE_TYPES = [
        "chatgpt", "claude", "gemini", "grok", "mistral", "deepseek", "other"
    ]

    def normalize_source_type(self, source_type: str) -> str:
        """
        Normalize and validate the source_type to a high-level category.
        """
        st = (source_type or "other").lower()
        if st in self.ALLOWED_SOURCE_TYPES:
            return st
        # Map common subtypes or aliases
        mapping = {
            "chatgpt-link": "chatgpt",
            "chatgpt_screenshot": "chatgpt",
            "chatgpt_copy": "chatgpt",
            "claude_screenshot": "claude",
            "gemini_pdf": "gemini",
            "youtube": "other",
            # Add more mappings as needed
        }
        return mapping.get(st, "other")

    def extract_import_method(self, raw_type: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> str:
        """
        Determine import method for metadata based on user input and context.
        """
        if raw_type.endswith("screenshot"):
            return "screenshot"
        if raw_type.endswith("link") or (url and "http" in url):
            return "link"
        if file is not None:
            ext = (file.filename or "").lower()
            if ext.endswith(".pdf"):
                return "pdf"
            if ext.endswith(('.png', '.jpg', '.jpeg')):
                return "screenshot"
        if raw_type.endswith("copy"):
            return "copy_paste"
        return "manual"

    async def process_import(
        self,
        source_type: str,
        url: Optional[str] = None,
        title: Optional[str] = None,
        file: Optional[UploadFile] = None,
        group_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process import from various sources. Standardize source_type and store import method in metadata.
        Supports grouped imports with artefact tracking.
        
        Args:
            source_type: Type of source being imported
            url: Optional URL for web-based imports
            title: Optional title for the import
            file: Optional file for file-based imports
            group_id: Optional group ID for grouped imports (artefact_id)
        """
        normalized_type = self.normalize_source_type(source_type)
        import_method = self.extract_import_method(source_type, file, url)
        source_id = str(uuid.uuid4())
        
        # Generate artefact_id if this is a new group, or use provided group_id
        artefact_id = group_id or str(uuid.uuid4())
        
        # Create source record
        source_data = {
            "id": source_id,
            "type": normalized_type,
            "url": url,
            "title": title or f"{normalized_type.title()} Import",
            "created_at": datetime.now(),
            "metadata": {
                "import_method": import_method,
                "artefact_id": artefact_id,
                "is_grouped": bool(group_id)  # Flag if this is part of a group
            }
        }

        await self.db_service.create_source(source_data)

        # Extract content based on high-level type
        if normalized_type == "chatgpt":
            chunks = await self._process_chatgpt_link(url)
        elif normalized_type == "claude":
            chunks = await self._process_claude_screenshot(file)
        elif normalized_type == "gemini":
            chunks = await self._process_gemini_pdf(file)
        else:
            # fallback for other types (could be future LLMs or generic)
            chunks = []

        # Get the next artefact_order if this is part of a group
        next_order = 1
        if group_id:
            existing_chunks = await self.db_service.get_chunks_by_artefact(artefact_id)
            next_order = len(existing_chunks) + 1

        # Process chunks and generate embeddings
        processed_chunks = []
        for i, chunk_data in enumerate(chunks, next_order):
            embedding = await self.embedding_service.generate_embedding(chunk_data["text"])
            chunk_metadata = chunk_data.get("metadata", {})
            chunk_metadata["import_method"] = import_method
            chunk_metadata["artefact_source"] = normalized_type
            
            chunk = {
                "id": str(uuid.uuid4()),
                "source_id": source_id,
                "text_chunk": chunk_data["text"],
                "embedding": embedding,
                "timestamp": chunk_data.get("timestamp", datetime.now()),
                "participant_label": chunk_data.get("participant", "Unknown"),
                "model_name": chunk_data.get("model"),
                "artefact_id": artefact_id,
                "artefact_order": i,
                "metadata": chunk_metadata
            }
            await self.db_service.create_chunk(chunk)
            processed_chunks.append(chunk)

        return {
            "source_id": source_id,
            "artefact_id": artefact_id,
            "chunks_processed": len(processed_chunks),
            "is_grouped": bool(group_id)
        }

    async def process_grouped_import(
        self,
        artefact_id: str,
        source_type: str,
        url: Optional[str] = None,
        title: Optional[str] = None,
        file: Optional[UploadFile] = None
    ) -> Dict[str, Any]:
        """
        Process a grouped import with artefact tracking.
        
        Args:
            artefact_id: ID of the artefact being imported
            source_type: Type of source being imported
            url: Optional URL for web-based imports
            title: Optional title for the import
            file: Optional file for file-based imports
        """
        return await self.process_import(source_type, url, title, file, artefact_id)

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