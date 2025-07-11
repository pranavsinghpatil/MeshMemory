import os
import json
import uuid
from typing import Dict, Any, Optional
import asyncio
from datetime import datetime
from .database_service import DatabaseService
from cryptography.fernet import Fernet, InvalidToken

class UserService:
    def __init__(self):
        self.encryption_key = os.getenv("FERNET_KEY")
        if not self.encryption_key:
            raise ValueError("FERNET_KEY environment variable is not set")
        try:
            self.cipher = Fernet(self.encryption_key.encode())
        except Exception as e:
            raise ValueError(f"Invalid FERNET_KEY: {e}")
        
        # For demo/fallback, use in-memory storage
        self.user_settings = {}

    async def get_user_settings(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get user settings"""
        if not user_id:
            return {}
            
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                row = await conn.fetchrow('''
                    SELECT * FROM user_settings WHERE user_id = $1
                ''', user_id)
                
                if row:
                    settings = dict(row)
                    # Decrypt API keys if present
                    if settings.get('api_keys'):
                        settings['api_keys'] = self._decrypt_api_keys(settings['api_keys'])
                    return settings
                
                # If no settings found, create default settings
                return await self.create_default_settings(user_id)
            except Exception as e:
                print(f"Database error getting user settings: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        # Fallback to in-memory
        return self.user_settings.get(user_id, {})

    async def update_user_settings(self, user_id: Optional[str], settings: Dict[str, Any]) -> Dict[str, Any]:
        """Update user settings"""
        if not user_id:
            return {}
            
        conn = await self.db_service.get_connection()
        
        if conn:
            try:
                # Check if settings exist
                existing = await conn.fetchrow('''
                    SELECT * FROM user_settings WHERE user_id = $1
                ''', user_id)
                
                # Encrypt API keys if present
                if 'api_keys' in settings:
                    settings['api_keys'] = self._encrypt_api_keys(settings['api_keys'])
                
                if existing:
                    # Update existing settings
                    columns = []
                    values = []
                    for i, (key, value) in enumerate(settings.items()):
                        columns.append(f"{key} = ${i+2}")
                        values.append(value if not isinstance(value, dict) else json.dumps(value))
                    
                    query = f'''
                        UPDATE user_settings
                        SET {', '.join(columns)}, updated_at = now()
                        WHERE user_id = $1
                        RETURNING *
                    '''
                    
                    row = await conn.fetchrow(query, user_id, *values)
                else:
                    # Create new settings
                    columns = ['user_id']
                    placeholders = ['$1']
                    values = [user_id]
                    
                    for i, (key, value) in enumerate(settings.items()):
                        columns.append(key)
                        placeholders.append(f"${i+2}")
                        values.append(value if not isinstance(value, dict) else json.dumps(value))
                    
                    query = f'''
                        INSERT INTO user_settings ({', '.join(columns)}, created_at, updated_at)
                        VALUES ({', '.join(placeholders)}, now(), now())
                        RETURNING *
                    '''
                    
                    row = await conn.fetchrow(query, *values)
                
                updated_settings = dict(row)
                
                # Decrypt API keys for return value
                if updated_settings.get('api_keys'):
                    updated_settings['api_keys'] = self._decrypt_api_keys(updated_settings['api_keys'])
                
                return updated_settings
            except Exception as e:
                print(f"Database error updating user settings: {e}")
            finally:
                await self.db_service.release_connection(conn)
        
        # Fallback to in-memory
        self.user_settings[user_id] = {
            **self.user_settings.get(user_id, {}),
            **settings,
            'updated_at': datetime.now()
        }
        
        return self.user_settings[user_id]

    async def get_api_keys(self, user_id: Optional[str] = None) -> Dict[str, str]:
        """Get user's API keys"""
        if not user_id:
            return {}
            
        settings = await self.get_user_settings(user_id)
        return settings.get('api_keys', {})

    async def save_api_keys(self, user_id: Optional[str], api_keys: Dict[str, str]) -> bool:
        """Save user's API keys"""
        if not user_id:
            return False
            
        await self.update_user_settings(user_id, {'api_keys': api_keys})
        return True

    async def create_default_settings(self, user_id: str) -> Dict[str, Any]:
        """Create default settings for a new user"""
        default_settings = {
            'theme': 'system',
            'notifications_enabled': True,
            'api_keys': {},
            'preferences': {
                'default_model': 'gpt-4',
                'auto_thread_generation': True,
                'search_results_count': 10
            }
        }
        
        return await self.update_user_settings(user_id, default_settings)

    def _encrypt_api_keys(self, api_keys: Dict[str, str]) -> str:
        """Encrypt API keys for storage"""
        try:
            # Convert to JSON string
            json_str = json.dumps(api_keys)
            # Encrypt
            encrypted = self.cipher.encrypt(json_str.encode())
            # Return as string
            return encrypted.decode()
        except Exception as e:
            print(f"Error encrypting API keys: {e}")
            # Return empty encrypted object as fallback
            return self.cipher.encrypt(json.dumps({}).encode()).decode()

    def _decrypt_api_keys(self, encrypted_keys: str) -> Dict[str, str]:
        """Decrypt API keys from storage"""
        try:
            # Decrypt
            decrypted = self.cipher.decrypt(encrypted_keys.encode())
            # Parse JSON
            return json.loads(decrypted.decode())
        except Exception as e:
            print(f"Error decrypting API keys: {e}")
            return {}