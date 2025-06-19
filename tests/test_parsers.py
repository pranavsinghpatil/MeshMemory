import pytest
from fastapi import UploadFile
from io import BytesIO
from datetime import datetime
from api.services.parsers import (
    TextParser,
    HTMLParser,
    PDFParser,
    OcrParser,
    LinkParser
)

@pytest.fixture
def text_content():
    return """# Title
This is paragraph 1.

This is paragraph 2.
With a second line.

# Another Section
Final paragraph."""

@pytest.fixture
def html_content():
    return """
    <html>
        <head><title>Test</title></head>
        <body>
            <h1>Title</h1>
            <p>Paragraph 1</p>
            <script>alert('skip');</script>
            <p>Paragraph 2</p>
        </body>
    </html>
    """

@pytest.fixture
def pdf_content():
    # Create a simple PDF in memory for testing
    from reportlab.pdfgen import canvas
    buffer = BytesIO()
    c = canvas.Canvas(buffer)
    c.drawString(100, 750, "Test PDF Content")
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()

@pytest.fixture
def image_content():
    # Create a simple image with text for OCR testing
    from PIL import Image, ImageDraw
    img = Image.new('RGB', (200, 50), color='white')
    d = ImageDraw.Draw(img)
    d.text((10, 10), "Test OCR Text", fill='black')
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer.read()

async def test_text_parser():
    parser = TextParser()
    content = BytesIO("Test content".encode())
    file = UploadFile(filename="test.txt", file=content)
    
    chunks = await parser.parse("test_source", file=file)
    assert len(chunks) > 0
    assert chunks[0]["content"] == "Test content"
    assert chunks[0]["role"] == "user"
    assert "format" in chunks[0]["metadata"]

async def test_html_parser():
    parser = HTMLParser()
    content = BytesIO("<p>Test content</p>".encode())
    file = UploadFile(filename="test.html", file=content)
    
    chunks = await parser.parse("test_source", file=file)
    assert len(chunks) > 0
    assert chunks[0]["content"] == "Test content"
    assert chunks[0]["metadata"]["tag"] == "p"

async def test_pdf_parser(pdf_content):
    parser = PDFParser()
    file = UploadFile(filename="test.pdf", file=BytesIO(pdf_content))
    
    chunks = await parser.parse("test_source", file=file)
    assert len(chunks) > 0
    assert "Test PDF Content" in chunks[0]["content"]
    assert chunks[0]["metadata"]["page"] == 1

async def test_ocr_parser(image_content):
    parser = OcrParser()
    file = UploadFile(filename="test.png", file=BytesIO(image_content))
    
    chunks = await parser.parse("test_source", file=file)
    assert len(chunks) > 0
    assert "Test OCR Text" in chunks[0]["content"]
    assert "confidence" in chunks[0]["metadata"]

async def test_link_parser(mocker):
    parser = LinkParser()
    
    # Mock aiohttp response
    mock_response = mocker.AsyncMock()
    mock_response.read.return_value = b"Test content"
    mock_response.text.return_value = "Test content"
    
    mock_session = mocker.AsyncMock()
    mock_session.get.return_value.__aenter__.return_value = mock_response
    
    mocker.patch("aiohttp.ClientSession", return_value=mock_session)
    
    chunks = await parser.parse("test_source", url="http://test.com")
    assert len(chunks) > 0
    assert chunks[0]["metadata"]["source_url"] == "http://test.com"
