import weaviate
from weaviate.classes.config import Property, DataType
from weaviate.classes.init import AdditionalConfig, Timeout
from sentence_transformers import SentenceTransformer
import ollama
import uuid
import os
from pypdf import PdfReader
import numpy as np

# --- Configuration ---
WEAVIATE_URL = os.getenv("WEAVIATE_URL", "localhost")
WEAVIATE_PORT = int(os.getenv("WEAVIATE_PORT", 8080))
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CLASS_NAME = "Note"

# --- Singleton Initialization ---
# We use a global client for simplicity in this script, 
# but in production, you might want dependency injection.
client = weaviate.connect_to_local(
    port=WEAVIATE_PORT,
    skip_init_checks=True,
    additional_config=AdditionalConfig(timeout=Timeout(init=30))
)

# Load embedding model once
embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

def ensure_schema():
    """Ensures the Weaviate schema exists."""
    if CLASS_NAME not in client.collections.list_all():
        client.collections.create(
            name=CLASS_NAME,
            properties=[
                Property(name="text", data_type=DataType.TEXT),
                Property(name="source", data_type=DataType.TEXT), # e.g., "user", "web"
            ]
        )
        print(f"Created collection: {CLASS_NAME}")

# Initialize schema on import (or call explicitly)
ensure_schema()
notes_collection = client.collections.get(CLASS_NAME)

# --- Core Functions ---

def add_note(text: str, source: str = "user") -> str:
    """Ingests a note into the memory."""
    print(f"--- Ingesting Note (Source: {source}) ---")
    try:
        vector = embedding_model.encode(text).tolist()
        print(f"Encoded text. Vector length: {len(vector)}")
        obj_uuid = uuid.uuid4()
        notes_collection.data.insert(
            properties={"text": text, "source": source},
            vector=vector,
            uuid=obj_uuid
        )
        print(f"Inserted into Weaviate. UUID: {obj_uuid}")
        return str(obj_uuid)
    except Exception as e:
        print(f"!!! Error in add_note: {e}")
        raise e

def delete_note(note_id: str) -> bool:
    """Deletes a note by UUID."""
    print(f"--- Deleting Note: {note_id} ---")
    try:
        notes_collection.data.delete_by_id(uuid.UUID(note_id))
        print(f"Deleted UUID: {note_id}")
        return True
    except Exception as e:
        print(f"!!! Error in delete_note: {e}")
        return False

def update_note(note_id: str, new_text: str) -> bool:
    """Updates a note's text and re-embeds it."""
    print(f"--- Updating Note: {note_id} ---")
    try:
        # Re-embed
        vector = embedding_model.encode(new_text).tolist()
        
        notes_collection.data.update(
            uuid=uuid.UUID(note_id),
            properties={"text": new_text},
            vector=vector
        )
        print(f"Updated UUID: {note_id}")
        return True
    except Exception as e:
        print(f"!!! Error in update_note: {e}")
        return False

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100):
    """Splits text into chunks with overlap."""
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    
    return chunks

def ingest_pdf(file_path: str) -> str:
    """Extracts text from a PDF, chunks it, and ingests it."""
    print(f"--- Processing PDF: {file_path} ---")
    try:
        reader = PdfReader(file_path)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"
        
        print(f"Extracted {len(full_text)} characters from PDF.")
        
        # Chunking
        chunks = chunk_text(full_text)
        print(f"Split into {len(chunks)} chunks.")
        
        first_uuid = None
        for i, chunk in enumerate(chunks):
            print(f"Ingesting chunk {i+1}/{len(chunks)}...")
            # We use the filename + chunk index as source
            source_name = f"{os.path.basename(file_path)} (part {i+1})"
            uid = add_note(chunk, source=source_name)
            if first_uuid is None:
                first_uuid = uid
                
        return str(first_uuid)
    except Exception as e:
        print(f"!!! Error in ingest_pdf: {e}")
        raise e

def search_notes(query: str, limit: int = 5):
    """Semantic search for notes."""
    print(f"--- Searching: '{query}' ---")
    try:
        query_vector = embedding_model.encode(query).tolist()
        response = notes_collection.query.near_vector(
            near_vector=query_vector,
            limit=limit,
            return_metadata=["distance"]
        )
        # Format results
        results = []
        for obj in response.objects:
            results.append({
                "text": obj.properties["text"],
                "source": obj.properties.get("source", "unknown"),
                "distance": obj.metadata.distance,
                "id": str(obj.uuid)
            })
        print(f"Found {len(results)} results.")
        return results
    except Exception as e:
        print(f"!!! Error in search_notes: {e}")
        return []

import google.generativeai as genai

def ask_gemini(question: str, context_text: str, history_text: str, api_key: str) -> str:
    """Queries Google's Gemini API."""
    print(f"--- Asking Gemini (Cloud) ---")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""You are MeshMemory, an advanced knowledge engine.
        Answer strictly based on the context provided.
        
        Context:
        {context_text}
        
        Chat History:
        {history_text}
        
        User Question: {question}
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Gemini Error: {str(e)}"

def ask_brain(question: str, history: list = [], mode: str = "local", api_key: str = "") -> dict:
    """RAG: Retrieves context and answers using Ollama OR Gemini."""
    print(f"--- Asking Brain: '{question}' (Mode: {mode}) ---")
    
    # 1. Retrieve
    context_docs = search_notes(question, limit=5)
    
    # 2. Prepare Context
    context_text = ""
    sources = []
    MAX_CONTEXT = 3000 # Reserve space for history
    for doc in context_docs:
        if len(context_text) + len(doc['text']) < MAX_CONTEXT:
            context_text += f"- {doc['text']}\n\n"
            sources.append(doc['source'])
        else:
            break
            
    # Deduplicate sources
    sources = list(set(sources))
            
    # 3. Prepare History Text
    history_text = ""
    for turn in history[-3:]: # Keep last 3 turns
        history_text += f"User: {turn['user']}\nAI: {turn['ai']}\n"
    
    # 4. Route Request
    if mode == "cloud" and api_key:
        answer = ask_gemini(question, context_text, history_text, api_key)
        return {"answer": answer, "sources": sources}
    
    # 5. Local Fallback (Ollama)
    prompt = f"""You are MeshMemory, an advanced local knowledge engine. 
    Your goal is to provide accurate, concise, and well-formatted answers based strictly on the provided context.
    
    Guidelines:
    - **Format**: Use Markdown. **Bold** key terms and concepts. Use lists for steps or multiple points.
    - **Tone**: Professional, helpful, and direct.
    - **Accuracy**: If the answer is not in the context, state clearly: "I cannot find this information in your memory."
    - **Citations**: Do not manually cite sources in the text; the system handles that. Focus on the content.
    
    Context:
    {context_text}
    
    Chat History:
    {history_text}
    
    User Question: {question}
    
    Answer:"""
    
    try:
        print(f"Sending prompt to Ollama (Model: {OLLAMA_MODEL})...")
        response = ollama.chat(model=OLLAMA_MODEL, messages=[
            {'role': 'user', 'content': prompt},
        ])
        answer = response['message']['content']
        print(f"Ollama Response: {answer[:100]}...")
        return {"answer": answer, "sources": sources}
    except Exception as e:
        error_msg = f"Error talking to Ollama: {str(e)}. Is 'ollama serve' running?"
        print(f"!!! {error_msg}")
        return {"answer": error_msg, "sources": []}

def get_graph_data():
    """Retrieves nodes and creates semantic links."""
    print("--- Fetching Graph Data (Semantic) ---")
    try:
        # Fetch notes with vectors
        response = notes_collection.query.fetch_objects(
            limit=50, 
            return_properties=["text", "source"],
            include_vector=True
        )
        
        nodes = []
        links = []
        vectors = []
        ids = []
        
        # 1. Create Nodes & Collect Vectors
        for obj in response.objects:
            # Handle vector structure (v4 client)
            vec = obj.vector
            if isinstance(vec, dict):
                vec = vec.get('default') or list(vec.values())[0]
            
            nodes.append({
                "id": str(obj.uuid),
                "name": obj.properties.get("text", "")[:20] + "...",
                "fullText": obj.properties.get("text", ""),
                "source": obj.properties.get("source", "unknown"),
                "val": 1
            })
            vectors.append(vec)
            ids.append(str(obj.uuid))
            
        # 2. Compute Semantic Links (Cosine Similarity)
        if len(vectors) > 1:
            # Convert to numpy array
            vec_matrix = np.array(vectors)
            
            # Normalize vectors (L2 norm)
            norms = np.linalg.norm(vec_matrix, axis=1, keepdims=True)
            normalized_matrix = vec_matrix / (norms + 1e-9) # Avoid divide by zero
            
            # Compute similarity matrix (Dot product of normalized vectors)
            sim_matrix = np.dot(normalized_matrix, normalized_matrix.T)
            
            # Create links for high similarity
            THRESHOLD = 0.60
            for i in range(len(ids)):
                for j in range(i + 1, len(ids)): # Upper triangle only
                    sim = sim_matrix[i][j]
                    if sim > THRESHOLD:
                        links.append({
                            "source": ids[i],
                            "target": ids[j],
                            "value": float(sim) # Strength of link
                        })
                        
        print(f"Generated {len(nodes)} nodes and {len(links)} semantic links (Threshold: {THRESHOLD}).")
        return {"nodes": nodes, "links": links}
    except Exception as e:
        print(f"!!! Error in get_graph_data: {e}")
        return {"nodes": [], "links": []}
