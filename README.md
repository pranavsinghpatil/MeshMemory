# 🧠 MeshMemory: Local Agentic Brain

> **A "Second Brain" that runs 100% locally.**  
> Powered by **Ollama** (Llama 3), **Weaviate** (Vector DB), and **MCP** (Model Context Protocol).

![MeshMemory Dashboard](https://via.placeholder.com/1200x600?text=MeshMemory+Dashboard+Preview)

## 🚀 Why MeshMemory?
Most "memory" tools are just file search. MeshMemory is different:
*   **🕸️ Knowledge Graph**: It builds a semantic web of your ideas, linking related concepts automatically.
*   **💬 Chat with History**: Have a real conversation with your data. It remembers context.
*   **🛡️ Privacy First**: Your data *never* leaves your machine. No OpenAI keys. No cloud.
*   **🔌 Agent Ready**: Implements **MCP**, so you can connect it to Claude Desktop or Cursor.

## ✨ Key Features
*   **Universal Ingestion**: Drag & Drop PDFs or paste raw text.
*   **Semantic Search**: Find things by *meaning*, not just keywords.
*   **RAG Pipeline**: Answers questions using your data + Llama 3.
*   **Source Citations**: Tells you exactly *where* the answer came from (e.g., `manual.pdf (part 1)`).
*   **Premium UI**: Dark mode, smooth animations, and interactive physics graph.

## 🛠️ Quick Start (Windows)

1.  **Prerequisites**:
    *   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Weaviate)
    *   [Ollama](https://ollama.com/) (run `ollama pull llama3`)
    *   [Python 3.10+](https://www.python.org/)
    *   [Node.js](https://nodejs.org/)

2.  **One-Click Launch**:
    Double-click `launch.bat`.
    *   It starts the Vector DB.
    *   It starts the Backend Brain (Port 8000).
    *   It starts the Control Center UI (Port 3000).

3.  **Open the UI**:
    Go to [http://localhost:3000](http://localhost:3000).

## 🧩 Architecture
*   **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, React Force Graph.
*   **Backend**: FastAPI, PyPDF, Sentence Transformers (Local Embeddings).
*   **Database**: Weaviate (Local Docker Container).
*   **LLM**: Ollama (Llama 3).

## 🤖 MCP Integration
To use MeshMemory as a tool for **Claude Desktop**:
1.  Add the configuration to your `claude_desktop_config.json`.
2.  Point it to `d:\MeshMemory\mesh-core\backend\mcp_server.py`.
3.  Claude can now "Save Memory" and "Recall Memory" directly!

---
*Built with ❤️ by Pranav's AI Agent*
