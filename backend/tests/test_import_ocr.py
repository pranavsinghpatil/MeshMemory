import pytest
import io
from unittest.mock import patch, MagicMock
from fastapi import UploadFile

from api.services.parsers import OcrParser

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
