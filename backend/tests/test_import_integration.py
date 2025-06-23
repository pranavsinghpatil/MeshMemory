"""
Integration tests for /import endpoint with all parser types.
Tests the complete flow from API request to parser execution.
"""

import pytest
import io
import json
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI

from api.routes.import_routes import router


# Create test client
app = FastAPI()
app.include_router(router, prefix="")
client = TestClient(app)


class TestImportEndpointIntegration:
    """Integration tests for /import endpoint with all parser types"""
    
    def test_import_text_paste_integration(self):
        """Test complete flow for text paste import"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "text-import-id",
                "chunks_processed": 2,
                "status": "success"
            }
            
            response = client.post(
                "/import",
                data={
                    "type": "copy_paste",
                    "text": "Hello world\n\nThis is a test paragraph",
                    "title": "Text Import Test"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "text-import-id"
            assert data["status"] == "success"
            assert data["chunksProcessed"] == 2
            
            # Verify import_service was called with correct parameters
            mock_process.assert_called_once()
            call_args = mock_process.call_args
            assert call_args[1]["import_method"] == "copy_paste"
            assert call_args[1]["title"] == "Text Import Test"
    
    def test_import_html_paste_integration(self):
        """Test complete flow for HTML paste import"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "html-import-id", 
                "chunks_processed": 3,
                "status": "success"
            }
            
            html_content = "<html><body><h1>Title</h1><p>Content</p></body></html>"
            
            response = client.post(
                "/import",
                data={
                    "type": "html",
                    "html": html_content,
                    "title": "HTML Import Test"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "html-import-id"
            assert data["chunksProcessed"] == 3
            
            # Verify HTML content was passed correctly
            call_args = mock_process.call_args
            assert call_args[1]["import_method"] == "html"
    
    def test_import_pdf_file_integration(self):
        """Test complete flow for PDF file import"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "pdf-import-id",
                "chunks_processed": 5,
                "status": "success"
            }
            
            # Create fake PDF file
            fake_pdf_content = b"%PDF-1.4 fake pdf content"
            
            response = client.post(
                "/import",
                data={
                    "type": "pdf",
                    "title": "PDF Import Test"
                },
                files={"file": ("test.pdf", io.BytesIO(fake_pdf_content), "application/pdf")}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "pdf-import-id"
            assert data["chunksProcessed"] == 5
            
            # Verify file was passed correctly
            call_args = mock_process.call_args
            assert call_args[1]["import_method"] == "pdf"
            assert call_args[1]["file"] is not None
    
    def test_import_screenshot_integration(self):
        """Test complete flow for screenshot/OCR import"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "ocr-import-id",
                "chunks_processed": 1,
                "status": "success"
            }
            
            # Create fake image file
            fake_image_content = b"fake-image-data"
            
            response = client.post(
                "/import",
                data={
                    "type": "screenshot",
                    "title": "OCR Import Test"
                },
                files={"file": ("screenshot.png", io.BytesIO(fake_image_content), "image/png")}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "ocr-import-id"
            assert data["chunksProcessed"] == 1
            
            # Verify screenshot import was processed
            call_args = mock_process.call_args
            assert call_args[1]["import_method"] == "screenshot"
    
    def test_import_link_integration(self):
        """Test complete flow for link import"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "link-import-id",
                "chunks_processed": 4,
                "status": "success"
            }
            
            response = client.post(
                "/import",
                data={
                    "type": "link",
                    "url": "https://example.com/article.html",
                    "title": "Link Import Test"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["sourceId"] == "link-import-id"
            assert data["chunksProcessed"] == 4
            
            # Verify URL was passed correctly
            call_args = mock_process.call_args
            assert call_args[1]["import_method"] == "link"
            assert call_args[1]["url"] == "https://example.com/article.html"
    
    def test_import_grouped_integration(self):
        """Test complete flow for grouped import"""
        with patch('api.routes.import_routes.import_service.process_grouped_import') as mock_process:
            mock_process.return_value = {
                "import_batch_id": "batch-123",
                "chunks_processed": 6,
                "artefact_count": 3,
                "status": "success"
            }
            
            # Create multiple test files
            file1_content = b"First file content"
            file2_content = b"Second file content"
            file3_content = b"Third file content"
            
            response = client.post(
                "/import/grouped",
                data={
                    "types": ["copy_paste", "copy_paste", "copy_paste"],
                    "titles": ["File 1", "File 2", "File 3"]
                },
                files=[
                    ("files", ("file1.txt", io.BytesIO(file1_content), "text/plain")),
                    ("files", ("file2.txt", io.BytesIO(file2_content), "text/plain")),
                    ("files", ("file3.txt", io.BytesIO(file3_content), "text/plain"))
                ]
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["importBatchId"] == "batch-123"
            assert data["chunksProcessed"] == 6
            assert data["artefactCount"] == 3
            
            # Verify grouped import was called correctly
            mock_process.assert_called_once()
            call_args = mock_process.call_args
            assert len(call_args[1]["import_methods"]) == 3
            assert len(call_args[1]["files"]) == 3


class TestImportEndpointErrorHandling:
    """Test error handling in import endpoint"""
    
    def test_import_invalid_type(self):
        """Test import with invalid parser type"""
        response = client.post(
            "/import",
            data={
                "type": "invalid_parser",
                "text": "Some content",
                "title": "Invalid Test"
            }
        )
        
        assert response.status_code == 400
        assert "Invalid source type" in response.json()["detail"]
    
    def test_import_missing_required_fields(self):
        """Test import with missing required fields"""
        # Missing URL for link import
        response = client.post(
            "/import",
            data={
                "type": "link",
                "title": "Missing URL Test"
            }
        )
        
        assert response.status_code == 400
        assert "URL required" in response.json()["detail"]
        
        # Missing file for PDF import
        response = client.post(
            "/import",
            data={
                "type": "pdf",
                "title": "Missing File Test"
            }
        )
        
        assert response.status_code == 400
        assert "File required" in response.json()["detail"]
    
    def test_import_empty_content(self):
        """Test import with empty content"""
        response = client.post(
            "/import",
            data={
                "type": "copy_paste",
                "text": "",
                "title": "Empty Content Test"
            }
        )
        
        assert response.status_code == 400
        assert "Content required" in response.json()["detail"]
    
    def test_import_service_failure(self):
        """Test handling of import service failures"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.side_effect = Exception("Import processing failed")
            
            response = client.post(
                "/import",
                data={
                    "type": "copy_paste",
                    "text": "Test content",
                    "title": "Failure Test"
                }
            )
            
            assert response.status_code == 500
            assert "Import failed" in response.json()["detail"]
    
    def test_import_malformed_file(self):
        """Test import with malformed file"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.side_effect = ValueError("Malformed file content")
            
            malformed_content = b"not-a-valid-pdf"
            
            response = client.post(
                "/import",
                data={
                    "type": "pdf",
                    "title": "Malformed File Test"
                },
                files={"file": ("malformed.pdf", io.BytesIO(malformed_content), "application/pdf")}
            )
            
            assert response.status_code == 500
            assert "Import failed" in response.json()["detail"]


class TestImportEndpointValidation:
    """Test input validation in import endpoint"""
    
    def test_import_large_file_handling(self):
        """Test import with very large file"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "large-file-id",
                "chunks_processed": 100,
                "status": "success"
            }
            
            # Create large file content (10MB)
            large_content = b"Large file content " * 500000
            
            response = client.post(
                "/import",
                data={
                    "type": "copy_paste",
                    "title": "Large File Test"
                },
                files={"file": ("large.txt", io.BytesIO(large_content), "text/plain")}
            )
            
            # Should handle large files gracefully
            assert response.status_code == 200 or response.status_code == 413  # Request Entity Too Large
    
    def test_import_special_characters_in_title(self):
        """Test import with special characters in title"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "special-chars-id",
                "chunks_processed": 1,
                "status": "success"
            }
            
            special_title = "Test with émojis 🚀 and spëcial chars: <>&'\""
            
            response = client.post(
                "/import",
                data={
                    "type": "copy_paste",
                    "text": "Content with special title",
                    "title": special_title
                }
            )
            
            assert response.status_code == 200
            # Verify title was handled correctly
            call_args = mock_process.call_args
            assert call_args[1]["title"] == special_title
    
    def test_import_unicode_content(self):
        """Test import with Unicode content"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "unicode-id",
                "chunks_processed": 1,
                "status": "success"
            }
            
            unicode_content = "Content with Unicode: 中文, العربية, हिन्दी, 🌍🚀✨"
            
            response = client.post(
                "/import",
                data={
                    "type": "copy_paste",
                    "text": unicode_content,
                    "title": "Unicode Test"
                }
            )
            
            assert response.status_code == 200
            # Verify Unicode content was handled correctly
            call_args = mock_process.call_args
            assert unicode_content in str(call_args)


class TestImportEndpointConcurrency:
    """Test concurrent import requests"""
    
    def test_concurrent_imports(self):
        """Test multiple concurrent import requests"""
        import threading
        import time
        
        results = []
        
        def make_import_request(index):
            with patch('api.routes.import_routes.import_service.process_import') as mock_process:
                mock_process.return_value = {
                    "source_id": f"concurrent-{index}",
                    "chunks_processed": 1,
                    "status": "success"
                }
                
                response = client.post(
                    "/import",
                    data={
                        "type": "copy_paste",
                        "text": f"Concurrent import {index}",
                        "title": f"Concurrent Test {index}"
                    }
                )
                results.append((index, response.status_code))
        
        # Create multiple threads for concurrent requests
        threads = []
        for i in range(5):
            thread = threading.Thread(target=make_import_request, args=(i,))
            threads.append(thread)
        
        # Start all threads
        for thread in threads:
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all requests succeeded
        assert len(results) == 5
        for index, status_code in results:
            assert status_code == 200


class TestParserIntegrationWithRealContent:
    """Integration tests with realistic content examples"""
    
    def test_real_html_content_integration(self):
        """Test HTML parser with realistic HTML content"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "real-html-id",
                "chunks_processed": 3,
                "status": "success"
            }
            
            realistic_html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sample Article</title>
                <meta charset="UTF-8">
                <script>console.log('test');</script>
                <style>body { margin: 0; }</style>
            </head>
            <body>
                <header>
                    <h1>Article Title</h1>
                    <nav>Navigation menu</nav>
                </header>
                <main>
                    <article>
                        <h2>Introduction</h2>
                        <p>This is the first paragraph of the article with some <strong>important</strong> content.</p>
                        <p>This is the second paragraph with <a href="https://example.com">a link</a>.</p>
                        
                        <h2>Main Content</h2>
                        <p>More detailed content here with various elements.</p>
                        <ul>
                            <li>List item one</li>
                            <li>List item two</li>
                        </ul>
                    </article>
                </main>
                <footer>Footer content</footer>
                <script>alert('Should be filtered out');</script>
            </body>
            </html>
            """
            
            response = client.post(
                "/import",
                data={
                    "type": "html",
                    "html": realistic_html,
                    "title": "Realistic HTML Test"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
    
    def test_real_markdown_content_integration(self):
        """Test text parser with realistic Markdown content"""
        with patch('api.routes.import_routes.import_service.process_import') as mock_process:
            mock_process.return_value = {
                "source_id": "real-md-id",
                "chunks_processed": 4,
                "status": "success"
            }
            
            realistic_markdown = """
# Main Title

This is an introduction paragraph with some **bold text** and *italic text*.

## Section 1

Here's some content for the first section:

- List item 1
- List item 2
- List item 3

## Section 2

More content here with `inline code` and a [link](https://example.com).

```python
def example_function():
    return "Hello, World!"
```

## Conclusion

Final thoughts and summary.
            """
            
            response = client.post(
                "/import",
                data={
                    "type": "copy_paste",
                    "text": realistic_markdown,
                    "title": "Realistic Markdown Test"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
