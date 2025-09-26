
import uuid
import weaviate
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
from weaviate.classes.config import Property, DataType
from weaviate.classes.init import AdditionalConfig, Timeout
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.vectorstores import Weaviate as LCWeaviate
import os

class IngestRequest(BaseModel):
    text: str
    
# lifespan manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    client.close()

# ✅ only one app instance
app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {"message": "MeshMemory backend is alive 🚀"}

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --------------------------------------------------------
# Connect (REST only, skip gRPC check)
client = weaviate.connect_to_local(
    port=8080,
    skip_init_checks=True,
    additional_config=AdditionalConfig(timeout=Timeout(init=30))  # optional
)

# Embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Ensure collection exists
class_name = "Note"
if class_name not in client.collections.list_all():
    client.collections.create(
        name=class_name,
        properties=[
            Property(name="text", data_type=DataType.TEXT),
        ]
    )

# Reference the collection
notes = client.collections.get(class_name)

@app.post("/ingest")
async def ingest(req: IngestRequest):
    emb = model.encode(req.text).tolist()
    notes.data.insert(
        properties={"text": req.text},
        vector=emb,
        uuid=uuid.uuid4()
    )
    return {"status": "stored", "text_preview": req.text[:50]}

@app.post("/embed")
async def embed(text: str = Form(...)):
    """Return raw embedding for given text (developer tool)."""
    emb = model.encode(text).tolist()
    return {
        "dim": len(emb),
        "embedding_preview": emb[:10]
    }


@app.get("/search")
async def search(query: str):
    q_emb = model.encode(query).tolist()
    res = client.query.get(class_name, ["text"]).with_near_vector({
        "vector": q_emb
    }).with_limit(5).do()
    notes = res["data"]["Get"][class_name]
    return {"results": notes}

# QA with LangChain and OpenAI ----------------------------------------------

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=vectorstore.as_retriever())

class QARequest(BaseModel):
    query: str

@app.post("/qa")
async def qa(req: QARequest):
    answer = qa_chain.run(req.query)
    return {"query": req.query, "answer": answer}