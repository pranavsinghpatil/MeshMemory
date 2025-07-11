"""
Service for managing microchats - focused conversations about specific messages.
Uses Supabase as the database backend.
"""
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
from ..services.database_service import DatabaseService
from ..services.llm_service import LLMService
import logging
from fastapi import Depends

def get_current_user():
    # Return a dummy user dict for now
    return {"id": "demo-user-id"}
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Branch types for microchat branching
BRANCH_TYPES = ['deep-dive', 'refactor', 'translate', 'summarize', 'custom']
BRANCH_STATUS = ['ephemeral', 'pinned']

class MicrochatService:
    def __init__(self):
        self.db = DatabaseService()
        self.llm = LLMService()
        
    # Branch prompt templates
    BRANCH_PROMPTS = {
        'deep-dive': "Explore this topic in more depth: {message_text}",
        'refactor': "Suggest improvements or refactoring for: {message_text}",
        'translate': "Translate this content to a more accessible explanation: {message_text}",
        'summarize': "Provide a concise summary of: {message_text}",
        'custom': "{message_text}"
    }

    async def create_microchat(self, parent_message_id: str, user_message: str, user_id: str, is_branch: bool = False, 
                           parent_chat_id: Optional[str] = None, branch_type: Optional[str] = None) -> Dict[str, Any]:
        """Create a new microchat with an initial message and assistant response"""
        # Generate a new ID for the microchat
        microchat_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Get context from the parent message
        context = {
            "parent_message_id": parent_message_id,
            "timestamp": now
        }
        
        # If this is a branch, prepare prompt based on branch type
        prompt = user_message
        title = None
        
        if is_branch and branch_type in self.BRANCH_PROMPTS:
            prompt = self.BRANCH_PROMPTS[branch_type].format(message_text=user_message)
            prefix = branch_type.replace('-', ' ').capitalize()
            title = f"{prefix}: {user_message[:30]}..." if len(user_message) > 30 else f"{prefix}: {user_message}"
        
        # Generate assistant response using LLM
        try:
            assistant_response = await self.llm.generate_response(messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ])
            
            # Prepare the microchat data
            microchat_data = {
                "id": microchat_id,
                "parent_message_id": parent_message_id,
                "user_id": user_id,
                "created_at": now,
                "updated_at": now,
                "messages": [
                    {"id": str(uuid.uuid4()), "role": "user", "content": prompt, "timestamp": now, "metadata": {}},
                    {"id": str(uuid.uuid4()), "role": "assistant", "content": assistant_response, "timestamp": now, "metadata": {}}
                ],
                "context": context,
                "is_branch": is_branch,
                "branch_status": "ephemeral" if is_branch else None,
                "title": title
            }
            
            # Add branch-specific fields if this is a branch
            if is_branch:
                if not parent_chat_id:
                    raise ValueError("parent_chat_id is required for branch microchats")
                microchat_data["parent_chat_id"] = parent_chat_id
                microchat_data["branch_type"] = branch_type
            
            # Store the microchat in the database
            return await self.db.create_microchat(microchat_data)
        except Exception as e:
            logger.error(f"Error creating microchat: {str(e)}")
            raise

    async def add_message(self, microchat_id: str, content: str, role: str = "user") -> Dict[str, Any]:
        """Add a message to a microchat and generate an assistant response if it's a user message"""
        # Check if the microchat exists
        microchat = await self.get_microchat(microchat_id)
        if not microchat:
            raise ValueError(f"Microchat with ID {microchat_id} not found")
            
        now = datetime.utcnow().isoformat()
        msg = {"id": str(uuid.uuid4()), "role": role, "content": content, "timestamp": now, "metadata": {}}
        
        if role == "user":
            # Add user message
            await self.db.add_microchat_message(microchat_id, msg)
            
            # Generate assistant response
            try:
                # Get conversation history
                history = [{"role": m["role"], "content": m["content"]} for m in microchat.get("messages", [])]
                # Generate response
                res = await self.llm.generate_response(messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    *history,
                    {"role": "user", "content": content}
                ])
                
                # Create assistant message
                assistant_msg = {
                    "id": str(uuid.uuid4()), 
                    "role": "assistant", 
                    "content": res, 
                    "timestamp": datetime.utcnow().isoformat(),
                    "metadata": {}
                }
                
                # Add assistant message
                await self.db.add_microchat_message(microchat_id, assistant_msg)
                return {"user_message": msg, "assistant_message": assistant_msg}
            except Exception as e:
                logger.error(f"Error generating response: {str(e)}")
                raise
        else:
            # Just add the message as-is (for non-user messages)
            await self.db.add_microchat_message(microchat_id, msg)
            return {"message": msg}
    
    async def get_microchat(self, microchat_id: str) -> Optional[Dict[str, Any]]:
        """Get a microchat by ID"""
        return await self.db.get_microchat(microchat_id)
        
    async def search_microchats(self, query: str, user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for microchats by text content"""
        return await self.db.search_microchats(query, user_id, limit)
    
    async def delete_microchat(self, microchat_id: str) -> bool:
        """Delete a microchat"""
        return await self.db.delete_microchat(microchat_id)
        
    async def update_branch_status(self, microchat_id: str, status: str) -> Optional[Dict[str, Any]]:
        """Update the status of a branch microchat (ephemeral or pinned)"""
        # Validate the status
        if status not in BRANCH_STATUS:
            raise ValueError(f"Invalid branch status. Must be one of {BRANCH_STATUS}")
            
        # Check if the microchat exists and is a branch
        microchat = await self.get_microchat(microchat_id)
        if not microchat:
            raise ValueError(f"Microchat with ID {microchat_id} not found")
            
        if not microchat.get("is_branch", False):
            raise ValueError("Cannot update branch status for a non-branch microchat")
            
        # Update the status
        return await self.db.update_microchat(microchat_id, {"branch_status": status})
        
    async def promote_branch_to_main(self, microchat_id: str) -> Dict[str, Any]:
        """Promote a branch microchat to the main chat"""
        # Check if the microchat exists and is a branch
        microchat = await self.get_microchat(microchat_id)
        if not microchat:
            raise ValueError(f"Microchat with ID {microchat_id} not found")
            
        if not microchat.get("is_branch", False):
            raise ValueError("Cannot promote a non-branch microchat")
            
        # Get the parent chat ID
        parent_chat_id = microchat.get("parent_chat_id")
        if not parent_chat_id:
            raise ValueError("Branch has no parent chat ID")
            
        # Compile the content from the branch messages (only assistant messages)
        branch_content = ""
        for msg in microchat.get("messages", []):
            if msg.get("role") == "assistant":
                branch_content += msg.get("content", "") + "\n\n"
                
        # Create a new message in the main chat
        new_message = {
            "id": str(uuid.uuid4()),
            "chat_id": parent_chat_id,
            "role": "assistant",
            "content": branch_content.strip(),
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {
                "promoted_from_branch": microchat_id,
                "branch_type": microchat.get("branch_type"),
                "original_parent_message_id": microchat.get("parent_message_id")
            }
        }
        
        try:
            # Add the message to the main chat
            created_message = await self.db.create_message(new_message)
            
            # Mark the branch as promoted
            await self.db.promote_branch_to_main(microchat_id, created_message.get("id"))
            
            # Update the branch status to pinned
            await self.update_branch_status(microchat_id, "pinned")
            
            return {
                "message": created_message,
                "branch": await self.get_microchat(microchat_id)
            }
        except Exception as e:
            logger.error(f"Error promoting branch: {str(e)}")
            raise
        
    async def get_branches_for_message(self, parent_message_id: str) -> List[Dict[str, Any]]:
        """Get all branches for a specific message"""
        return await self.db.get_branches_for_message(parent_message_id)
        
    async def get_branches_for_chat(self, parent_chat_id: str) -> List[Dict[str, Any]]:
        """Get all branches for a specific chat"""
        return await self.db.get_branches_for_chat(parent_chat_id)
