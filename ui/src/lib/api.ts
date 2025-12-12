const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const READ_ONLY = process.env.NEXT_PUBLIC_READ_ONLY === "true";

export async function checkHealth() {
    try {
        const res = await fetch(`${API_URL}/`);
        return res.ok;
    } catch {
        return false;
    }
}

export async function ingestNote(text: string) {
    if (READ_ONLY) throw new Error("System is in Read-Only Mode. Contact Developer.");
    const res = await fetch(`${API_URL}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    return res.json();
}

export async function ingestPDF(file: File) {
    if (READ_ONLY) throw new Error("System is in Read-Only Mode. Contact Developer.");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/ingest/pdf`, {
        method: "POST",
        body: formData,
    });
    return res.json();
}

export async function ingestFile(file: File, apiKey: string = "") {
    if (READ_ONLY) throw new Error("System is in Read-Only Mode. Contact Developer.");
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
    if (READ_ONLY) throw new Error("System is in Read-Only Mode. Contact Developer.");
    const res = await fetch(`${API_URL}/ingest/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });
    return res.json();
}

export async function ingestYouTube(url: string) {
    if (READ_ONLY) throw new Error("System is in Read-Only Mode. Contact Developer.");
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
    if (READ_ONLY) throw new Error("System is in Read-Only Mode. Contact Developer.");
    const res = await fetch(`${API_URL}/notes/${uuid}`, {
        method: "DELETE",
    });
    return res.json();
}

export async function updateNote(uuid: string, text: string) {
    if (READ_ONLY) throw new Error("System is in Read-Only Mode. Contact Developer.");
    const res = await fetch(`${API_URL}/notes/${uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    return res.json();
}
