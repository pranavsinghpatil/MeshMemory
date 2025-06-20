import pytest
import io
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import UploadFile

from api.services.parsers import PDFParser

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
        assert chunks[0]["text"].startswith("Hello")

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
