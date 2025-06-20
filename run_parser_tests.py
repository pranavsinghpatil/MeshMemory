#!/usr/bin/env python3
"""
Simple test runner for parser tests
"""

import sys
import os

# Add backend to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

try:
    import asyncio
    import unittest
    from unittest.mock import patch, MagicMock
    
    # Test imports
    print("Testing imports...")
    from api.services.parsers import TextParser, HTMLParser, PDFParser, OcrParser, LinkParser
    print("✓ All parsers imported successfully")
    
    # Test TextParser
    async def test_text_parser():
        parser = TextParser()
        chunks = await parser.parse("test-id", text="Hello world\n\nSecond paragraph")
        assert len(chunks) == 2
        assert chunks[0]["content"] == "Hello world"
        print("✓ TextParser basic test passed")
    
    # Test HTMLParser
    async def test_html_parser():
        parser = HTMLParser()
        html = "<html><body><h1>Title</h1><p>Content</p></body></html>"
        chunks = await parser.parse("test-id", html=html)
        assert len(chunks) > 0
        print("✓ HTMLParser basic test passed")
    
    # Run async tests
    async def run_basic_tests():
        await test_text_parser()
        await test_html_parser()
        print("\n✓ All basic parser tests passed!")
    
    # Run the tests
    asyncio.run(run_basic_tests())
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all dependencies are installed")
except Exception as e:
    print(f"❌ Test error: {e}")
    
print("\nTo run comprehensive tests, use:")
print("python -m pytest backend/tests/test_parsers_comprehensive.py -v")
