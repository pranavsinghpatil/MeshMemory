from fastapi import FastAPI, UploadFile, File, Request, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from core_logic import add_note, search_notes, ask_brain, ingest_pdf, get_graph_data, delete_note, update_note, ingest_url_note, ingest_youtube_note, ingest_generic_file
import shutil
import os
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Rate Limiting Setup
limiter = Limiter(key_func=get_remote_address)

class QARequest(BaseModel):
    query: str
    history: list = []
    mode: str = "local"
    api_key: str = ""

class IngestRequest(BaseModel):
    text: str
    source: str = "user"

class IngestURLRequest(BaseModel):
    url: str

class UpdateRequest(BaseModel):
    text: str

app = FastAPI(title="MeshMemory API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "MeshMemory backend is alive 🚀 (Local & MCP Ready)"}

@app.post("/ingest")
@limiter.limit("10/minute")
async def ingest(req: IngestRequest, request: Request):
    """Ingest a note."""
    try:
        uuid = add_note(req.text, req.source)
        return {"status": "stored", "uuid": uuid}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/ingest/pdf")
@limiter.limit("5/minute")
async def ingest_pdf_endpoint(request: Request, file: UploadFile = File(...)):
    """Ingest a PDF file."""
    try:
        # Save temp file
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Ingest
        uuid = ingest_pdf(temp_path)
        
        # Cleanup
        os.remove(temp_path)
        
        return {"status": "stored", "uuid": uuid, "filename": file.filename}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/ingest/file")
@limiter.limit("5/minute")
async def ingest_file_endpoint(request: Request, file: UploadFile = File(...), api_key: str = Form(None)):
    """Ingest any file (Audio/Video/Image) using Gemini."""
    try:
        # Save temp file
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Determine mime type (basic)
        mime_type = file.content_type or "application/octet-stream"
        
        # Ingest
        if mime_type == "application/pdf":
             uuid = ingest_pdf(temp_path)
        else:
             uuid = ingest_generic_file(temp_path, mime_type, api_key)
        
        # Cleanup
        os.remove(temp_path)
        
        return {"status": "stored", "uuid": uuid, "filename": file.filename}
    except Exception as e:
        if os.path.exists(f"temp_{file.filename}"):
            os.remove(f"temp_{file.filename}")
        return {"status": "error", "message": str(e)}

@app.post("/ingest/url")
@limiter.limit("5/minute")
async def ingest_url_endpoint(req: IngestURLRequest, request: Request):
    """Ingest a URL."""
    try:
        uuid = ingest_url_note(req.url)
        return {"status": "stored", "uuid": uuid}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/ingest/youtube")
@limiter.limit("5/minute")
async def ingest_youtube_endpoint(req: IngestURLRequest, request: Request):
    """Ingest a YouTube video."""
    try:
        uuid = ingest_youtube_note(req.url)
        return {"status": "stored", "uuid": uuid}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/search")
@limiter.limit("20/minute")
async def search(request: Request, query: str):
    """Search notes."""
    results = search_notes(query)
    return {"results": results}

@app.get("/graph")
async def graph(threshold: float = 0.6):
    """Get knowledge graph data."""
    return get_graph_data(threshold)

@app.post("/qa")
@limiter.limit("10/minute")
async def qa(req: QARequest, request: Request):
    """Ask the brain."""
    response = ask_brain(req.query, req.history, req.mode, req.api_key)
    return {"query": req.query, "answer": response["answer"], "sources": response["sources"]}

@app.delete("/notes/{note_id}")
async def delete_note_endpoint(note_id: str):
    """Delete a note."""
    success = delete_note(note_id)
    if success:
        return {"status": "deleted", "uuid": note_id}
    else:
        return {"status": "error", "message": "Failed to delete"}

@app.put("/notes/{note_id}")
async def update_note_endpoint(note_id: str, req: UpdateRequest):
    """Update a note."""
    success = update_note(note_id, req.text)
    if success:
        return {"status": "updated", "uuid": note_id}
    else:
        return {"status": "error", "message": "Failed to update"}