import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient

from api.routes.micro_threads import router
from api.services.micro_thread_service import MicroThreadService

# Create test client
from fastapi import FastAPI
app = FastAPI()
app.include_router(router)
client = TestClient(app)

class TestMicroThreadService:
    """Test cases for MicroThreadService"""
    
    @pytest.fixture
    def micro_thread_service(self):
        return MicroThreadService()
    
    @pytest.mark.asyncio
    async def test_create_micro_thread_success(self, micro_thread_service):
        """Test successful micro-thread creation"""
        mock_chunk = {
            "id": "chunk-1",
            "text_chunk": "Original chunk content",
            "participant_label": "Assistant"
        }
        
        mock_llm_response = {
            "responseText": "This is a follow-up response",
            "modelUsed": "gpt-4"
        }
        
        with patch.object(micro_thread_service.db_service, 'get_chunk') as mock_get_chunk:
            mock_get_chunk.return_value = mock_chunk
            
            with patch.object(micro_thread_service.llm_service, 'route_to_llm') as mock_llm:
                mock_llm.return_value = mock_llm_response
                
                with patch.object(micro_thread_service.db_service, 'create_micro_thread') as mock_create:
                    mock_create.return_value = "micro-thread-1"
                    
                    result = await micro_thread_service.create_micro_thread(
                        chunk_id="chunk-1",
                        question="What does this mean?",
                        context="Additional context"
                    )
                    
                    assert result["thread_id"] == "micro-thread-1"
                    assert result["answer"] == "This is a follow-up response"
                    assert result["model_used"] == "gpt-4"
                    mock_get_chunk.assert_called_once_with("chunk-1")
                    mock_llm.assert_called_once()
                    mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_micro_thread_chunk_not_found(self, micro_thread_service):
        """Test micro-thread creation with non-existent chunk"""
        with patch.object(micro_thread_service.db_service, 'get_chunk') as mock_get_chunk:
            mock_get_chunk.return_value = None
            
            with pytest.raises(ValueError, match="Chunk not found"):
                await micro_thread_service.create_micro_thread(
                    chunk_id="nonexistent",
                    question="What does this mean?"
                )

    @pytest.mark.asyncio
    async def test_get_micro_threads_by_chunk(self, micro_thread_service):
        """Test retrieving micro-threads for a chunk"""
        mock_micro_threads = [
            {
                "id": "mt-1",
                "user_prompt": "Question 1",
                "assistant_response": "Answer 1",
                "model_used": "gpt-4",
                "created_at": "2024-01-01T00:00:00Z",
                "metadata": {}
            },
            {
                "id": "mt-2",
                "user_prompt": "Question 2",
                "assistant_response": "Answer 2",
                "model_used": "gpt-3.5-turbo",
                "created_at": "2024-01-01T01:00:00Z",
                "metadata": {}
            }
        ]
        
        with patch.object(micro_thread_service.db_service, 'get_micro_threads_by_chunk') as mock_get:
            mock_get.return_value = mock_micro_threads
            
            result = await micro_thread_service.get_micro_threads_by_chunk("chunk-1")
            
            assert len(result) == 2
            assert result[0]["id"] == "mt-1"
            assert result[0]["userPrompt"] == "Question 1"
            assert result[1]["id"] == "mt-2"
            mock_get.assert_called_once_with("chunk-1")

    @pytest.mark.asyncio
    async def test_llm_error_handling(self, micro_thread_service):
        """Test handling of LLM service errors"""
        mock_chunk = {
            "id": "chunk-1",
            "text_chunk": "Original chunk content"
        }
        
        with patch.object(micro_thread_service.db_service, 'get_chunk') as mock_get_chunk:
            mock_get_chunk.return_value = mock_chunk
            
            with patch.object(micro_thread_service.llm_service, 'route_to_llm') as mock_llm:
                mock_llm.side_effect = Exception("LLM service error")
                
                with pytest.raises(Exception, match="LLM service error"):
                    await micro_thread_service.create_micro_thread(
                        chunk_id="chunk-1",
                        question="What does this mean?"
                    )

class TestMicroThreadRoutes:
    """Test cases for micro-thread API routes"""
    
    def test_create_micro_thread_success(self):
        """Test successful micro-thread creation via API"""
        with patch('api.routes.micro_threads.micro_thread_service.create_micro_thread') as mock_create:
            mock_create.return_value = {
                "thread_id": "mt-1",
                "answer": "Test answer",
                "model_used": "gpt-4",
                "timestamp": "2024-01-01T00:00:00Z"
            }
            
            response = client.post(
                "/thread",
                json={
                    "chunkId": "chunk-1",
                    "question": "What does this mean?",
                    "context": "Additional context"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["threadId"] == "mt-1"
            assert data["answer"] == "Test answer"
            assert data["modelUsed"] == "gpt-4"

    def test_create_micro_thread_missing_fields(self):
        """Test micro-thread creation with missing required fields"""
        response = client.post(
            "/thread",
            json={
                "chunkId": "chunk-1"
                # Missing question
            }
        )
        
        assert response.status_code == 422  # Validation error

    def test_get_micro_threads_success(self):
        """Test retrieving micro-threads for a chunk"""
        mock_micro_threads = [
            {
                "id": "mt-1",
                "userPrompt": "Question 1",
                "assistantResponse": "Answer 1",
                "modelUsed": "gpt-4",
                "createdAt": "2024-01-01T00:00:00Z",
                "metadata": {}
            }
        ]
        
        with patch('api.routes.micro_threads.micro_thread_service.get_micro_threads_by_chunk') as mock_get:
            mock_get.return_value = mock_micro_threads
            
            response = client.get("/thread/chunk-1/micro-threads")
            
            assert response.status_code == 200
            data = response.json()
            assert "microThreads" in data
            assert len(data["microThreads"]) == 1
            assert data["microThreads"][0]["id"] == "mt-1"

    def test_create_micro_thread_error(self):
        """Test micro-thread creation error handling"""
        with patch('api.routes.micro_threads.micro_thread_service.create_micro_thread') as mock_create:
            mock_create.side_effect = Exception("Service error")
            
            response = client.post(
                "/thread",
                json={
                    "chunkId": "chunk-1",
                    "question": "What does this mean?"
                }
            )
            
            assert response.status_code == 500
            assert "Service error" in response.json()["detail"]

if __name__ == "__main__":
    pytest.main([__file__])