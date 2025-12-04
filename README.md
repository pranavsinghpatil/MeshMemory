# 🧠 MeshMemory
> *Your Local-First, AI-Powered Second Brain.*

MeshMemory is a sophisticated, privacy-focused knowledge management system that turns your scattered notes and documents into an intelligent, queryable **Knowledge Graph**. By combining **Vector Search (RAG)** with **Graph Relationships**, it allows you to not just "search" your data, but "explore" the connections between your ideas.

Built for privacy enthusiasts, it runs **100% locally** using Ollama and Docker, ensuring your personal data never leaves your machine unless you explicitly choose to use cloud models.

---

## ✨ Key Features

*   **🔒 Local-First Architecture**: Powered by **Ollama** (Llama 3, Mistral, etc.) and local embeddings. No data leaks.
*   **🕸️ Semantic Knowledge Graph**: Automatically links related memories based on meaning, not just keywords. Visualized in 3D/2D.
*   **📂 Multi-Modal Ingestion**: Drag-and-drop support for **PDFs** and text notes.
*   **💬 Context-Aware Chat**: Chat with your brain. The assistant remembers your previous queries and uses your notes as context.
*   **🔌 MCP Server Support**: Connect MeshMemory to **Claude Desktop** or other MCP-compliant tools to use your personal knowledge base inside other AI agents.
*   **🎨 Premium UI**: A beautiful, dark-mode interface built with Next.js, Tailwind CSS, and Framer Motion.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:

1.  **Docker Desktop**: Required for the Vector Database (Weaviate). [Download Here](https://www.docker.com/products/docker-desktop/)
2.  **Python 3.10+**: Required for the backend API. [Download Here](https://www.python.org/downloads/)
3.  **Node.js 18+**: Required for the frontend UI. [Download Here](https://nodejs.org/)
4.  **Ollama**: Required for running local LLMs. [Download Here](https://ollama.com/)

---

## 🚀 Installation & Setup Guide

Follow these steps carefully to set up the entire stack from scratch.

### 1. Clone the Repository

```bash
git clone https://github.com/pranavsinghpatil/MeshMemory.git
cd MeshMemory
```

### 2. 🐳 Docker Setup (Vector Database)

We use **Weaviate** as our vector store. It runs in a Docker container.

1.  Ensure Docker Desktop is running.
2.  Start the database:
    ```bash
    docker-compose up -d
    ```
3.  Verify it's running by visiting `http://localhost:8080/v1/meta` in your browser. You should see a JSON response.

### 3. 🦙 Ollama Setup (Local AI)

We need two models: one for **embeddings** (turning text into numbers) and one for **chat** (answering questions).

1.  Install Ollama from [ollama.com](https://ollama.com).
2.  Open your terminal and pull the required models:

    *   **Embedding Model** (Fast & Lightweight):
        ```bash
        ollama pull all-minilm
        ```
    *   **Chat Model** (Llama 3 is recommended):
        ```bash
        ollama pull llama3
        ```
    *(Note: You can change these models in `core_logic.py` if you prefer others like `mistral` or `nomic-embed-text`)*

### 4. 🐍 Backend Setup (Python API)

The backend handles ingestion, search, and graph logic.

1.  **Create a Virtual Environment** (Recommended to keep dependencies isolated):
    ```bash
    python -m venv .venv
    ```
2.  **Activate the Environment**:
    *   **Windows (PowerShell)**:
        ```powershell
        .\.venv\Scripts\Activate.ps1
        ```
    *   **Mac/Linux**:
        ```bash
        source .venv/bin/activate
        ```
3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Start the Server**:
    ```bash
    cd mesh-core/backend
    uvicorn main:app --reload --port 8000
    ```
    *The API is now live at `http://localhost:8000`*

### 5. ⚛️ Frontend Setup (Next.js UI)

The frontend provides the visual interface.

1.  Open a **new terminal** window (keep the backend running).
2.  Navigate to the UI directory:
    ```bash
    cd ui
    ```
3.  **Install Node Modules**:
    ```bash
    npm install
    ```
4.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
5.  Open your browser and go to **`http://localhost:3000`**.

---

## 🎮 Running the Application (Quick Start)

Once you have performed the initial setup (installed dependencies and pulled models), you don't need to open three terminal windows every time.

### Windows Users
Simply double-click the **`launch.bat`** file in the root directory. It will:
1.  Check if Docker is running.
2.  Start the Python Backend.
3.  Start the Next.js Frontend.
4.  Open your default browser to the app.

---

## 📖 Usage Guide

### 📥 Ingesting Memories
1.  **Text Notes**: Type a quick thought in the "Ingest Data" card and click "Save Memory".
2.  **PDFs**: Drag and drop a PDF file (e.g., a research paper or receipt) and click "Upload".
    *   *The system will chunk the text, generate embeddings, and store them in Weaviate.*

### 🔍 Recalling & Searching
1.  Type a query in the "Recall" search bar (e.g., "What did I learn about React?").
2.  The system performs a **Vector Search** to find semantically similar notes.
3.  Results are ranked by relevance match %.

### 🕸️ Exploring the Graph
*   The **Neural Graph** on the right visualizes your knowledge.
*   **Nodes** represent memories.
*   **Links** represent semantic similarity (calculated via cosine similarity of embeddings).
*   Click a node to instantly search for it and see related memories.

### 💬 Chatting with Your Brain
1.  Click the **Chat Bubble** (bottom right) or "Ask AI" on a search result.
2.  Ask a question. The Assistant uses **RAG (Retrieval Augmented Generation)**:
    *   It searches your memories for relevant context.
    *   It feeds that context to Llama 3.
    *   It generates an answer based *only* on your data.
3.  **Expand** the chat window (top right arrow) for a full-screen experience.

---

## 🏗️ Architecture

```text
+----------------+      +------------------+      +------------------------+
|   User (UI)    | <--> | Next.js Frontend | <--> |   Python Backend API   |
+----------------+      +------------------+      +-----------+------------+
                                                              |
                                         +--------------------+--------------------+
                                         |                                         |
                                 +-------v-------+                         +-------v-------+
                                 |    Ollama     |                         |   Weaviate    |
                                 | (LLM + Embed) |                         |  (Vector DB)  |
                                 +---------------+                         +---------------+

Data Flow:
[Ingest] -> [Chunking] -> [Embedding Model] -> [Vector DB]
[Query]  -> [Embedding Model] -> [Vector Search] -> [RAG Construction] -> [LLM Generation]
```

---

## 🔧 Troubleshooting

*   **"Connection Refused"**: Ensure Docker is running and Weaviate is up (`docker-compose ps`).
*   **"Ollama not found"**: Make sure Ollama is running in the background (check your system tray).
*   **"Module not found"**: Ensure you activated the Python virtual environment before running the backend.
*   **Graph is empty**: Ingest some data first! The graph needs nodes to visualize connections.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit Pull Requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Crafted with ❤️ by Pranav*
