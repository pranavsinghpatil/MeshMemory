# 🛠️ Setup & Configuration Guide

MeshMemory relies on two key components: the **Backend** (running the application logic + database) and the **Frontend** (the UI). You can configure these in two ways depending on your needs.

## 📊 Comparison

| Feature | ☁️ Online (Production) | 🏠 Local (Development) |
| :--- | :--- | :--- |
| **Connectivity** | Connects to `meshmemory.onrender.com` | Connects to `localhost` |
| **Requirements** | Node.js only | Docker + Python + Node.js + Ollama |
| **Privacy** | Data managed on Cloud | 100% Private (Your machine) |
| **Setup Time** | ~2 minutes | ~15 minutes |
| **Best For** | Demos, Quick usage, checking UI | Full development, Privacy enthusiasts |

---

## ☁️ Option 1: Online Mode (Quick Start)
*Perfect for demos or using the app without installing Docker.*

### 1. Prerequisites
- **Node.js 18+** installed.

### 2. Configure Frontend
1.  Navigate to the `ui` folder:
    ```bash
    cd ui
    ```
2.  Create or Edit `.env.local`:
    ```ini
    # Points to the live production server
    NEXT_PUBLIC_API_URL="https://meshmemory.onrender.com"
    ```
    *(Note: The default fallback in the code is set to this URL, but setting it explicitly is best practice).*

### 3. Run
```bash
npm install
npm run dev
```
Open **http://localhost:3000**. You should see the "Online" indicator in green.

---

## 🏠 Option 2: Local Mode (Full Setup)
*Perfect for developing the backend or keeping data private.*

### 1. Prerequisites
- **Docker Desktop** (Running)
- **Python 3.10+**
- **Node.js 18+**
- **Ollama** (Running `ollama serve`)

### 2. Backend Setup
1.  Navigate to `mesh-core/backend`.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Ensure your `.env` connects to Local Weaviate:
    ```ini
    WEAVIATE_URL=localhost
    WEAVIATE_PORT=8080
    ```
4.  Start Weaviate:
    ```bash
    docker-compose up -d
    ```
5.  Start Backend:
    ```bash
    python -m uvicorn main:app --reload
    ```

### 3. Frontend Setup
1.  Navigate to `ui`.
2.  Update `.env.local` to point locally:
    ```ini
    NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
    ```
3.  Run:
    ```bash
    npm run dev
    ```

---

## 🔑 Key Configuration (Environment Variables)

### Backend (`mesh-core/backend/.env`)
| Variable | Description |
| :--- | :--- |
| `WEAVIATE_URL` | URL of the vector database (e.g., `localhost` or `cluster.weaviate.network`). |
| `WEAVIATE_API_KEY` | Admin key for Weaviate (Leave empty for local Docker). |
| `GEMINI_API_KEY` | **Required** for file analysis (PDF/Image) even in local mode if using Gemini features. |
| `OLLAMA_MODEL` | Local LLM to use (Default: `llama3`). |

### Frontend (`ui/.env.local`)
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The URL of the backend API. |
| `NEXT_PUBLIC_READ_ONLY` | Set to `true` to disable editing/deleting (for public demos). |

---

## ⚠️ Important Troubleshooting

### "Files URL/YouTube not showing up?"
- **On Cloud**: The cloud server might be blocked by YouTube or websites. Also, you **must** enter a Gemini API Key in the UI Settings for file analysis to work.
- **On Local**: Make sure Docker is running.
