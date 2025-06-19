import asyncio
import uuid
from datetime import datetime, timezone
from api.services.database_service import DatabaseService

async def test_manual_import():
    db = DatabaseService()
    
    try:
        # Create a test user
        test_user = {
            "id": str(uuid.uuid4()),
            "email": f"test_{int(datetime.now().timestamp())}@example.com",
            "name": "Test User"
        }
        
        # Create a test source
        source_data = {
            "id": str(uuid.uuid4()),
            "user_id": test_user["id"],
            "title": "Test Grouped Import",
            "type": "grouped-import",
            "metadata": {
                "import_method": "grouped",
                "artefact_count": 3
            }
        }
        
        source_id = await db.create_source(source_data)
        print(f"Created source with ID: {source_id}")
        
        # Create chunks with the same artefact_id
        artefact_id = str(uuid.uuid4())
        chunks = [
            {
                "id": str(uuid.uuid4()),
                "source_id": source_id,
                "text_chunk": f"Message {i+1} in the conversation",
                "participant_label": "User" if i % 2 == 0 else "Assistant",
                "artefactId": artefact_id,
                "artefactOrder": i+1,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "metadata": {"test": True, "order": i+1}
            }
            for i in range(3)  # Create 3 test messages
        ]
        
        # Insert chunks
        for chunk in chunks:
            chunk_id = await db.create_chunk(chunk)
            print(f"Created chunk {chunk_id} with artefact_id={artefact_id}")
        
        # Verify the chunks were created correctly
        print("\nVerifying chunks in database...")
        for chunk in chunks:
            db_chunk = await db.get_chunk(chunk["id"])
            if db_chunk:
                print(f"\nChunk {chunk['id']}:")
                print(f"  Text: {db_chunk.get('text_chunk')}")
                print(f"  Artefact ID: {db_chunk.get('artefact_id')}")
                print(f"  Artefact Order: {db_chunk.get('artefact_order')}")
                print(f"  Source ID: {db_chunk.get('source_id')}")
            else:
                print(f"\nChunk {chunk['id']} not found in database")
                
    except Exception as e:
        print(f"Error during test: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(test_manual_import())