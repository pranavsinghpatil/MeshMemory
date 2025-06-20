from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from fastapi import UploadFile
from datetime import datetime
import uuid
import PyPDF2
import io
import pytesseract
from PIL import Image
import aiohttp
import magic

from typing import List, Dict, Any, Optional
import logging
import copy
from aiolimiter import AsyncLimiter

logger = logging.getLogger(__name__)
_rate_limiter = AsyncLimiter(max_rate=5, time_period=1)
_url_cache: Dict[str, List[Dict[str, Any]]] = {}

class ParserError(Exception):
    """Custom exception for parser failures."""

class ParserInterface(ABC):
    @abstractmethod
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse content from file or URL into a list of chunks.
        Returns list of dicts with keys:
        - content: str (The actual message content)
        - role: str (user/assistant/system)
        - timestamp: datetime
        - metadata: Dict (parser-specific metadata)
        """
        pass

    async def _extract_text_from_file(self, file: UploadFile) -> str:
        """Helper to extract text content from a file"""
        content = await file.read()
        try:
            return content.decode('utf-8')
        except UnicodeDecodeError:
            # Try common encodings
            for encoding in ['latin-1', 'cp1252', 'iso-8859-1']:
                try:
                    return content.decode(encoding)
                except UnicodeDecodeError:
                    continue
            raise ValueError(f"Could not decode file content using common encodings")

class TextParser(ParserInterface):
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse plain text content, splitting by double newlines or markdown headers"""
        if not file:
            raise ValueError("TextParser requires a file")

        content = await self._extract_text_from_file(file)

        # Split by markdown headers or double newlines
        chunks = []
        current_chunk = ""

        for line in content.split('\n'):
            if line.strip().startswith('#') or (not line.strip() and current_chunk):
                if current_chunk.strip():
                    chunks.append({
                        "content": current_chunk.strip(),
                        "role": "user",
                        "timestamp": datetime.now(),
                        "metadata": {"format": "text/markdown"}
                    })
                current_chunk = line
            else:
                current_chunk += '\n' + line

        # Add final chunk
        if current_chunk.strip():
            chunks.append({
                "content": current_chunk.strip(),
                "role": "user",
                "timestamp": datetime.now(),
                "metadata": {"format": "text/markdown"}
            })

        return chunks

class PDFParser(ParserInterface):
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse PDF content, extracting text by pages and sections"""
        if not file:
            raise ValueError("PDFParser requires a file")

        content = await file.read()
        pdf_file = io.BytesIO(content)

        try:
            reader = PyPDF2.PdfReader(pdf_file)
            chunks = []

            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text = page.extract_text()

                # Split page into paragraphs
                paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]

                for para in paragraphs:
                    chunks.append({
                        "content": para,
                        "role": "user",
                        "timestamp": datetime.now(),
                        "metadata": {
                            "format": "application/pdf",
                            "page": page_num + 1,
                            "total_pages": len(reader.pages)
                        }
                    })

            return chunks
        except Exception as e:
            raise ValueError(f"Error parsing PDF: {str(e)}")

class HTMLParser(ParserInterface):
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse HTML content with rate limiting, retries, and error handling"""
        import asyncio
        try:
            if url:
                content = None
                for attempt in range(3):
                    try:
                        await _rate_limiter.acquire()
                        async with aiohttp.ClientSession() as session:
                            async with session.get(url) as response:
                                content = await response.text()
                        break
                    except Exception as e:
                        logger.warning(f"HTMLParser fetch attempt {attempt+1} failed: {e}")
                        if attempt < 2:
                            await asyncio.sleep(0.5 * (2 ** attempt))
                        else:
                            raise ParserError(f"Failed to fetch URL after 3 attempts: {e}")
            elif file:
                content = await self._extract_text_from_file(file)
            else:
                raise ParserError("HTMLParser requires either file or url")

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

            chunks: List[Dict[str, Any]] = []
            # Extract text from meaningful blocks
            for element in soup.find_all(['p','h1','h2','h3','h4','h5','h6','li']):
                text = element.get_text().strip()
                if text:
                    chunks.append({
                        "content": text,
                        "role": "user",
                        "timestamp": datetime.now(),
                        "metadata": {
                            "format": "text/html",
                            "tag": element.name,
                            "classes": element.get('class', [])
                        }
                    })
            return chunks
        except ParserError:
            raise
        except Exception as e:
            logger.error(f"HTMLParser failed for source {source_id}: {e}")
            raise ParserError(f"HTML parsing failed: {e}")
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse HTML content with rate limiting and error handling"""
        try:
            if url:
                await _rate_limiter.acquire()
                async with aiohttp.ClientSession() as session:
                    async with session.get(url) as response:
                        content = await response.text()
            elif file:
                content = await self._extract_text_from_file(file)
            else:
                raise ParserError("HTMLParser requires either file or url")

            from bs4 import BeautifulSoup  # ensure import
            soup = BeautifulSoup(content, 'html.parser')
            for script in soup(["script", "style"]):
                script.decompose()

            chunks: List[Dict[str, Any]] = []
            for element in soup.find_all(['p','h1','h2','h3','h4','h5','h6','li']):
                text = element.get_text().strip()
                if text:
                    chunks.append({
                        "content": text,
                        "role": "user",
                        "timestamp": datetime.now(),
                        "metadata": {
                            "format": "text/html",
                            "tag": element.name,
                            "classes": element.get('class', [])
                        }
                    })

            return chunks
        except Exception as e:
            logger.error(f"HTMLParser failed for source {source_id}: {e}")
            raise ParserError(f"HTML parsing failed: {e}")
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse HTML content, extracting meaningful text blocks"""
        if url:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    content = await response.text()
        elif file:
            content = await self._extract_text_from_file(file)
        else:
            raise ValueError("HTMLParser requires either file or url")
            
        soup = BeautifulSoup(content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        chunks = []
        # Extract text from meaningful blocks
        for element in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']):
            text = element.get_text().strip()
            if text:
                chunks.append({
                    "content": text,
                    "role": "user",
                    "timestamp": datetime.now(),
                    "metadata": {
                        "format": "text/html",
                        "tag": element.name,
                        "classes": element.get('class', [])
                    }
                })
                
        return chunks

class OcrParser(ParserInterface):
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse images using OCR to extract text"""
        if not file:
            raise ValueError("OcrParser requires a file")

        content = await file.read()
        image = Image.open(io.BytesIO(content))

        try:
            # Extract text using Tesseract
            text = pytesseract.image_to_string(image)

            # Split into meaningful blocks
            blocks = [block.strip() for block in text.split('\n\n') if block.strip()]

            chunks = []
            for block in blocks:
                chunks.append({
                    "content": block,
                    "role": "user",
                    "timestamp": datetime.now(),
                    "metadata": {
                        "format": "image/ocr",
                        "image_size": image.size,
                        "confidence": pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)['conf']
                    }
                })

            return chunks
        except Exception as e:
            raise ValueError(f"OCR processing failed: {str(e)}")

class LinkParser(ParserInterface):
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse content from URLs with retries, caching, and error handling"""
        import asyncio
        try:
            if not url:
                raise ParserError("LinkParser requires a URL")

            if url in _url_cache:
                return copy.deepcopy(_url_cache[url])

            content = None
            for attempt in range(3):
                try:
                    await _rate_limiter.acquire()
                    async with aiohttp.ClientSession() as session:
                        async with session.get(url) as response:
                            content = await response.read()
                    break
                except Exception as e:
                    logger.warning(f"LinkParser fetch attempt {attempt+1} failed: {e}")
                    if attempt < 2:
                        await asyncio.sleep(0.5 * (2 ** attempt))
                    else:
                        raise ParserError(f"Failed to fetch URL after 3 attempts: {e}")

            content_type = magic.from_buffer(content, mime=True)
            # choose parser
            if content_type.startswith('text/html'):
                parser = HTMLParser()
            elif content_type == 'application/pdf':
                parser = PDFParser()
            elif content_type.startswith('image/'):
                parser = OcrParser()
            else:
                parser = TextParser()

            temp_file = UploadFile(
                filename=url.split('/')[-1],
                content_type=content_type,
                file=io.BytesIO(content)
            )
            chunks = await parser.parse(source_id, file=temp_file)
            for chunk in chunks:
                chunk['metadata'].update({
                    'source_url': url,
                    'content_type': content_type
                })

            _url_cache[url] = chunks
            return copy.deepcopy(_url_cache[url])
        except ParserError:
            raise
        except Exception as e:
            logger.error(f"LinkParser failed for URL {url}: {e}")
            raise ParserError(f"Link parsing failed: {e}")
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse content from URLs with caching, rate limiting, and error handling"""
        try:
            if not url:
                raise ParserError("LinkParser requires a URL")

            if url in _url_cache:
                return copy.deepcopy(_url_cache[url])

            await _rate_limiter.acquire()
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    content = await response.read()
                    content_type = magic.from_buffer(content, mime=True)

                    if content_type.startswith('text/html'):
                        parser = HTMLParser()
                    elif content_type == 'application/pdf':
                        parser = PDFParser()
                    elif content_type.startswith('image/'):
                        parser = OcrParser()
                    else:
                        parser = TextParser()

                    temp_file = UploadFile(
                        filename=url.split('/')[-1],
                        content_type=content_type,
                        file=io.BytesIO(content)
                    )
                    chunks = await parser.parse(source_id, file=temp_file)
                    for chunk in chunks:
                        chunk['metadata'].update({
                            'source_url': url,
                            'content_type': content_type
                        })

                    _url_cache[url] = chunks
                    return copy.deepcopy(_url_cache[url])
        except ParserError:
            raise
        except Exception as e:
            logger.error(f"LinkParser failed for URL {url}: {e}")
            raise ParserError(f"Link parsing failed: {e}")
    async def parse(self, source_id: str, file: Optional[UploadFile] = None, url: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parse content from URLs, auto-detecting content type"""
        if not url:
            raise ValueError("LinkParser requires a URL")
            
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                content = await response.read()
                content_type = magic.from_buffer(content, mime=True)
                
                # Create appropriate parser based on content type
                if content_type.startswith('text/html'):
                    parser = HTMLParser()
                elif content_type == 'application/pdf':
                    parser = PDFParser()
                elif content_type.startswith('image/'):
                    parser = OcrParser()
                else:
                    parser = TextParser()
                    
                # Create a temporary UploadFile for content
                temp_file = UploadFile(
                    filename=url.split('/')[-1],
                    content_type=content_type,
                    file=io.BytesIO(content)
                )
                
                chunks = await parser.parse(source_id, file=temp_file)
                
                # Add URL metadata to all chunks
                for chunk in chunks:
                    chunk['metadata'].update({
                        'source_url': url,
                        'content_type': content_type
                    })
                    
                return chunks

class TextParser(ParserInterface):
    async def parse(
        self,
        artefact_id: str,
        file: Optional[UploadFile] = None,
        url: Optional[str] = None,
        artefact_order: int = 0
    ) -> List[Dict[str, Any]]:
        if not file:
            return []
        content_bytes = await file.read()
        try:
            content = content_bytes.decode('utf-8')
        except Exception:
            content = content_bytes.decode('latin-1', errors='ignore')
        return [{
            "id": str(uuid.uuid4()),
            "text": content,
            "participant": "User",
            "timestamp": datetime.now(),
            "metadata": {"source": "copy_paste", "artefact_id": artefact_id},
            "model": None,
            "artefact_id": artefact_id,
            "artefact_order": artefact_order
        }]

# Register parsers by import_method key
PARSER_REGISTRY: Dict[str, ParserInterface] = {
    "copy_paste": TextParser(),
    "html": HTMLParser(),
    "pdf": PDFParser(),
    "screenshot": OcrParser(),
    "link": LinkParser(),
}
