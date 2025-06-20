import pytest
import io
from unittest.mock import patch, MagicMock
from fastapi import UploadFile

from api.services.parsers import OcrParser, ParserError

@pytest.mark.asyncio
async def test_ocr_parser_uses_celery():
    fake_img_bytes = b"fake-image-bytes"
    upload = UploadFile(filename="img.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")

    with patch("api.tasks.ocr_image.apply_async") as mock_apply:
        mock_result = MagicMock()
        mock_result.get.return_value = "Hello\n\nWorld"
        mock_apply.return_value = mock_result

        parser = OcrParser()
        chunks = await parser.parse("src-id", file=upload)

        mock_apply.assert_called_once()
        assert len(chunks) == 2
        assert chunks[0]["content"] == "Hello"

@pytest.mark.asyncio
async def test_ocr_parser_empty_result():
    """Test OCR parser with empty extraction result"""
    fake_img_bytes = b"fake-image-bytes"
    upload = UploadFile(filename="blank.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")

    with patch("api.tasks.ocr_image.apply_async") as mock_apply:
        mock_result = MagicMock()
        mock_result.get.return_value = ""  # Empty OCR result
        mock_apply.return_value = mock_result

        parser = OcrParser()
        chunks = await parser.parse("src-id", file=upload)

        assert chunks == []

@pytest.mark.asyncio
async def test_ocr_parser_whitespace_only():
    """Test OCR parser with whitespace-only result"""
    fake_img_bytes = b"fake-image-bytes"
    upload = UploadFile(filename="whitespace.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")

    with patch("api.tasks.ocr_image.apply_async") as mock_apply:
        mock_result = MagicMock()
        mock_result.get.return_value = "   \n\n   \t  "  # Only whitespace
        mock_apply.return_value = mock_result

        parser = OcrParser()
        chunks = await parser.parse("src-id", file=upload)

        assert chunks == []

@pytest.mark.asyncio
async def test_ocr_parser_celery_failure():
    """Test OCR parser when Celery task fails"""
    fake_img_bytes = b"fake-image-bytes"
    upload = UploadFile(filename="error.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")

    with patch("api.tasks.ocr_image.apply_async") as mock_apply:
        mock_result = MagicMock()
        mock_result.get.side_effect = Exception("Celery task failed")
        mock_apply.return_value = mock_result

        parser = OcrParser()
        
        with pytest.raises(ParserError, match="OCR processing failed"):
            await parser.parse("src-id", file=upload)

@pytest.mark.asyncio
async def test_ocr_parser_multiple_paragraphs():
    """Test OCR parser with multiple paragraphs"""
    fake_img_bytes = b"fake-image-bytes"
    upload = UploadFile(filename="multi.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")

    with patch("api.tasks.ocr_image.apply_async") as mock_apply:
        mock_result = MagicMock()
        mock_result.get.return_value = "First paragraph\n\nSecond paragraph\n\nThird paragraph"
        mock_apply.return_value = mock_result

        parser = OcrParser()
        chunks = await parser.parse("src-id", file=upload)

        assert len(chunks) == 3
        assert chunks[0]["content"] == "First paragraph"
        assert chunks[1]["content"] == "Second paragraph"
        assert chunks[2]["content"] == "Third paragraph"
        assert all(chunk["metadata"]["format"] == "image/ocr" for chunk in chunks)

@pytest.mark.asyncio
async def test_ocr_parser_special_characters():
    """Test OCR parser with special characters and Unicode"""
    fake_img_bytes = b"fake-image-bytes"
    upload = UploadFile(filename="unicode.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")

    with patch("api.tasks.ocr_image.apply_async") as mock_apply:
        mock_result = MagicMock()
        mock_result.get.return_value = "Héllo wörld! 🌍\n\nSpëcial characters: àáâãäåæçèéêë"
        mock_apply.return_value = mock_result

        parser = OcrParser()
        chunks = await parser.parse("src-id", file=upload)

        assert len(chunks) == 2
        assert "Héllo wörld! 🌍" in chunks[0]["content"]
        assert "Spëcial characters" in chunks[1]["content"]

@pytest.mark.asyncio
async def test_ocr_parser_no_file():
    """Test OCR parser raises error when no file provided"""
    parser = OcrParser()
    
    with pytest.raises(ValueError, match="OcrParser requires a file"):
        await parser.parse("src-id")

@pytest.mark.asyncio
async def test_ocr_parser_large_text():
    """Test OCR parser with large amount of extracted text"""
    fake_img_bytes = b"fake-image-bytes"
    upload = UploadFile(filename="large.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")

    # Create large text content
    large_text = "Large paragraph content. " * 100 + "\n\n" + "Another large paragraph. " * 100
    
    with patch("api.tasks.ocr_image.apply_async") as mock_apply:
        mock_result = MagicMock()
        mock_result.get.return_value = large_text
        mock_apply.return_value = mock_result

        parser = OcrParser()
        chunks = await parser.parse("src-id", file=upload)

        assert len(chunks) == 2
        assert len(chunks[0]["content"]) > 2000  # Large chunk
        assert len(chunks[1]["content"]) > 2000  # Large chunk

@pytest.mark.asyncio
async def test_ocr_parser_metadata_consistency():
    """Test that OCR parser maintains consistent metadata across chunks"""
    fake_img_bytes = b"fake-image-bytes"
    upload = UploadFile(filename="metadata.png", file=io.BytesIO(fake_img_bytes), content_type="image/png")

    with patch("api.tasks.ocr_image.apply_async") as mock_apply:
        mock_result = MagicMock()
        mock_result.get.return_value = "First chunk\n\nSecond chunk"
        mock_apply.return_value = mock_result

        parser = OcrParser()
        chunks = await parser.parse("src-id", file=upload)

        # Verify all chunks have consistent metadata
        for chunk in chunks:
            assert chunk["role"] == "user"
            assert chunk["metadata"]["format"] == "image/ocr"
            assert "timestamp" in chunk
            assert "content" in chunk

from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routes.import_routes import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_import_ocr_route():
    fake_img_bytes = b"img-bytes"
    with patch("api.services.import_service.ImportService.process_import") as mock_proc:
        mock_proc.return_value = {
            "sourceId": "img-id",
            "chatId": "chat-id",
            "status": "success",
            "message": "Successfully imported screenshot source",
            "chunksProcessed": 1
        }
        response = client.post(
            "/import",
            data={"type": "screenshot", "title": "OCR test"},
            files={"file": ("shot.png", fake_img_bytes, "image/png")}
        )
        assert response.status_code == 200
        assert response.json()["sourceId"] == "img-id"

def test_ocr_via_api():
    with patch('api.routes.import_routes.import_service.process_import') as mock_process:
        mock_process.return_value = {
            "source_id": "ocr-id",
            "chunks_processed": 2,
            "status": "success"
        }
        
        fake_img = io.BytesIO(b"fake-image-data")
        
        response = client.post(
            "/import",
            data={"type": "screenshot", "title": "OCR Test"},
            files={"file": ("test.png", fake_img, "image/png")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["sourceId"] == "ocr-id"
        assert data["status"] == "success"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
