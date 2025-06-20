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
import logging
from .parsers import PARSER_REGISTRY, TextParser

logger = logging.getLogger(__name__)

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
        file: Optional[UploadFile] = None
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
        
        # Create source and chat records
        source_data = {
            "id": source_id,
            "type": normalized_type,
            "url": url,
            "title": title or f"{normalized_type.title()} Import",
            "created_at": datetime.now(),
            "metadata": {
                "import_method": import_method,
                "can_hybrid": True  # Mark as hybrid-capable by default
            }
        }
        
        chat_id = str(uuid.uuid4())
        chat_data = {
            "id": chat_id,
            "title": title or f"{normalized_type.title()} Chat",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "is_hybrid": False,
            "metadata": {
                "source_id": source_id,
                "source_type": normalized_type,
                "import_method": import_method
            }
        }

        await self.db_service.create_source(source_data)
        await self.db_service.create_chat(chat_data)

        # Extract content based on import_method
        parser = PARSER_REGISTRY.get(import_method)
        if parser:
            chunks = await parser.parse(source_id, file=file, url=url)
        else:
            # fallback to existing methods
            if normalized_type == "chatgpt":
                chunks = await self._process_chatgpt_link(url)
            elif normalized_type == "claude":
                chunks = await self._process_claude_screenshot(file)
            elif normalized_type == "gemini":
                chunks = await self._process_gemini_pdf(file)
            else:
                # fallback for other types (could be future LLMs or generic)
                chunks = []
        
        # Add chat_id to all chunks
        for chunk in chunks:
            chunk["chat_id"] = chat_id

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

        # Find compatible chats for hybrid merging
        compatible_chats = await self._find_hybrid_compatible_chats(chat_id, normalized_type)
        
        return {
            "sourceId": source_id,
            "chatId": chat_id,
            "status": "success",
            "message": f"Successfully imported {normalized_type} source",
            "chunksProcessed": len(processed_chunks),
            "isHybridCandidate": True,
            "hybridCompatibleWith": compatible_chats
        }

    async def _find_hybrid_compatible_chats(self, chat_id: str, source_type: str) -> List[str]:
        """Find chats that could be merged with this one in a hybrid chat."""
        try:
            # Get recent chats with same source type that aren't already hybrid
            chats = await self.db_service.list_chats(
                filters={
                    "source_type": source_type,
                    "is_hybrid": False,
                    "exclude_id": chat_id
                },
                limit=5  # Show last 5 compatible chats
            )
            return [chat["id"] for chat in chats]
        except Exception as e:
            print(f"Error finding hybrid compatible chats: {e}")
            return []
    
    async def create_hybrid_chat(
        self,
        chat_ids: List[str],
        title: str,
        sort_method: str = "timestamp",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new hybrid chat by merging multiple chats."""
        hybrid_id = str(uuid.uuid4())
        
        # Create hybrid chat record
        hybrid_data = {
            "id": hybrid_id,
            "title": title,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "is_hybrid": True,
            "metadata": {
                "source_chats": chat_ids,
                "sort_method": sort_method,
                **(metadata or {})
            }
        }
        await self.db_service.create_chat(hybrid_data)
        
        # Get all chunks from source chats
        all_chunks = []
        for chat_id in chat_ids:
            chunks = await self.db_service.get_chunks_by_chat(chat_id)
            all_chunks.extend(chunks)
        
        # Sort chunks based on method
        if sort_method == "timestamp":
            all_chunks.sort(key=lambda x: x["timestamp"])
        elif sort_method == "artefact_order":
            all_chunks.sort(key=lambda x: (x.get("artefact_order", 0), x["timestamp"]))
        
        # Update chunks to point to hybrid chat
        for chunk in all_chunks:
            chunk["chat_id"] = hybrid_id
            await self.db_service.create_chunk(chunk)
        
        return {
            "hybrid_id": hybrid_id,
            "chunks_merged": len(all_chunks),
            "source_chats": chat_ids,
            "status": "success"
        }

    async def process_grouped_import(self, user_id: str, artefacts: list, import_batch_title: str = None, metadata: dict = None) -> dict:
        """
        Process a grouped import: create import_batch, parse all artefacts concurrently, batch persist chunks.
        """
        import_batch_id = str(uuid.uuid4())
        batch_data = {
            "id": import_batch_id,
            "user_id": user_id,
            "created_at": datetime.now(),
            "title": import_batch_title or f"Grouped Import {datetime.now().isoformat()}",
            "artefact_count": len(artefacts),
            "metadata": metadata or {}
        }
        await self.db_service.create_import_batch(batch_data)

        async def _parse_one(idx: int, artefact: dict) -> list:
            artefact_id = str(uuid.uuid4())
            parser = PARSER_REGISTRY.get(artefact.get("type"))
            if not parser:
                return []
            try:
                chunks = await parser.parse(artefact_id, file=artefact.get("file"), url=artefact.get("url"))
            except Exception as e:
                logger.warning(f"Parser for artefact {idx} failed: {e}, falling back to TextParser")
                chunks = await TextParser().parse(artefact_id, file=artefact.get("file"), url=artefact.get("url"))
            for chunk in chunks:
                chunk["import_batch_id"] = import_batch_id
                chunk["artefact_id"] = artefact_id
                chunk["artefact_order"] = idx
            return chunks

        tasks = [_parse_one(idx, a) for idx, a in enumerate(artefacts)]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_chunks = []
        for res in results:
            if isinstance(res, Exception):
                logger.error(f"Error in artefact parse task: {res}")
                continue
            all_chunks.extend(res)

        # Batch insert chunks
        batch_size = 100
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i : i + batch_size]
            await self.db_service.create_chunks(batch)

        return {
            "import_batch_id": import_batch_id,
            "chunks_processed": len(all_chunks),
            "artefact_count": len(artefacts),
            "status": "success"
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
        """Fetch and parse a ChatGPT share link into message dicts.
        The share link is of form https://chat.openai.com/share/<uuid>
        The HTML contains a <script id="__NEXT_DATA__"> whose JSON includes messages.
        """
        import aiohttp, json, re
        from bs4 import BeautifulSoup

        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status != 200:
                    raise ValueError(f"Failed to fetch ChatGPT share link: HTTP {resp.status}")
                html = await resp.text()

        soup = BeautifulSoup(html, "html.parser")
        script_tag = soup.find("script", id="__NEXT_DATA__")
        if not script_tag:
            raise ValueError("Could not locate message payload in share link HTML")

        try:
            data = json.loads(script_tag.string)
            # Navigate to props.pageProps.sharedConversationData
            messages = (
                data["props"]["pageProps"]["sharedConversationData"]["conversationData"]["mapping"].values()
            )
        except Exception as exc:
            raise ValueError(f"Unexpected share link schema: {exc}")

        parsed_msgs = []
        for m in messages:
            content = m.get("message")
            if not content:
                continue
            role = content.get("author", {}).get("role", "user")
            # message parts may live in content.parts list
            parts = content.get("content", {}).get("parts", [])
            text = "\n\n".join(parts).strip()
            if not text:
                continue
            parsed_msgs.append(
                {
                    "text": text,
                    "participant": "Assistant" if role == "assistant" else "User",
                    "timestamp": datetime.fromtimestamp(content.get("create_time", datetime.now().timestamp())),
                    "metadata": {
                        "source": "chatgpt_link",
                        "share_url": url,
                    },
                }
            )
        if not parsed_msgs:
            raise ValueError("No messages parsed from share link")
        return parsed_msgs

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