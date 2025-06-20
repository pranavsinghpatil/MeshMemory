import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import UploadFile
import io

from api.routes.import_routes import router
# from api.services.import_service import ImportService

# Create test client
from fastapi import FastAPI
app = FastAPI()
app.include_router(router)
client = TestClient(app)

class TestImportService:
    """Test cases for ImportService"""
    
    @pytest.fixture
    def import_service(self):
        return ImportService()
    
    @pytest.mark.asyncio
    async def test_process_chatgpt_import(self, import_service):
        """Test ChatGPT link import processing"""
        with patch.object(import_service, '_process_chatgpt_link') as mock_process:
            mock_process.return_value = [
                {
                    "text": "Test message",
                    "participant": "User",
                    "timestamp": "2024-01-01T00:00:00Z",
                    "metadata": {"source": "chatgpt"}
                }
            ]
            
            with patch.object(import_service.db_service, 'create_source') as mock_create_source:
                mock_create_source.return_value = "test-source-id"
                
                with patch.object(import_service.db_service, 'create_chunk') as mock_create_chunk:
                    mock_create_chunk.return_value = "test-chunk-id"
                    
                    with patch.object(import_service.embedding_service, 'generate_embedding') as mock_embedding:
                        mock_embedding.return_value = [0.1] * 1536
                        
                        result = await import_service.process_import(
                            source_type="chatgpt",
                            url="https://chat.openai.com/share/test",
                            title="Test ChatGPT Import"
                        )
                        
                        assert result["source_id"] == "test-source-id"
                        assert result["chunks_processed"] == 1
                        mock_process.assert_called_once()
                        mock_create_source.assert_called_once()
                        mock_create_chunk.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_youtube_import(self, import_service):
        """Test YouTube link import processing"""
        with patch.object(import_service, '_process_youtube_link') as mock_process:
            mock_process.return_value = [
                {
                    "text": "Welcome to this tutorial",
                    "participant": "Narrator",
                    "timestamp": "2024-01-01T00:00:00Z",
                    "metadata": {"source": "youtube"}
                }
            ]
            
            with patch.object(import_service.db_service, 'create_source') as mock_create_source:
                mock_create_source.return_value = "test-source-id"
                
                with patch.object(import_service.db_service, 'create_chunk') as mock_create_chunk:
                    mock_create_chunk.return_value = "test-chunk-id"
                    
                    with patch.object(import_service.embedding_service, 'generate_embedding') as mock_embedding:
                        mock_embedding.return_value = [0.1] * 1536
                        
                        result = await import_service.process_import(
                            source_type="youtube",
                            url="https://www.youtube.com/watch?v=test",
                            title="Test YouTube Import"
                        )
                        
                        assert result["source_id"] == "test-source-id"
                        assert result["chunks_processed"] == 1

    @pytest.mark.asyncio
    async def test_process_file_import(self, import_service):
        """Test file import processing"""
        # Create mock file
        file_content = b"Test file content"
        mock_file = Mock(spec=UploadFile)
        mock_file.filename = "test.pdf"
        mock_file.read = AsyncMock(return_value=file_content)
        
        with patch.object(import_service, '_process_gemini_pdf') as mock_process:
            mock_process.return_value = [
                {
                    "text": "Test PDF content",
                    "participant": "User",
                    "timestamp": "2024-01-01T00:00:00Z",
                    "metadata": {"source": "gemini"}
                }
            ]
            
            with patch.object(import_service.db_service, 'create_source') as mock_create_source:
                mock_create_source.return_value = "test-source-id"
                
                with patch.object(import_service.db_service, 'create_chunk') as mock_create_chunk:
                    mock_create_chunk.return_value = "test-chunk-id"
                    
                    with patch.object(import_service.embedding_service, 'generate_embedding') as mock_embedding:
                        mock_embedding.return_value = [0.1] * 1536
                        
                        result = await import_service.process_import(
                            source_type="gemini",
                            file=mock_file,
                            title="Test PDF Import"
                        )
                        
                        assert result["source_id"] == "test-source-id"
                        assert result["chunks_processed"] == 1

    @pytest.mark.asyncio
    async def test_invalid_source_type(self, import_service):
        """Test handling of invalid source type"""
        with pytest.raises(ValueError, match="Unsupported source type"):
            await import_service.process_import(
                source_type="invalid",
                title="Test Invalid Import"
            )

class TestImportRoutes:
    """Test cases for import API routes"""

    def test_import_text_paste(self):
        """Test import with pasted plain text"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "sourceId": "text-id",
                "chatId": "chat-id",
                "status": "success",
                "message": "Successfully imported copy_paste source",
                "chunksProcessed": 2
            }
            response = client.post(
                "/import",
                data={
                    "type": "copy_paste",
                    "text": "Hello\n\nHow are you?",
                    "title": "Test Text Paste"
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "text-id"
            assert data["status"] == "success"
            assert data["chunksProcessed"] == 2

    def test_import_html_paste(self):
        """Test import with pasted HTML"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "sourceId": "html-id",
                "chatId": "chat-id",
                "status": "success",
                "message": "Successfully imported html source",
                "chunksProcessed": 3
            }
            response = client.post(
                "/import",
                data={
                    "type": "html",
                    "html": "<h1>Header</h1><p>Paragraph</p>",
                    "title": "Test HTML Paste"
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "html-id"
            assert data["status"] == "success"
            assert data["chunksProcessed"] == 3

    def test_import_empty_input(self):
        """Test import with no file, text, html, or url (malformed input)"""
        response = client.post(
            "/import",
            data={
                "type": "copy_paste",
                "title": "Empty Import"
            }
        )
        # Should fallback to error or empty import
        assert response.status_code in (400, 500)
        assert ("requires" in response.text.lower()) or ("error" in response.text.lower())

    def test_import_html_invalid(self):
        """Test import with invalid HTML (should not crash)"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "sourceId": "html-id",
                "chatId": "chat-id",
                "status": "success",
                "message": "Successfully imported html source",
                "chunksProcessed": 1
            }
            response = client.post(
                "/import",
                data={
                    "type": "html",
                    "html": "<html><body><h1>Header",
                    "title": "Broken HTML"
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "html-id"
            assert data["chunksProcessed"] == 1

    def test_import_chatgpt_success(self):
        """Test successful ChatGPT import via API"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "test-source-id",
                "chunks_processed": 5
            }
            
            response = client.post(
                "/import",
                data={
                    "type": "chatgpt",
                    "url": "https://chat.openai.com/share/test",
                    "title": "Test Import"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "test-source-id"
            assert data["status"] == "success"
            assert data["chunksProcessed"] == 5

    def test_import_missing_url(self):
        """Test import with missing required URL"""
        response = client.post(
            "/import",
            data={
                "type": "chatgpt",
                "title": "Test Import"
                # Missing URL
            }
        )
        
        assert response.status_code == 400
        assert "URL required" in response.json()["detail"]

    def test_import_invalid_type(self):
        """Test import with invalid source type"""
        response = client.post(
            "/import",
            data={
                "type": "invalid",
                "url": "https://example.com",
                "title": "Test Import"
            }
        )
        
        assert response.status_code == 400
        assert "Invalid source type" in response.json()["detail"]

    def test_import_file_upload(self):
        """Test file upload import"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "test-source-id",
                "chunks_processed": 3
            }
            
            # Create test file
            test_file = io.BytesIO(b"test file content")
            
            response = client.post(
                "/import",
                data={
                    "type": "gemini",
                    "title": "Test File Import"
                },
                files={"file": ("test.pdf", test_file, "application/pdf")}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "test-source-id"
            assert data["chunksProcessed"] == 3

    def test_import_grouped_success(self):
        """Test grouped import via API"""
        with patch('api.routes.import_routes.import_service.process_grouped_import') as mock_group:
            mock_group.return_value = {
                "import_batch_id": "batch-id",
                "chunks_processed": 2,
                "artefact_count": 2,
                "status": "success"
            }
            test_file1 = io.BytesIO(b"test1")
            test_file2 = io.BytesIO(b"test2")
            response = client.post(
                "/import/grouped",
                data={
                    "types": ["copy_paste", "copy_paste"],
                    "titles": ["f1", "f2"]
                },
                files=[
                    ("files", ("f1.txt", test_file1, "text/plain")),
                    ("files", ("f2.txt", test_file2, "text/plain"))
                ]
            )
            assert response.status_code == 200
            data = response.json()
            assert data["importBatchId"] == "batch-id"

if __name__ == "__main__":

    pytest.main([__file__])