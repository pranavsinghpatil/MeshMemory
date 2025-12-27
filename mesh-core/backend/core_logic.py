import weaviate
from weaviate.classes.config import Property, DataType
from weaviate.classes.init import AdditionalConfig, Timeout, Auth
from sentence_transformers import SentenceTransformer
import ollama
import uuid
import os
from pypdf import PdfReader
import numpy as np
from ingest_logic import ingest_url, ingest_youtube
import google.generativeai as genai
from groq import Groq

# --- Configuration ---
WEAVIATE_URL = os.getenv("WEAVIATE_URL", "localhost")
WEAVIATE_PORT = int(os.getenv("WEAVIATE_PORT", 8080))
WEAVIATE_API_KEY = os.getenv("WEAVIATE_API_KEY", "")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CLASS_NAME = "Note"

# --- Singleton Initialization ---
# We use a global client for simplicity in this script, 
# but in production, you might want dependency injection.
import time

def connect_to_weaviate(retries=5, delay=2):
    for i in range(retries):
        try:
            if WEAVIATE_URL != "localhost" and WEAVIATE_API_KEY:
                print(f"Connecting to Weaviate Cloud: {WEAVIATE_URL}")
                return weaviate.connect_to_wcs(
                    cluster_url=WEAVIATE_URL,
                    auth_credentials=Auth.api_key(WEAVIATE_API_KEY),
                    additional_config=AdditionalConfig(timeout=Timeout(init=30))
                )
            else:
                print(f"Connecting to Local Weaviate: {WEAVIATE_URL}:{WEAVIATE_PORT} (Attempt {i+1}/{retries})")
                return weaviate.connect_to_local(
                    port=WEAVIATE_PORT,
                    skip_init_checks=True,
                    additional_config=AdditionalConfig(timeout=Timeout(init=30))
                )
        except Exception as e:
            print(f"Connection failed: {e}. Retrying in {delay}s...")
            time.sleep(delay)
    raise Exception("Could not connect to Weaviate after multiple attempts.")

client = connect_to_weaviate()

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
                Property(name="title", data_type=DataType.TEXT),
                Property(name="summary", data_type=DataType.TEXT),
            ]
        )
        print(f"Created collection: {CLASS_NAME}")

# Initialize schema on import (or call explicitly)
ensure_schema()
notes_collection = client.collections.get(CLASS_NAME)

# --- Core Functions ---

def generate_summary(text: str) -> dict:
    """Generates a title and summary using LLM."""
    prompt = f"""Analyze the following text and provide a JSON response with two fields:
    1. "title": A concise title (max 6 words).
    2. "summary": A one-sentence summary.
    
    Text: {text[:2000]}
    
    JSON Response:"""
    
    try:
        # Use Ollama for speed/cost (or Gemini if configured globally, but keeping it simple for now)
        # For simplicity, we'll try to use the global OLLAMA_MODEL
        response = ollama.chat(model=OLLAMA_MODEL, messages=[
            {'role': 'user', 'content': prompt},
        ], format='json')
        
        import json
        return json.loads(response['message']['content'])
    except Exception as e:
        print(f"Summary generation failed: {e}")
        return {"title": text[:50] + "...", "summary": text[:100] + "..."}

def add_note(text: str, source: str = "user", title: str = "") -> str:
    """Ingests a note into the memory."""
    print(f"--- Ingesting Note (Source: {source}) ---")
    
    summary = ""
    if not title:
        print("Generating smart title & summary...")
        meta = generate_summary(text)
        title = meta.get("title", text[:50])
        summary = meta.get("summary", "")
        
    try:
        vector = embedding_model.encode(text).tolist()
        print(f"Encoded text. Vector length: {len(vector)}")
        obj_uuid = uuid.uuid4()
        notes_collection.data.insert(
            properties={"text": text, "source": source, "title": title, "summary": summary},
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

def ingest_generic_file(file_path: str, mime_type: str, api_key: str = "") -> str:
    """Ingests audio/video/image using Gemini."""
    print(f"--- Processing File: {file_path} ({mime_type}) ---")
    
    if not api_key:
        # Try env var
        api_key = os.getenv("GEMINI_API_KEY", "")
        
    if not api_key:
        raise ValueError("Gemini API Key required for multimodal ingestion.")
        
    try:
        genai.configure(api_key=api_key)
        # Use 1.5 Flash for multimodal speed/cost
        model = genai.GenerativeModel('gemini-2.5-flash') 
        
        print("Uploading to Gemini...")
        uploaded_file = genai.upload_file(file_path, mime_type=mime_type)
        
        print("Generating content...")
        prompt = "Analyze this file in detail. If it's audio/video, provide a full transcript. If it's an image, describe every detail. If it's a document, summarize it comprehensively."
        response = model.generate_content([prompt, uploaded_file])
        
        text = response.text
        title = f"File: {os.path.basename(file_path)}"
        
        # Ingest
        return add_note(text, source=f"file:{os.path.basename(file_path)}", title=title)
        
    except Exception as e:
        print(f"!!! Error in ingest_generic_file: {e}")
        raise e

def ingest_url_note(url: str) -> str:
    """Ingests a webpage."""
    data = ingest_url(url)
    # Chunking
    chunks = chunk_text(data['text'])
    first_uuid = None
    for i, chunk in enumerate(chunks):
        source_name = f"{data['source']} (part {i+1})"
        uid = add_note(chunk, source=source_name, title=data['title'])
        if first_uuid is None:
            first_uuid = uid
    return str(first_uuid)

def ingest_youtube_note(url: str) -> str:
    """Ingests a YouTube video."""
    data = ingest_youtube(url)
    # Chunking
    chunks = chunk_text(data['text'])
    first_uuid = None
    for i, chunk in enumerate(chunks):
        source_name = f"{data['source']} (part {i+1})"
        uid = add_note(chunk, source=source_name, title=data['title'])
        if first_uuid is None:
            first_uuid = uid
    return str(first_uuid)

def search_notes(query: str, limit: int = 5):
    """Hybrid search (Keyword + Vector) for notes."""
    print(f"--- Searching (Hybrid): '{query}' ---")
    try:
        query_vector = embedding_model.encode(query).tolist()
        # Hybrid search: alpha=0.5 balances keyword (BM25) and vector search
        response = notes_collection.query.hybrid(
            query=query,
            vector=query_vector,
            limit=limit,
            alpha=0.5,
            return_metadata=["score"],
            include_vector=True # Needed for Graph RAG
        )
        # Format results
        results = []
        for obj in response.objects:
            results.append({
                "text": obj.properties["text"],
                "source": obj.properties.get("source", "unknown"),
                "distance": obj.metadata.score,
                "vector": obj.vector, # Keep vector for graph traversal
                "id": str(obj.uuid)
            })
        print(f"Found {len(results)} results.")
        return results
    except Exception as e:
        print(f"!!! Error in search_notes: {e}")
        return []

def search_with_graph_context(query: str, limit: int = 3, graph_depth: int = 1):
    """Graph RAG: Retrieves notes + their semantic neighbors."""
    print(f"--- Graph RAG Search: '{query}' ---")
    
    # 1. Initial Search (Top K)
    initial_results = search_notes(query, limit=limit)
    
    final_results = {res['id']: res for res in initial_results}
    
    # 2. Graph Traversal (Find neighbors for each result)
    for res in initial_results:
        try:
            # Use the result's vector to find similar notes (edges)
            # We handle vector structure (v4 client)
            vec = res.get('vector')
            if isinstance(vec, dict):
                vec = vec.get('default') or list(vec.values())[0]
                
            neighbors = notes_collection.query.near_vector(
                near_vector=vec,
                limit=2, # Get top 2 neighbors per node
                return_metadata=["distance"],
                return_properties=["text", "source"]
            )
            
            for obj in neighbors.objects:
                if str(obj.uuid) not in final_results:
                    print(f"  -> Found neighbor: {obj.properties.get('text')[:30]}...")
                    final_results[str(obj.uuid)] = {
                        "text": obj.properties["text"],
                        "source": obj.properties.get("source", "unknown"),
                        "distance": obj.metadata.distance,
                        "id": str(obj.uuid)
                    }
        except Exception as e:
            print(f"Error traversing graph for node {res['id']}: {e}")
            
    return list(final_results.values())



def ask_groq(question: str, context_text: str, history_text: str, api_key: str) -> str:
    """Queries Groq API."""
    print(f"--- Asking Groq (Cloud) ---")
    try:
        client = Groq(api_key=api_key)
        
        system_prompt = f"""You are MeshMemory, an advanced knowledge engine.
        Answer strictly based on the context provided.
        
        Context:
        {context_text}
        
        Chat History:
        {history_text}
        """
        
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )
        
        return completion.choices[0].message.content
    except Exception as e:
        return f"Groq Error: {str(e)}"

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
    
    # Check for env var if api_key not provided
    if not api_key:
        # Priority: Groq > Gemini > Ollama
        groq_key = os.getenv("GROQ_API_KEY", "")
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        
        if groq_key:
            mode = "groq"
            api_key = groq_key
        elif gemini_key:
            mode = "gemini"
            api_key = gemini_key

    print(f"--- Asking Brain: '{question}' (Mode: {mode}) ---")
    
    # 1. Retrieve (Graph RAG)
    context_docs = search_with_graph_context(question, limit=5)
    
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
    if mode == "gemini" and api_key:
        answer = ask_gemini(question, context_text, history_text, api_key)
        return {"answer": answer, "sources": sources}
    elif mode == "groq" and api_key:
        answer = ask_groq(question, context_text, history_text, api_key)
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
            limit=500, 
            return_properties=["text", "source", "title"],
            include_vector=True
        )
        
        nodes = []
        links = []
        vectors = []
        ids = []
        
        # 1. Create Nodes & Collect Vectors
        if not response.objects:
            print("Graph is empty.")
            return {"nodes": [], "links": []}

        for obj in response.objects:
            # Handle vector structure (v4 client)
            vec = obj.vector
            if isinstance(vec, dict):
                vec = vec.get('default') or list(vec.values())[0]
            
            # Smart Naming: Use Title if available, else Source, else Text snippet
            title = obj.properties.get("title", "")
            source = obj.properties.get("source", "unknown")
            text_snippet = obj.properties.get("text", "")[:20] + "..."
            
            if title and title != "unknown":
                name = title[:30] + "..." if len(title) > 30 else title
            elif source and source != "user" and source != "unknown":
                name = os.path.basename(source) # Clean up path/url
                if len(name) > 20: name = name[:20] + "..."
            else:
                name = text_snippet

            nodes.append({
                "id": str(obj.uuid),
                "name": name,
                "fullText": obj.properties.get("text", ""),
                "source": source,
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
            # Higher threshold (0.70) means only very similar/related nodes connect
            THRESHOLD = 0.7
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
