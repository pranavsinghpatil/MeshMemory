import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from api.models import Chat, Message, get_db
from api.services.merge_service import MergeService

@pytest.fixture
def sample_chats(db: Session):
    # Create test chats with messages
    chat1 = Chat(
        id="chat1",
        title="Chat 1",
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    chat2 = Chat(
        id="chat2",
        title="Chat 2",
        created_at=datetime.utcnow() - timedelta(days=1)
    )
    
    db.add_all([chat1, chat2])
    db.commit()
    
    # Add messages to chats
    messages = [
        Message(
            id=f"msg1_{i}",
            chat_id=chat1.id,
            content=f"Message {i} from Chat 1",
            role="user" if i % 2 == 0 else "assistant",
            timestamp=datetime.utcnow() - timedelta(hours=i),
            metadata={"source": "test"}
        ) for i in range(3)
    ]
    
    messages.extend([
        Message(
            id=f"msg2_{i}",
            chat_id=chat2.id,
            content=f"Message {i} from Chat 2",
            role="user" if i % 2 == 0 else "assistant",
            timestamp=datetime.utcnow() - timedelta(hours=i+0.5),  # Interleaved timestamps
            metadata={"source": "test"}
        ) for i in range(3)
    ])
    
    db.add_all(messages)
    db.commit()
    
    yield [chat1.id, chat2.id]
    
    # Cleanup
    db.query(Message).delete()
    db.query(Chat).delete()
    db.commit()

def test_merge_chats_success(db: Session, sample_chats):
    service = MergeService(db_session=db)
    result = service.merge_chats(
        chat_ids=["chat1", "chat2"],
        title="Merged Chat"
    )
    
    assert "id" in result
    assert result["message_count"] == 6  # 3 msgs per chat
    assert result["source_chat_count"] == 2
    
    # Verify messages were merged with correct metadata
    messages = db.query(Message).filter(Message.chat_id == result["id"]).all()
    assert len(messages) == 6
    
    # Verify messages are sorted by timestamp
    for i in range(len(messages) - 1):
        assert messages[i].timestamp <= messages[i+1].timestamp

def test_merge_insufficient_chats(db: Session):
    service = MergeService(db_session=db)
    with pytest.raises(HTTPException) as exc:
        service.merge_chats(chat_ids=["chat1"])
    assert "At least 2 chats" in str(exc.value)

def test_merge_nonexistent_chat(db: Session, sample_chats):
    service = MergeService(db_session=db)
    with pytest.raises(HTTPException) as exc:
        service.merge_chats(chat_ids=["chat1", "nonexistent"])
    assert "not found" in str(exc.value).lower()
