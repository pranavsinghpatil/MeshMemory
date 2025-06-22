import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import json
from typing import Dict, Optional

class EncryptionService:
    def __init__(self):
        # Get encryption key from environment or generate one
        encryption_key = os.getenv("ENCRYPTION_KEY")
        if not encryption_key:
            # Generate a key for development (not recommended for production)
            encryption_key = Fernet.generate_key().decode()
            print("Warning: Using generated encryption key. Set ENCRYPTION_KEY in production.")
        
        # If the key is a password, derive a proper key
        if len(encryption_key) != 44:  # Fernet keys are 44 characters when base64 encoded
            encryption_key = self._derive_key(encryption_key)
        
        self.cipher = Fernet(encryption_key.encode() if isinstance(encryption_key, str) else encryption_key)

    def _derive_key(self, password: str) -> str:
        """Derive a Fernet key from a password"""
        salt = b'MeshMemory_salt_2024'  # In production, use a random salt per user
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key.decode()

    def encrypt_api_keys(self, api_keys: Dict[str, str]) -> str:
        """Encrypt API keys dictionary"""
        try:
            json_str = json.dumps(api_keys)
            encrypted = self.cipher.encrypt(json_str.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            print(f"Encryption error: {e}")
            return ""

    def decrypt_api_keys(self, encrypted_data: str) -> Dict[str, str]:
        """Decrypt API keys dictionary"""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted = self.cipher.decrypt(encrypted_bytes)
            return json.loads(decrypted.decode())
        except Exception as e:
            print(f"Decryption error: {e}")
            return {}

    def encrypt_text(self, text: str) -> str:
        """Encrypt a text string"""
        try:
            encrypted = self.cipher.encrypt(text.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            print(f"Text encryption error: {e}")
            return ""

    def decrypt_text(self, encrypted_text: str) -> str:
        """Decrypt a text string"""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_text.encode())
            decrypted = self.cipher.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            print(f"Text decryption error: {e}")
            return ""