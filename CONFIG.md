# ⚙️ Configuration Guide

## 🔌 Switching Weaviate Modes (Local vs Cloud)

MeshMemory is designed to work with both **Local Docker Weaviate** (Free, Unlimited, Private) and **Weaviate Cloud** (Managed, expires in 14 days on free tier).

### Option 1: Using Local Weaviate (Docker) - **RECOMMENDED**
This is the default mode. It keeps all your data on your machine.

1.  Ensure Docker is running.
2.  Edit your `.env` file (in `mesh-core/backend`):
    ```ini
    WEAVIATE_URL=localhost
    WEAVIATE_PORT=8080
    WEAVIATE_API_KEY=
    ```
    *(Leave API KEY empty)*.

### Option 2: Using Weaviate Cloud (WCS)
Use this if you are deploying to Render/Vercel or want a managed database.

1.  Create a cluster at [console.weaviate.cloud](https://console.weaviate.cloud).
2.  Edit your `.env` file:
    ```ini
    WEAVIATE_URL=https://your-cluster-url.weaviate.network
    WEAVIATE_API_KEY=your-admin-api-key
    ```
    *(Do NOT include `http://` or `https://` if using the local code, but our code handles it. Just paste the Cluster URL).*

### ⚠️ Important Note on "14 Days"
The free Weaviate Cloud sandbox expires after 14 days. If it expires:
1.  **Export your data** (we can build a script for this) OR
2.  **Switch to Local Docker** (Option 1) to keep your brain running forever for free.

## 🖥️ Frontend Configuration
The frontend connects to the backend.
- **Local**: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`
- **Production**: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
