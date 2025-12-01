# 🧠 MeshMemory Node
**Your Local, Agentic Second Brain.**

> **Status**: 🟢 Active | **Version**: 1.0 (Local Node)

## 🚀 How to Run (Windows)

**Just double-click `launch.bat`!**

This will automatically:
1.  Start the **Vector Database** (Docker).
2.  Start the **Brain** (FastAPI + Ollama).
3.  Start the **Control Center** (Web UI).

---

## 🌍 Access Points

-   **Control Center**: [http://localhost:3000](http://localhost:3000)
    -   *Ingest notes, Search memories, Chat with your brain.*
-   **API Endpoint**: [http://localhost:8000](http://localhost:8000)
-   **MCP Server**: `d:\MeshMemory\mesh-core\backend\mcp_server.py`
    -   *Plug this path into Claude Desktop to give it memory!*

## 🛠️ Requirements
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Running)
-   [Ollama](https://ollama.com/) (Running `ollama serve` with `llama3` model)
-   Python 3.10+ & Node.js 18+

## 🤖 Features
-   **100% Local**: No OpenAI keys needed. Uses Llama 3 on your machine.
-   **Agent Ready**: Implements **MCP (Model Context Protocol)**.
-   **Semantic Search**: Finds concepts, not just keywords.
