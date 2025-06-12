import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient

from api.routes.search import router
from api.services.search_service import SearchService

# Create test client
from fastapi import FastAPI
app = FastAPI()
app.include_router(router)
client = TestClient(app)

class TestSearchService:
    """Test cases for SearchService"""
    
    @pytest.fixture
    def search_service(self):
        return SearchService()
    
    @pytest.mark.asyncio
    async def test_semantic_search_success(self, search_service):
        """Test successful semantic search"""
        mock_results = [
            {
                "id": "chunk-1",
                "text_chunk": "Test chunk content",
                "similarity": 0.85,
                "source": {
                    "id": "source-1",
                    "title": "Test Source",
                    "type": "chatgpt-link"
                },
                "participant_label": "Assistant",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        ]
        
        with patch.object(search_service.embedding_service, 'generate_embedding') as mock_embedding:
            mock_embedding.return_value = [0.1] * 1536
            
            with patch.object(search_service.db_service, 'search_chunks_by_embedding') as mock_search:
                mock_search.return_value = mock_results
                
                with patch.object(search_service.db_service, 'get_source') as mock_get_source:
                    mock_get_source.return_value = {
                        "id": "source-1",
                        "title": "Test Source",
                        "type": "chatgpt-link",
                        "created_at": "2024-01-01T00:00:00Z"
                    }
                    
                    results = await search_service.semantic_search(
                        query="test query",
                        limit=10,
                        threshold=0.7
                    )
                    
                    assert len(results) == 1
                    assert results[0]["id"] == "chunk-1"
                    assert results[0]["similarity"] == 0.85
                    mock_embedding.assert_called_once_with("test query")

    @pytest.mark.asyncio
    async def test_generate_ai_response(self, search_service):
        """Test AI response generation from search results"""
        mock_results = [
            {
                "id": "chunk-1",
                "text_chunk": "React is a JavaScript library for building user interfaces",
                "source": {"title": "React Tutorial", "type": "chatgpt-link"},
                "participant_label": "Assistant"
            }
        ]
        
        with patch.object(search_service.llm_service, 'route_to_llm') as mock_llm:
            mock_llm.return_value = {
                "responseText": "Based on your conversations, React is a JavaScript library for building user interfaces."
            }
            
            response = await search_service.generate_ai_response("What is React?", mock_results)
            
            assert "React is a JavaScript library" in response
            mock_llm.assert_called_once()

    @pytest.mark.asyncio
    async def test_empty_search_results(self, search_service):
        """Test handling of empty search results"""
        with patch.object(search_service.embedding_service, 'generate_embedding') as mock_embedding:
            mock_embedding.return_value = [0.1] * 1536
            
            with patch.object(search_service.db_service, 'search_chunks_by_embedding') as mock_search:
                mock_search.return_value = []
                
                results = await search_service.semantic_search(
                    query="nonexistent query",
                    limit=10,
                    threshold=0.7
                )
                
                assert len(results) == 0

    @pytest.mark.asyncio
    async def test_search_suggestions(self, search_service):
        """Test search suggestions generation"""
        suggestions = await search_service.get_suggestions("React", 5)
        
        assert isinstance(suggestions, list)
        assert len(suggestions) <= 5
        # Should contain suggestions related to React
        react_suggestions = [s for s in suggestions if "react" in s.lower()]
        assert len(react_suggestions) > 0

class TestSearchRoutes:
    """Test cases for search API routes"""
    
    def test_search_success(self):
        """Test successful search via API"""
        with patch('api.routes.search.search_service.semantic_search') as mock_search:
            mock_search.return_value = [
                {
                    "id": "chunk-1",
                    "text_chunk": "Test content",
                    "similarity": 0.85,
                    "source": {"id": "source-1", "title": "Test Source"},
                    "participant_label": "Assistant",
                    "timestamp": "2024-01-01T00:00:00Z"
                }
            ]
            
            with patch('api.routes.search.search_service.generate_ai_response') as mock_ai:
                mock_ai.return_value = "AI generated response"
                
                response = client.get("/search?q=test query")
                
                assert response.status_code == 200
                data = response.json()
                assert data["query"] == "test query"
                assert len(data["results"]) == 1
                assert data["aiResponse"] == "AI generated response"
                assert data["totalResults"] == 1

    def test_search_empty_query(self):
        """Test search with empty query"""
        response = client.get("/search?q=")
        
        assert response.status_code == 400
        assert "cannot be empty" in response.json()["detail"]

    def test_search_with_parameters(self):
        """Test search with custom parameters"""
        with patch('api.routes.search.search_service.semantic_search') as mock_search:
            mock_search.return_value = []
            
            response = client.get("/search?q=test&limit=5&threshold=0.8")
            
            assert response.status_code == 200
            mock_search.assert_called_once_with(
                query="test",
                limit=5,
                threshold=0.8
            )

    def test_search_suggestions_success(self):
        """Test search suggestions endpoint"""
        with patch('api.routes.search.search_service.get_suggestions') as mock_suggestions:
            mock_suggestions.return_value = ["suggestion 1", "suggestion 2"]
            
            response = client.get("/search/suggestions?q=test")
            
            assert response.status_code == 200
            data = response.json()
            assert "suggestions" in data
            assert len(data["suggestions"]) == 2

    def test_search_error_handling(self):
        """Test search error handling"""
        with patch('api.routes.search.search_service.semantic_search') as mock_search:
            mock_search.side_effect = Exception("Database error")
            
            response = client.get("/search?q=test")
            
            assert response.status_code == 500
            assert "Database error" in response.json()["detail"]

if __name__ == "__main__":
    pytest.main([__file__])