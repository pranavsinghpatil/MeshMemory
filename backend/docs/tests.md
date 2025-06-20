# Test Suite Documentation

## Table of Contents
- [Test Structure](#test-structure)
- [Unit Tests](#unit-tests)
  - [Database Service Tests](#database-service-tests)
  - [Import Parser Tests](#import-parser-tests)
  - [Merge Service Tests](#merge-service-tests)
  - [Search Tests](#search-tests)
- [Integration Tests](#integration-tests)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)

## Test Structure

The test suite is organized into the following main categories:

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test component interactions
3. **End-to-End Tests**: Test complete workflows

## Unit Tests

### Database Service Tests
`test_database_service.py`

Tests for database operations and models.

**Key Test Cases:**
- Database connection and session management
- CRUD operations for conversations
- Message storage and retrieval
- Transaction handling

**Example Test:**
```python
def test_create_conversation():
    # Test conversation creation
    conversation = create_test_conversation()
    assert conversation.id is not None
    assert conversation.title == "Test Conversation"
```

### Import Parser Tests
`test_import_*.py`

Tests for different import parsers.

#### `test_import_pdf.py`
Tests PDF document parsing functionality.

**Key Test Cases:**
- PDF text extraction
- Handling of multi-page documents
- Error handling for corrupted files
- Metadata extraction

#### `test_import_ocr.py`
Tests OCR functionality for image imports.

**Key Test Cases:**
- Image text recognition
- Handling of different image formats
- Error handling for non-text images
- Performance with large images

#### `test_import_link.py`
Tests web page content fetching and parsing.

**Key Test Cases:**
- HTML content extraction
- Title and metadata extraction
- Handling of different content types
- Error handling for invalid URLs

### Merge Service Tests
`test_merge_service.py`

Tests conversation merging functionality.

**Key Test Cases:**
- Merging two or more conversations
- Preserving message order
- Handling duplicate messages
- Error cases (empty conversations, invalid IDs)

**Example Test:**
```python
def test_merge_conversations():
    conv1 = create_test_conversation(["Message 1"])
    conv2 = create_test_conversation(["Message 2"])
    
    merged = merge_service.merge_conversations(
        [conv1.id, conv2.id], 
        "Merged Chat"
    )
    
    assert len(merged.messages) == 2
    assert merged.title == "Merged Chat"
```

### Search Tests
`test_search.py`

Tests search functionality.

**Key Test Cases:**
- Full-text search
- Filtering by conversation
- Sorting results
- Pagination

## Integration Tests

### `test_import_integration.py`

End-to-end tests for the import functionality.

**Tested Scenarios:**
1. File upload and processing
2. Content type detection
3. Error handling
4. Performance with large files

### `test_parsers_comprehensive.py`

Comprehensive tests for all parser types.

**Coverage:**
- Text parsing
- HTML parsing
- PDF parsing
- OCR functionality
- Link fetching

## Running Tests

### Prerequisites
```bash
pip install -r requirements-test.txt
```

### Running All Tests
```bash
pytest tests/
```

### Running Specific Test Files
```bash
pytest tests/test_merge_service.py
```

### Running with Coverage
```bash
pytest --cov=api tests/
```

## Test Coverage

Current test coverage can be generated using:
```bash
pytest --cov=api --cov-report=html tests/
```

This will generate an HTML report in the `htmlcov` directory.

## Best Practices

1. **Test Organization**:
   - Group related tests in classes
   - Use descriptive test names
   - Keep tests independent

2. **Fixtures**:
   - Use fixtures for common test data
   - Keep fixtures in `conftest.py` when shared

3. **Mocking**:
   - Mock external services
   - Use `unittest.mock` for Python's built-in mocking

4. **Assertions**:
   - Be specific in assertions
   - Test both success and failure cases
   - Include edge cases
