document.getElementById('saveBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    const btn = document.getElementById('saveBtn');

    btn.disabled = true;
    btn.innerText = "Saving...";
    statusDiv.innerText = "";
    statusDiv.className = "";

    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Execute script to get page content
        const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Simple extraction: Get title and main text
                // In a real app, use Readability.js here
                return {
                    title: document.title,
                    url: window.location.href,
                    text: document.body.innerText
                };
            }
        });

        const data = result[0].result;

        // Send to MeshMemory Backend
        // We use the /ingest endpoint which accepts text
        // We'll format it nicely
        const payload = {
            text: `Title: ${data.title}\nURL: ${data.url}\n\nContent:\n${data.text}`,
            source: "web_clipper"
        };

        const response = await fetch('http://localhost:8000/ingest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            statusDiv.innerText = "Successfully saved to memory!";
            statusDiv.className = "success";
            btn.innerText = "Saved";
        } else {
            throw new Error("Backend error");
        }

    } catch (error) {
        console.error(error);
        statusDiv.innerText = "Failed to save. Is MeshMemory running?";
        statusDiv.className = "error";
        btn.disabled = false;
        btn.innerText = "Save to Memory";
    }
});
