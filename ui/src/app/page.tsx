"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any[]>([]);
  const [qaQuery, setQaQuery] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");

const handleIngest = async () => {
  const res = await fetch("http://localhost:8000/ingest", {
    method: "POST",
    body: JSON.stringify({ text: input }), // <-- send input state
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  setResult(prev => [...prev, data]); // append to results array
  setInput(""); // optional: clear textarea after submission
};

const handleSearch = async () => {
  const res = await fetch(`http://localhost:8000/search?query=${query}`);
  const json = await res.json();
  setResult(json.data?.Get?.Note || []); // always array
};

const handleQA = async () => {
  const res = await fetch("http://localhost:8000/qa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: qaQuery }),
  });
  const data = await res.json();
  setQaAnswer(data.answer);
};

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MeshMemory</h1>

      {/* Ingest form */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">Ingest</h2>
        <textarea
          className="w-full p-2 border rounded mb-2"
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text here..."
        />
        <button
          onClick={handleIngest}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit
        </button>
      </div>

      {/* Search form */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">Search</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query..."
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {result.length > 0 && (
        <div className="space-y-2">
          {result.map((r, i) => (
            <div key={i} className="p-3 border rounded bg-gray-900">
              {r.text_preview}
            </div>
          ))}
        </div>
      )}
      {/* QA form */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">Ask Agent</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          value={qaQuery}
          onChange={(e) => setQaQuery(e.target.value)}
          placeholder="Ask a question..."
        />
        <button
          onClick={handleQA}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Ask
        </button>
        {qaAnswer && (
          <div className="mt-3 p-3 bg-gray-50 border rounded">
            {qaAnswer}
          </div>
        )}
      </div>


    </main>
  );
}
