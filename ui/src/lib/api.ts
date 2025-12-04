const API_URL = "http://localhost:8000";

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
    const res = await fetch(`${API_URL}/graph`);
    return res.json();
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
