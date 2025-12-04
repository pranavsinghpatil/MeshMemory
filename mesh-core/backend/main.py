from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from core_logic import add_note, search_notes, ask_brain, ingest_pdf, get_graph_data, delete_note, update_note
import shutil
import os

class QARequest(BaseModel):
    query: str
    history: list = []
    mode: str = "local"
    api_key: str = ""

class IngestRequest(BaseModel):
    text: str
    source: str = "user"

class UpdateRequest(BaseModel):
    text: str

app = FastAPI(title="MeshMemory API")

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
async def ingest(req: IngestRequest):
    """Ingest a note."""
    try:
        uuid = add_note(req.text, req.source)
        return {"status": "stored", "uuid": uuid}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/ingest/pdf")
async def ingest_pdf_endpoint(file: UploadFile = File(...)):
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

@app.get("/search")
async def search(query: str):
    """Search notes."""
    results = search_notes(query)
    return {"results": results}

@app.get("/graph")
async def graph():
    """Get knowledge graph data."""
    return get_graph_data()

@app.post("/qa")
async def qa(req: QARequest):
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