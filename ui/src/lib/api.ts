const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function checkHealth() {
    try {
        const res = await fetch(`${API_URL}/`);
        return res.ok;
    } catch (e) {
        return false;
    }
}

export async function ingestNote(text: string) {
    const res = await fetch(`${API_URL}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    return res.json();
}

export async function ingestPDF(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/ingest/pdf`, {
        method: "POST",
        body: formData,
    });
    return res.json();
}

export async function ingestFile(file: File, apiKey: string = "") {
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
    const res = await fetch(`${API_URL}/ingest/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });
    return res.json();
}

export async function ingestYouTube(url: string) {
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

export async function askBrain(query: string, history: any[] = [], mode: string = "local", apiKey: string = "") {
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
    const res = await fetch(`${API_URL}/notes/${uuid}`, {
        method: "DELETE",
    });
    return res.json();
}

export async function updateNote(uuid: string, text: string) {
    const res = await fetch(`${API_URL}/notes/${uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    return res.json();
}
