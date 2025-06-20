import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from api.services.import_service import ImportService

@pytest.mark.asyncio
async def test_chatgpt_link_parsing():
    service = ImportService()
    fake_html = """
    <html><head></head><body>
    <script id='__NEXT_DATA__' type='application/json'>
    {"props":{"pageProps":{"sharedConversationData":{"conversationData":{"mapping":{"1":{"message":{"author":{"role":"user"},"content":{"parts":["Hello"]},"create_time":1700000000}},"2":{"message":{"author":{"role":"assistant"},"content":{"parts":["Hi there!"]},"create_time":1700000001}}}}}}}}
    </script></body></html>
    """

    with patch("aiohttp.ClientSession.get") as mock_get:
        cm = MagicMock()
        cm.__aenter__.return_value.status = 200
        cm.__aenter__.return_value.text = AsyncMock(return_value=fake_html)
        mock_get.return_value = cm
        messages = await service._process_chatgpt_link("https://chat.openai.com/share/abcd")
        assert len(messages) == 2
        assert messages[0]["text"] == "Hello"
        assert messages[1]["participant"] == "Assistant"

from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routes.import_routes import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_import_chatgpt_route():
    with patch("api.services.import_service.ImportService.process_import") as mock_proc:
        mock_proc.return_value = {
            "sourceId": "share-id",
            "chatId": "chat-id",
            "status": "success",
            "message": "Successfully imported chatgpt source",
            "chunksProcessed": 2
        }
        resp = client.post(
            "/import",
            data={"type": "chatgpt", "url": "https://chat.openai.com/share/abcd", "title": "Link"}
        )
        assert resp.status_code == 200
        assert resp.json()["sourceId"] == "share-id"
