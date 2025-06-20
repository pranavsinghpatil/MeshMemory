import pytest
import io
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import UploadFile

from api.services.parsers import PDFParser, ParserError

@pytest.mark.asyncio
async def test_pdf_parser_extracts_text():
    """PDFParser should extract paragraphs using pdfplumber."""
    # Create fake PDF bytes (content doesn't matter because we'll mock pdfplumber)
    fake_pdf_bytes = b"%PDF-1.4 mock pdf content"
    upload = UploadFile(filename="test.pdf", file=io.BytesIO(fake_pdf_bytes), content_type="application/pdf")

    # Prepare mock for pdfplumber.open
    with patch("api.services.parsers.pdfplumber.open") as mock_open:
        mock_pdf = MagicMock()
        mock_page1 = MagicMock()
        mock_page1.extract_text.return_value = "Hello world\n\nThis is page 1"
        mock_page2 = MagicMock()
        mock_page2.extract_text.return_value = "Another paragraph on page 2"
        mock_pdf.pages = [mock_page1, mock_page2]
        mock_open.return_value.__enter__.return_value = mock_pdf

        parser = PDFParser()
        chunks = await parser.parse("source-id", file=upload)

        assert len(chunks) == 3  # two paragraphs from page1, one from page2
        assert all(chunk["metadata"]["format"] == "application/pdf" for chunk in chunks)
        assert chunks[0]["content"].startswith("Hello")

@pytest.mark.asyncio
async def test_pdf_parser_empty_pages():
    """Test PDF parser with empty pages"""
    fake_pdf_bytes = b"%PDF-1.4 empty pdf"
    upload = UploadFile(filename="empty.pdf", file=io.BytesIO(fake_pdf_bytes), content_type="application/pdf")

    with patch("api.services.parsers.pdfplumber.open") as mock_open:
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.extract_text.return_value = ""  # Empty page
        mock_pdf.pages = [mock_page]
        mock_open.return_value.__enter__.return_value = mock_pdf

        parser = PDFParser()
        chunks = await parser.parse("source-id", file=upload)

        assert chunks == []

@pytest.mark.asyncio
async def test_pdf_parser_mixed_empty_content():
    """Test PDF parser with mix of empty and content pages"""
    fake_pdf_bytes = b"%PDF-1.4 mixed pdf"
    upload = UploadFile(filename="mixed.pdf", file=io.BytesIO(fake_pdf_bytes), content_type="application/pdf")

    with patch("api.services.parsers.pdfplumber.open") as mock_open:
        mock_pdf = MagicMock()
        
        mock_page1 = MagicMock()
        mock_page1.extract_text.return_value = "Content on page 1"
        
        mock_page2 = MagicMock()
        mock_page2.extract_text.return_value = ""  # Empty page
        
        mock_page3 = MagicMock()
        mock_page3.extract_text.return_value = "Content on page 3"
        
        mock_pdf.pages = [mock_page1, mock_page2, mock_page3]
        mock_open.return_value.__enter__.return_value = mock_pdf

        parser = PDFParser()
        chunks = await parser.parse("source-id", file=upload)

        assert len(chunks) == 2  # Only non-empty pages
        assert chunks[0]["content"] == "Content on page 1"
        assert chunks[1]["content"] == "Content on page 3"

@pytest.mark.asyncio
async def test_pdf_parser_no_file():
    """Test PDF parser raises error when no file provided"""
    parser = PDFParser()
    
    with pytest.raises(ValueError, match="PDFParser requires a file"):
        await parser.parse("source-id")

@pytest.mark.asyncio
async def test_pdf_parser_corrupted_file():
    """Test PDF parser with corrupted PDF file"""
    corrupted_pdf = b"not a real pdf file"
    upload = UploadFile(filename="corrupted.pdf", file=io.BytesIO(corrupted_pdf), content_type="application/pdf")

    with patch("api.services.parsers.pdfplumber.open") as mock_open:
        mock_open.side_effect = Exception("Invalid PDF structure")

        parser = PDFParser()
        
        with pytest.raises(ParserError, match="PDF parsing failed"):
            await parser.parse("source-id", file=upload)

@pytest.mark.asyncio
async def test_pdf_parser_large_document():
    """Test PDF parser with large document (many pages)"""
    fake_pdf_bytes = b"%PDF-1.4 large pdf"
    upload = UploadFile(filename="large.pdf", file=io.BytesIO(fake_pdf_bytes), content_type="application/pdf")

    with patch("api.services.parsers.pdfplumber.open") as mock_open:
        mock_pdf = MagicMock()
        
        # Create 50 pages with content
        pages = []
        for i in range(50):
            page = MagicMock()
            page.extract_text.return_value = f"Content from page {i+1}\n\nParagraph 2 on page {i+1}"
            pages.append(page)
        
        mock_pdf.pages = pages
        mock_open.return_value.__enter__.return_value = mock_pdf

        parser = PDFParser()
        chunks = await parser.parse("source-id", file=upload)

        assert len(chunks) == 100  # 2 paragraphs per page * 50 pages
        assert all(chunk["metadata"]["format"] == "application/pdf" for chunk in chunks)

@pytest.mark.asyncio
async def test_pdf_parser_special_characters():
    """Test PDF parser with special characters and Unicode"""
    fake_pdf_bytes = b"%PDF-1.4 unicode pdf"
    upload = UploadFile(filename="unicode.pdf", file=io.BytesIO(fake_pdf_bytes), content_type="application/pdf")

    with patch("api.services.parsers.pdfplumber.open") as mock_open:
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Héllo wörld! 🌍\n\nSpëcial chars: àáâãäåæçèéêë"
        mock_pdf.pages = [mock_page]
        mock_open.return_value.__enter__.return_value = mock_pdf

        parser = PDFParser()
        chunks = await parser.parse("source-id", file=upload)

        assert len(chunks) == 2
        assert "Héllo wörld! 🌍" in chunks[0]["content"]
        assert "Spëcial chars" in chunks[1]["content"]

@pytest.mark.asyncio
async def test_pdf_parser_metadata_consistency():
    """Test that PDF parser maintains consistent metadata across chunks"""
    fake_pdf_bytes = b"%PDF-1.4 metadata test"
    upload = UploadFile(filename="metadata.pdf", file=io.BytesIO(fake_pdf_bytes), content_type="application/pdf")

    with patch("api.services.parsers.pdfplumber.open") as mock_open:
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "First chunk\n\nSecond chunk\n\nThird chunk"
        mock_pdf.pages = [mock_page]
        mock_open.return_value.__enter__.return_value = mock_pdf

        parser = PDFParser()
        chunks = await parser.parse("source-id", file=upload)

        # Verify all chunks have consistent metadata
        for chunk in chunks:
            assert chunk["role"] == "user"
            assert chunk["metadata"]["format"] == "application/pdf"
            assert "timestamp" in chunk
            assert "content" in chunk

from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routes.import_routes import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)


def test_import_pdf_route():
    """/import should accept pdf files and return success"""
    fake_pdf_bytes = b"%PDF-1.4 dummy"
    with patch("api.services.import_service.ImportService.process_import") as mock_process:
        mock_process.return_value = {
            "sourceId": "pdf-id",
            "chatId": "chat-id",
            "status": "success",
            "message": "Successfully imported pdf source",
            "chunksProcessed": 2
        }
        response = client.post(
            "/import",
            data={
                "type": "pdf",
                "title": "PDF Test"
            },
            files={
                "file": ("test.pdf", fake_pdf_bytes, "application/pdf")
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["sourceId"] == "pdf-id"
        assert data["status"] == "success"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
