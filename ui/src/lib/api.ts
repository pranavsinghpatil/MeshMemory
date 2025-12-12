const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const READ_ONLY = process.env.NEXT_PUBLIC_READ_ONLY === "true";

// Helper to check for admin password if in read-only mode
function checkAuth() {
    if (!READ_ONLY) return true;

    // Check if already authenticated this session
    if (sessionStorage.getItem("mesh_admin_auth") === "true") return true;

    const password = prompt("⚠️ Restricted Action ⚠️\n\nThis system is in Read-Only Mode for visitors.\n Contact the Developer for help.");

    if (password === "mesh") {
        sessionStorage.setItem("mesh_admin_auth", "true");
        return true;
    }

    alert("❌ Access Denied: Incorrect Password.");
    throw new Error("Access Denied");
}

export async function checkHealth() {
    try {
        const res = await fetch(`${API_URL}/`);
        return res.ok;
    } catch {
        return false;
    }
}

export async function ingestNote(text: string) {
    checkAuth();
    const res = await fetch(`${API_URL}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    return res.json();
}

export async function ingestPDF(file: File) {
    checkAuth();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/ingest/pdf`, {
        method: "POST",
        body: formData,
    });
    return res.json();
}

export async function ingestFile(file: File, apiKey: string = "") {
    checkAuth();
    const formData = new FormData();
    formData.append("file", file);
    if (apiKey) {
        formData.append("api_key", apiKey);
    }

    const res = await fetch(`${API_URL}/ingest/file`, {
        method: "POST",
        body: formData,
    });
    return res.json();
}


export async function ingestURL(url: string) {
    checkAuth();
    const res = await fetch(`${API_URL}/ingest/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });
    return res.json();
}

export async function ingestYouTube(url: string) {
    checkAuth();
    const res = await fetch(`${API_URL}/ingest/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });
    return res.json();
}

export async function searchNotes(query: string) {
    const res = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
    return res.json();
}

export async function askBrain(query: string, history: Array<{ user: string, ai: string, sources?: string[] }> = [], mode: string = "local", apiKey: string = "") {
    const res = await fetch(`${API_URL}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, history, mode, api_key: apiKey }),
    });
    return res.json();
}

export async function getGraphData() {
    try {
        const res = await fetch(`${API_URL}/graph`);
        if (!res.ok) throw new Error("Graph fetch failed");
        return res.json();
    } catch (e) {
        console.error("Failed to fetch graph data:", e);
        return { nodes: [], links: [] };
    }
}

export async function deleteNote(uuid: string) {
    checkAuth();
    const res = await fetch(`${API_URL}/notes/${uuid}`, {
        method: "DELETE",
    });
    return res.json();
}

export async function updateNote(uuid: string, text: string) {
    checkAuth();
    const res = await fetch(`${API_URL}/notes/${uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    return res.json();
}
