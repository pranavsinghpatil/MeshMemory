"""
Comprehensive unit and integration tests for all parsers.
Tests cover: TextParser, PDFParser, HTMLParser, OcrParser, LinkParser
"""

import pytest
import io
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock, Mock
from fastapi import UploadFile
from datetime import datetime
from aiohttp import ClientResponse

from api.services.parsers import (
    TextParser,
    PDFParser, 
    HTMLParser,
    OcrParser,
    LinkParser,
    ParserError,
    PARSER_REGISTRY
)


class TestTextParser:
    """Test cases for TextParser"""
    
    @pytest.mark.asyncio
    async def test_text_parser_basic(self):
        """Test basic text parsing functionality"""
        content = "Hello world\n\nThis is a paragraph"
        upload = UploadFile(filename="test.txt", file=io.BytesIO(content.encode()), content_type="text/plain")
        
        parser = TextParser()
        chunks = await parser.parse("source-1", file=upload)
        
        assert len(chunks) >= 1
        assert chunks[0]["content"] == "Hello world"
        assert chunks[0]["role"] == "user"
        assert chunks[0]["metadata"]["format"] == "text/markdown"
    
    @pytest.mark.asyncio
    async def test_text_parser_markdown_headers(self):
        """Test text parser with markdown headers"""
        content = "# Header 1\nContent under header 1\n\n## Header 2\nContent under header 2"
        upload = UploadFile(filename="test.md", file=io.BytesIO(content.encode()), content_type="text/markdown")
        
        parser = TextParser()
        chunks = await parser.parse("source-1", file=upload)
        
        assert len(chunks) == 2
        assert "Header 1" in chunks[0]["content"]
        assert "Header 2" in chunks[1]["content"]
    
    @pytest.mark.asyncio
    async def test_text_parser_empty_file(self):
        """Test text parser with empty file"""
        upload = UploadFile(filename="empty.txt", file=io.BytesIO(b""), content_type="text/plain")
        
        parser = TextParser()
        chunks = await parser.parse("source-1", file=upload)
        
        assert chunks == []
    
    @pytest.mark.asyncio
    async def test_text_parser_encoding_issues(self):
        """Test text parser with various encodings"""
        # Test UTF-8 with special characters
        content = "Héllo wörld! 🌍"
        upload = UploadFile(filename="test.txt", file=io.BytesIO(content.encode('utf-8')), content_type="text/plain")
        
        parser = TextParser()
        chunks = await parser.parse("source-1", file=upload)
        
        assert len(chunks) == 1
        assert "Héllo wörld! 🌍" in chunks[0]["content"]
        
        # Test latin-1 encoding fallback
        content_latin = "café"
        upload_latin = UploadFile(filename="test.txt", file=io.BytesIO(content_latin.encode('latin-1')), content_type="text/plain")
        
        chunks_latin = await parser.parse("source-1", file=upload_latin)
        assert len(chunks_latin) == 1
    
    @pytest.mark.asyncio 
    async def test_text_parser_no_file(self):
        """Test text parser raises error when no file provided"""
        parser = TextParser()
        
        with pytest.raises(ValueError, match="TextParser requires a file"):
            await parser.parse("source-1")


class TestPDFParser:
    """Test cases for PDFParser"""
    
    @pytest.mark.asyncio
    async def test_pdf_parser_basic(self):
        """Test basic PDF parsing functionality"""
        fake_pdf_bytes = b"%PDF-1.4 mock pdf content"
        upload = UploadFile(filename="test.pdf", file=io.BytesIO(fake_pdf_bytes), content_type="application/pdf")
        
        with patch("api.services.parsers.pdfplumber.open") as mock_open:
            mock_pdf = MagicMock()
            mock_page = MagicMock()
            mock_page.extract_text.return_value = "Page content here\n\nAnother paragraph"
            mock_pdf.pages = [mock_page]
            mock_open.return_value.__enter__.return_value = mock_pdf
            
            parser = PDFParser()
            chunks = await parser.parse("source-1", file=upload)
            
            assert len(chunks) == 2
            assert chunks[0]["content"] == "Page content here"
            assert chunks[1]["content"] == "Another paragraph"
            assert all(chunk["metadata"]["format"] == "application/pdf" for chunk in chunks)
    
    @pytest.mark.asyncio
    async def test_pdf_parser_empty_pages(self):
        """Test PDF parser with empty pages"""
        fake_pdf_bytes = b"%PDF-1.4 mock pdf content"
        upload = UploadFile(filename="empty.pdf", file=io.BytesIO(fake_pdf_bytes), content_type="application/pdf")
        
        with patch("api.services.parsers.pdfplumber.open") as mock_open:
            mock_pdf = MagicMock()
            mock_page = MagicMock()
            mock_page.extract_text.return_value = ""
            mock_pdf.pages = [mock_page]
            mock_open.return_value.__enter__.return_value = mock_pdf
            
            parser = PDFParser()
            chunks = await parser.parse("source-1", file=upload)
            
            assert chunks == []
    
    @pytest.mark.asyncio
    async def test_pdf_parser_multipage(self):
        """Test PDF parser with multiple pages"""
        fake_pdf_bytes = b"%PDF-1.4 mock pdf content"
        upload = UploadFile(filename="multi.pdf", file=io.BytesIO(fake_pdf_bytes), content_type="application/pdf")
        
        with patch("api.services.parsers.pdfplumber.open") as mock_open:
            mock_pdf = MagicMock()
            
            mock_page1 = MagicMock()
            mock_page1.extract_text.return_value = "Page 1 content"
            
            mock_page2 = MagicMock()
            mock_page2.extract_text.return_value = "Page 2 content\n\nSecond paragraph"
            
            mock_pdf.pages = [mock_page1, mock_page2]
            mock_open.return_value.__enter__.return_value = mock_pdf
            
            parser = PDFParser()
            chunks = await parser.parse("source-1", file=upload)
            
            assert len(chunks) == 3
            assert chunks[0]["content"] == "Page 1 content"
            assert chunks[1]["content"] == "Page 2 content"
            assert chunks[2]["content"] == "Second paragraph"
    
    @pytest.mark.asyncio
    async def test_pdf_parser_no_file(self):
        """Test PDF parser raises error when no file provided"""
        parser = PDFParser()
        
        with pytest.raises(ValueError, match="PDFParser requires a file"):
            await parser.parse("source-1")
    
    @pytest.mark.asyncio
    async def test_pdf_parser_corrupted_file(self):
        """Test PDF parser with corrupted PDF file"""
        corrupted_pdf = b"not a pdf file"
        upload = UploadFile(filename="corrupted.pdf", file=io.BytesIO(corrupted_pdf), content_type="application/pdf")
        
        with patch("api.services.parsers.pdfplumber.open") as mock_open:
            mock_open.side_effect = Exception("Invalid PDF")
            
            parser = PDFParser()
            
            with pytest.raises(ParserError, match="PDF parsing failed"):
                await parser.parse("source-1", file=upload)


class TestHTMLParser:
    """Test cases for HTMLParser"""
    
    @pytest.mark.asyncio
    async def test_html_parser_basic(self):
        """Test basic HTML parsing functionality"""
        html_content = "<html><body><h1>Title</h1><p>Paragraph content</p></body></html>"
        upload = UploadFile(filename="test.html", file=io.BytesIO(html_content.encode()), content_type="text/html")
        
        parser = HTMLParser()
        chunks = await parser.parse("source-1", file=upload)
        
        assert len(chunks) >= 1
        assert any("Title" in chunk["content"] for chunk in chunks)
        assert any("Paragraph content" in chunk["content"] for chunk in chunks)
        assert all(chunk["metadata"]["format"] == "text/html" for chunk in chunks)
    
    @pytest.mark.asyncio
    async def test_html_parser_malformed_html(self):
        """Test HTML parser with malformed HTML"""
        malformed_html = "<html><body><h1>Unclosed header<p>Missing closing tags"
        upload = UploadFile(filename="malformed.html", file=io.BytesIO(malformed_html.encode()), content_type="text/html")
        
        parser = HTMLParser()
        chunks = await parser.parse("source-1", file=upload)
        
        # Should not crash and should extract some content
        assert len(chunks) >= 1
        assert any("Unclosed header" in chunk["content"] for chunk in chunks)
    
    @pytest.mark.asyncio
    async def test_html_parser_with_scripts_styles(self):
        """Test HTML parser filters out scripts and styles"""
        html_with_scripts = """
        <html>
            <head>
                <script>alert('test');</script>
                <style>body { color: red; }</style>
            </head>
            <body>
                <h1>Real Content</h1>
                <script>more_js();</script>
                <p>Paragraph text</p>
            </body>
        </html>
        """
        upload = UploadFile(filename="scripts.html", file=io.BytesIO(html_with_scripts.encode()), content_type="text/html")
        
        parser = HTMLParser()
        chunks = await parser.parse("source-1", file=upload)
        
        # Should extract content but not scripts/styles
        content_text = " ".join(chunk["content"] for chunk in chunks)
        assert "Real Content" in content_text
        assert "Paragraph text" in content_text
        assert "alert" not in content_text
        assert "color: red" not in content_text
    
    @pytest.mark.asyncio
    async def test_html_parser_empty_html(self):
        """Test HTML parser with empty HTML"""
        empty_html = "<html><body></body></html>"
        upload = UploadFile(filename="empty.html", file=io.BytesIO(empty_html.encode()), content_type="text/html")
        
        parser = HTMLParser()
        chunks = await parser.parse("source-1", file=upload)
        
        assert chunks == []
    
    @pytest.mark.asyncio
    async def test_html_parser_no_file(self):
        """Test HTML parser raises error when no file provided"""
        parser = HTMLParser()
        
        with pytest.raises(ValueError, match="HTMLParser requires a file"):
            await parser.parse("source-1")


class TestOcrParser:
    """Test cases for OcrParser"""
    
    @pytest.mark.asyncio
    async def test_ocr_parser_basic(self):
        """Test basic OCR parsing functionality"""
        fake_img_bytes = b"fake-image-data"
        upload = UploadFile(filename="test.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")
        
        with patch("api.tasks.ocr_image.apply_async") as mock_celery:
            mock_result = MagicMock()
            mock_result.get.return_value = "Extracted text from image\n\nSecond paragraph"
            mock_celery.return_value = mock_result
            
            parser = OcrParser()
            chunks = await parser.parse("source-1", file=upload)
            
            assert len(chunks) == 2
            assert chunks[0]["content"] == "Extracted text from image"
            assert chunks[1]["content"] == "Second paragraph"
            assert all(chunk["metadata"]["format"] == "image/ocr" for chunk in chunks)
            mock_celery.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_ocr_parser_empty_result(self):
        """Test OCR parser with empty extraction result"""
        fake_img_bytes = b"fake-image-data"
        upload = UploadFile(filename="blank.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")
        
        with patch("api.tasks.ocr_image.apply_async") as mock_celery:
            mock_result = MagicMock()
            mock_result.get.return_value = ""
            mock_celery.return_value = mock_result
            
            parser = OcrParser()
            chunks = await parser.parse("source-1", file=upload)
            
            assert chunks == []
    
    @pytest.mark.asyncio
    async def test_ocr_parser_celery_failure(self):
        """Test OCR parser when Celery task fails"""
        fake_img_bytes = b"fake-image-data"
        upload = UploadFile(filename="test.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")
        
        with patch("api.tasks.ocr_image.apply_async") as mock_celery:
            mock_result = MagicMock()
            mock_result.get.side_effect = Exception("Celery task failed")
            mock_celery.return_value = mock_result
            
            parser = OcrParser()
            
            with pytest.raises(ParserError, match="OCR processing failed"):
                await parser.parse("source-1", file=upload)
    
    @pytest.mark.asyncio
    async def test_ocr_parser_no_file(self):
        """Test OCR parser raises error when no file provided"""
        parser = OcrParser()
        
        with pytest.raises(ValueError, match="OcrParser requires a file"):
            await parser.parse("source-1")


class TestLinkParser:
    """Test cases for LinkParser"""
    
    @pytest.mark.asyncio
    async def test_link_parser_html_content(self):
        """Test LinkParser with HTML content"""
        test_url = "https://example.com/test.html"
        html_content = b"<html><body><h1>Web Page Title</h1><p>Web content</p></body></html>"
        
        with patch("aiohttp.ClientSession") as mock_session:
            mock_response = AsyncMock()
            mock_response.read.return_value = html_content
            
            mock_context = AsyncMock()
            mock_context.__aenter__.return_value = mock_response
            
            mock_session_instance = AsyncMock()
            mock_session_instance.get.return_value = mock_context
            mock_session.return_value.__aenter__.return_value = mock_session_instance
            
            with patch("magic.from_buffer", return_value="text/html"):
                with patch("api.services.parsers.HTMLParser.parse") as mock_html_parse:
                    mock_html_parse.return_value = [
                        {
                            "content": "Web Page Title",
                            "role": "user",
                            "timestamp": datetime.now(),
                            "metadata": {"format": "text/html"}
                        }
                    ]
                    
                    parser = LinkParser()
                    chunks = await parser.parse("source-1", url=test_url)
                    
                    assert len(chunks) == 1
                    assert chunks[0]["content"] == "Web Page Title"
                    assert chunks[0]["metadata"]["source_url"] == test_url
                    assert chunks[0]["metadata"]["content_type"] == "text/html"
    
    @pytest.mark.asyncio
    async def test_link_parser_pdf_content(self):
        """Test LinkParser with PDF content"""
        test_url = "https://example.com/document.pdf"
        pdf_content = b"%PDF-1.4 mock pdf"
        
        with patch("aiohttp.ClientSession") as mock_session:
            mock_response = AsyncMock()
            mock_response.read.return_value = pdf_content
            
            mock_context = AsyncMock()
            mock_context.__aenter__.return_value = mock_response
            
            mock_session_instance = AsyncMock()
            mock_session_instance.get.return_value = mock_context
            mock_session.return_value.__aenter__.return_value = mock_session_instance
            
            with patch("magic.from_buffer", return_value="application/pdf"):
                with patch("api.services.parsers.PDFParser.parse") as mock_pdf_parse:
                    mock_pdf_parse.return_value = [
                        {
                            "content": "PDF document content",
                            "role": "user", 
                            "timestamp": datetime.now(),
                            "metadata": {"format": "application/pdf"}
                        }
                    ]
                    
                    parser = LinkParser()
                    chunks = await parser.parse("source-1", url=test_url)
                    
                    assert len(chunks) == 1
                    assert chunks[0]["content"] == "PDF document content"
                    assert chunks[0]["metadata"]["source_url"] == test_url
                    assert chunks[0]["metadata"]["content_type"] == "application/pdf"
    
    @pytest.mark.asyncio
    async def test_link_parser_image_content(self):
        """Test LinkParser with image content"""
        test_url = "https://example.com/image.png"
        image_content = b"fake-image-data"
        
        with patch("aiohttp.ClientSession") as mock_session:
            mock_response = AsyncMock()
            mock_response.read.return_value = image_content
            
            mock_context = AsyncMock()
            mock_context.__aenter__.return_value = mock_response
            
            mock_session_instance = AsyncMock()
            mock_session_instance.get.return_value = mock_context
            mock_session.return_value.__aenter__.return_value = mock_session_instance
            
            with patch("magic.from_buffer", return_value="image/png"):
                with patch("api.services.parsers.OcrParser.parse") as mock_ocr_parse:
                    mock_ocr_parse.return_value = [
                        {
                            "content": "Text extracted from image",
                            "role": "user",
                            "timestamp": datetime.now(),
                            "metadata": {"format": "image/ocr"}
                        }
                    ]
                    
                    parser = LinkParser()
                    chunks = await parser.parse("source-1", url=test_url)
                    
                    assert len(chunks) == 1
                    assert chunks[0]["content"] == "Text extracted from image"
                    assert chunks[0]["metadata"]["source_url"] == test_url
                    assert chunks[0]["metadata"]["content_type"] == "image/png"
    
    @pytest.mark.asyncio
    async def test_link_parser_caching(self):
        """Test LinkParser caching functionality"""
        test_url = "https://example.com/cached.html"
        html_content = b"<html><body>Cached content</body></html>"
        
        with patch("aiohttp.ClientSession") as mock_session:
            mock_response = AsyncMock()
            mock_response.read.return_value = html_content
            
            mock_context = AsyncMock()
            mock_context.__aenter__.return_value = mock_response
            
            mock_session_instance = AsyncMock()
            mock_session_instance.get.return_value = mock_context
            mock_session.return_value.__aenter__.return_value = mock_session_instance
            
            with patch("magic.from_buffer", return_value="text/html"):
                with patch("api.services.parsers.HTMLParser.parse") as mock_html_parse:
                    mock_html_parse.return_value = [
                        {
                            "content": "Cached content",
                            "role": "user",
                            "timestamp": datetime.now(),
                            "metadata": {"format": "text/html"}
                        }
                    ]
                    
                    parser = LinkParser()
                    
                    # First call
                    chunks1 = await parser.parse("source-1", url=test_url)
                    # Second call should use cache
                    chunks2 = await parser.parse("source-1", url=test_url)
                    
                    assert chunks1 == chunks2
                    # HTMLParser.parse should only be called once due to caching
                    assert mock_html_parse.call_count == 1
    
    @pytest.mark.asyncio
    async def test_link_parser_network_error(self):
        """Test LinkParser with network error"""
        test_url = "https://example.com/unreachable.html"
        
        with patch("aiohttp.ClientSession") as mock_session:
            mock_session_instance = AsyncMock()
            mock_session_instance.get.side_effect = Exception("Network error")
            mock_session.return_value.__aenter__.return_value = mock_session_instance
            
            parser = LinkParser()
            
            with pytest.raises(ParserError, match="Link parsing failed"):
                await parser.parse("source-1", url=test_url)
    
    @pytest.mark.asyncio
    async def test_link_parser_no_url(self):
        """Test LinkParser raises error when no URL provided"""
        parser = LinkParser()
        
        with pytest.raises(ValueError, match="LinkParser requires a URL"):
            await parser.parse("source-1")


class TestParserRegistry:
    """Test cases for PARSER_REGISTRY"""
    
    def test_parser_registry_completeness(self):
        """Test that all expected parsers are in the registry"""
        expected_parsers = ["copy_paste", "html", "pdf", "screenshot", "link"]
        
        for parser_type in expected_parsers:
            assert parser_type in PARSER_REGISTRY
            assert PARSER_REGISTRY[parser_type] is not None
    
    def test_parser_registry_types(self):
        """Test that registered parsers are correct types"""
        assert isinstance(PARSER_REGISTRY["copy_paste"], TextParser)
        assert isinstance(PARSER_REGISTRY["html"], HTMLParser)
        assert isinstance(PARSER_REGISTRY["pdf"], PDFParser)
        assert isinstance(PARSER_REGISTRY["screenshot"], OcrParser)
        assert isinstance(PARSER_REGISTRY["link"], LinkParser)


class TestParserEdgeCases:
    """Test edge cases and error conditions across all parsers"""
    
    @pytest.mark.asyncio
    async def test_parsers_with_very_large_content(self):
        """Test parsers with very large content"""
        # Create large text content (1MB)
        large_content = "Large content paragraph. " * 40000
        upload = UploadFile(filename="large.txt", file=io.BytesIO(large_content.encode()), content_type="text/plain")
        
        parser = TextParser()
        chunks = await parser.parse("source-1", file=upload)
        
        # Should handle large content without crashing
        assert len(chunks) >= 1
        total_content = "".join(chunk["content"] for chunk in chunks)
        assert len(total_content) > 500000  # Significant portion preserved
    
    @pytest.mark.asyncio
    async def test_parsers_with_unicode_content(self):
        """Test parsers with various Unicode characters"""
        unicode_content = "English, Español, 中文, العربية, हिन्दी, 🚀🌟✨"
        upload = UploadFile(filename="unicode.txt", file=io.BytesIO(unicode_content.encode('utf-8')), content_type="text/plain")
        
        parser = TextParser()
        chunks = await parser.parse("source-1", file=upload)
        
        assert len(chunks) == 1
        assert unicode_content in chunks[0]["content"]
    
    @pytest.mark.asyncio
    async def test_parsers_mixed_content_types(self):
        """Test that parsers handle mixed/unexpected content gracefully"""
        # Test HTML parser with plain text
        plain_text = "This is just plain text without HTML tags"
        upload = UploadFile(filename="plain.html", file=io.BytesIO(plain_text.encode()), content_type="text/html")
        
        parser = HTMLParser()
        chunks = await parser.parse("source-1", file=upload)
        
        # Should extract the plain text content
        assert len(chunks) >= 1
        assert "plain text" in " ".join(chunk["content"] for chunk in chunks)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
