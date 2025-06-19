# In test_database_service.py
import pytest
import uuid
import sys
import os
from pathlib import Path
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from main import app
from api.services.database_service import DatabaseService

@pytest.fixture
def db_service():
    return DatabaseService()

@pytest.mark.asyncio
async def test_create_chunk_with_artefact_fields(db_service):
    # Test creating a chunk with the new artefact fields
    chunk_id = str(uuid.uuid4())
    source_id = str(uuid.uuid4())
    artefact_id = "test_screenshot_1"
    artefact_order = 2

    chunk_data = {
        "id": chunk_id,
        "source_id": source_id,
        "text_chunk": "Test message with artefact fields",
        "embedding": [0.1, 0.2, 0.3],  # Simple mock embedding
        "timestamp": datetime.now(),
        "participant_label": "User",
        "model_name": None,
        "metadata": {"import_type": "grouped"},
        "artefact_id": artefact_id,
        "artefact_order": artefact_order
    }

    # Create the chunk in the database
    result_id = await db_service.create_chunk(chunk_data)
    assert result_id == chunk_id

    # Retrieve the chunk and verify artefact fields
    chunk = await db_service.get_chunk(chunk_id)
    assert chunk is not None
    assert chunk.get("artefact_id") == artefact_id
    assert chunk.get("artefact_order") == artefact_order

@pytest.mark.asyncio
async def test_create_chat_with_hybrid_flag(db_service):
    # Test creating a chat with the hybrid flag
    chat_id = str(uuid.uuid4())
    
    chat_data = {
        "id": chat_id,
        "title": "Test Hybrid Chat",
        "source_type": "hybrid",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "metadata": {"merged_from": ["chat1", "chat2"]},
        "is_hybrid": True
    }
    
    # Create the chat in the database
    result_id = await db_service.create_chat(chat_data)
    assert result_id == chat_id
    
    # Retrieve and verify hybrid flag
    chat = await db_service.get_chat(chat_id)
    assert chat is not None
    assert chat.get("is_hybrid") is True

@pytest.mark.asyncio
async def test_grouped_message_import(db_service):
    # Test importing multiple messages from different artefacts as one chat
    chat_id = str(uuid.uuid4())
    
    # First create a chat
    chat_data = {
        "id": chat_id,
        "title": "Chat from Multiple Screenshots",
        "source_type": "screenshot",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "metadata": {"import_type": "grouped", "artefact_count": 3},
        "is_hybrid": False
    }
    
    await db_service.create_chat(chat_data)
    
    # Create messages from 3 different artefacts
    messages = [
        # First screenshot/artefact
        {
            "id": str(uuid.uuid4()),
            "chat_id": chat_id,
            "text_chunk": "Hello, how can I help you today?",
            "embedding": [0.1, 0.2, 0.3],
            "timestamp": datetime.now(),
            "participant_label": "Assistant",
            "artefact_id": "screenshot_1",
            "artefact_order": 0
        },
        {
            "id": str(uuid.uuid4()),
            "chat_id": chat_id,
            "text_chunk": "I need help with my project",
            "embedding": [0.2, 0.3, 0.4],
            "timestamp": datetime.now(),
            "participant_label": "User",
            "artefact_id": "screenshot_1",
            "artefact_order": 0
        },
        # Second screenshot/artefact
        {
            "id": str(uuid.uuid4()),
            "chat_id": chat_id,
            "text_chunk": "What kind of project are you working on?",
            "embedding": [0.3, 0.4, 0.5],
            "timestamp": datetime.now(),
            "participant_label": "Assistant",
            "artefact_id": "screenshot_2",
            "artefact_order": 1
        },
        # Third screenshot/artefact
        {
            "id": str(uuid.uuid4()),
            "chat_id": chat_id,
            "text_chunk": "I'm building a chat importer",
            "embedding": [0.4, 0.5, 0.6],
            "timestamp": datetime.now(),
            "participant_label": "User",
            "artefact_id": "screenshot_3",
            "artefact_order": 2
        },
    ]
    
    # Add all messages
    for message in messages:
        await db_service.create_chunk(message)
    
    # Retrieve messages and verify they're correctly associated
    chat_messages = await db_service.get_chat_chunks(chat_id)
    assert len(chat_messages) == 4
    
    # Check artefact grouping
    screenshot1_messages = [m for m in chat_messages if m.get("artefact_id") == "screenshot_1"]
    screenshot2_messages = [m for m in chat_messages if m.get("artefact_id") == "screenshot_2"]
    screenshot3_messages = [m for m in chat_messages if m.get("artefact_id") == "screenshot_3"]
    
    assert len(screenshot1_messages) == 2
    assert len(screenshot2_messages) == 1
    assert len(screenshot3_messages) == 1

@pytest.mark.asyncio
async def test_create_chunk_with_artefact_fields():
    # Create a test client using FastAPI's TestClient
    client = TestClient(app)
    db_service = DatabaseService()
    
    try:
        # 1. Register a test user
        test_email = f"test_{int(datetime.now().timestamp())}@example.com"
        register_data = {
            "email": test_email,
            "password": "testpassword123",
            "name": "Test User"
        }
        
        # Register the user
        response = client.post("/auth/register", json=register_data)
        assert response.status_code == 200, f"User registration failed: {response.text}"
        
        # Get the auth token
        login_data = {
            "username": test_email,
            "password": "testpassword123"
        }
        response = client.post("/auth/token", data=login_data)
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Create a test source
        source_data = {
            "title": "Test Source",
            "type": "test",
            "metadata": {}
        }
        
        response = client.post("/api/sources/", json=source_data, headers=headers)
        assert response.status_code == 200, f"Source creation failed: {response.text}"
        source_id = response.json()["id"]
        print(f"Created source with ID: {source_id}")

        # 3. Create a chunk
        chunk_data = {
            "source_id": source_id,
            "text_chunk": "Test chunk content",
            "embedding": [0.1] * 1536,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "participant_label": "Test User",
            "artefactId": str(uuid.uuid4()),
            "artefactOrder": 1,
            "metadata": {"test": "value"}
        }
        
        # Create the chunk through the API
        response = client.post("/api/chunks/", json=chunk_data, headers=headers)
        assert response.status_code == 200, f"Chunk creation failed: {response.text}"
        chunk_id = response.json()["id"]
        print(f"Created chunk with ID: {chunk_id}")
        
        # Verify the chunk was created
        response = client.get(f"/api/chunks/{chunk_id}", headers=headers)
        assert response.status_code == 200, f"Failed to retrieve chunk: {response.text}"
        chunk = response.json()
        
        # Check if the chunk has the artefact fields
        assert "artefact_id" in chunk, "artefact_id not found in chunk"
        assert "artefact_order" in chunk, "artefact_order not found in chunk"
        assert chunk["artefact_id"] == chunk_data["artefactId"]
        assert chunk["artefact_order"] == 1
        
        print("Test passed: Chunk created with artefact fields")
        return True
        
    except Exception as e:
        print(f"Test failed with error: {str(e)}")
        raise