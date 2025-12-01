"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { checkHealth, ingestNote, ingestPDF, searchNotes, askBrain, getGraphData } from "@/lib/api";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function Home() {
  const [health, setHealth] = useState(false);
  const [note, setNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [qaQuery, setQaQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{user: string, ai: string, sources?: string[]}[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkHealth().then(setHealth);
    refreshGraph();
  }, []);

  const refreshGraph = async () => {
    const data = await getGraphData();
    setGraphData(data);
  };

  const handleIngest = async () => {
    setLoading(true);
    if (file) {
      await ingestPDF(file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("PDF Ingested!");
    } else if (note) {
      await ingestNote(note);
      setNote("");
      alert("Memory stored!");
    }
    await refreshGraph(); // Refresh graph after ingest
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    const res = await searchNotes(searchQuery);
    setSearchResults(res.results || []);
    setLoading(false);
  };

  const handleQA = async () => {
    if (!qaQuery.trim()) return;
    setLoading(true);
    
    // Optimistic update
    const currentQuery = qaQuery;
    setQaQuery(""); // Clear input immediately
    
    const res = await askBrain(currentQuery, chatHistory);
    
    setChatHistory(prev => [...prev, { user: currentQuery, ai: res.answer, sources: res.sources }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">MeshMemory</h1>
              <p className="text-xs text-gray-500 font-mono">LOCAL NODE v1.0</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${health ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {health ? "● SYSTEM ONLINE" : "● SYSTEM OFFLINE"}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Graph (Visuals) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Ingest Card */}
          <div className="bg-neutral-900/50 rounded-2xl border border-white/5 p-6 backdrop-blur-sm hover:border-white/10 transition-colors">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-200">
              <span className="text-blue-400">📥</span> Ingest Knowledge
            </h2>
            
            <div className="space-y-4">
              <textarea
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                placeholder="Paste notes, ideas, or raw text here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input 
                    type="file" 
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden" 
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 w-full bg-black/40 border border-white/10 border-dashed rounded-xl p-3 text-sm text-gray-400 cursor-pointer hover:bg-white/5 transition-all"
                  >
                    {file ? <span className="text-blue-400">{file.name}</span> : "📄 Drop PDF or Click to Upload"}
                  </label>
                </div>
                
                <button
                  onClick={handleIngest}
                  disabled={loading || (!note && !file)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                >
                  {loading ? "Processing..." : "Save to Brain"}
                </button>
              </div>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="bg-neutral-900/50 rounded-2xl border border-white/5 h-[500px] relative overflow-hidden group">
             <div className="absolute top-4 left-6 z-10">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                  <span className="text-purple-400">🕸️</span> Knowledge Graph
                </h2>
                <p className="text-xs text-gray-500">{graphData.nodes.length} Memories</p>
             </div>
             
             <ForceGraph2D
                graphData={graphData}
                nodeLabel="name"
                nodeColor={() => "#60a5fa"}
                linkColor={() => "#ffffff20"}
                backgroundColor="#00000000"
                nodeRelSize={6}
             />
          </div>
        </div>

        {/* Right Column: Interaction (Search & QA) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Search Card */}
          <div className="bg-neutral-900/50 rounded-2xl border border-white/5 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-200">
              <span className="text-green-400">🔍</span> Recall Memory
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500/50 outline-none"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {searchResults.map((res, i) => (
                <div key={i} className="bg-black/20 p-3 rounded-lg border border-white/5 text-sm hover:border-white/20 transition-colors group">
                  <p className="text-gray-300 line-clamp-2 group-hover:text-white transition-colors">{res.text}</p>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>{(res.distance * 100).toFixed(1)}% Match</span>
                    <span className="uppercase tracking-wider text-blue-400/70">{res.source}</span>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && searchQuery && !loading && (
                <p className="text-center text-gray-500 py-8 text-sm">No memories found.</p>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-neutral-900/50 rounded-2xl border border-white/5 p-6 backdrop-blur-sm h-[600px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-200">
              <span className="text-orange-400">🧠</span> Chat with Brain
            </h2>
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
              {chatHistory.map((turn, i) => (
                <div key={i} className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600/20 border border-blue-500/30 text-blue-100 px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                      {turn.user}
                    </div>
                  </div>
                  
                  {/* AI Message */}
                  <div className="flex justify-start">
                     <div className="bg-neutral-800 border border-white/10 text-gray-200 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[90%] text-sm leading-relaxed whitespace-pre-wrap">
                      {turn.ai}
                      {turn.sources && turn.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-gray-500 font-medium mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-2">
                            {turn.sources.map((src, idx) => (
                              <span key={idx} className="text-[10px] bg-white/5 px-2 py-1 rounded text-blue-400/80 border border-blue-500/10">
                                {src}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                 <div className="flex justify-start">
                     <div className="bg-neutral-800 border border-white/10 text-gray-400 px-4 py-2 rounded-2xl rounded-tl-sm text-sm animate-pulse">
                      Thinking...
                    </div>
                  </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"
                placeholder="Ask a follow-up question..."
                value={qaQuery}
                onChange={(e) => setQaQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQA()}
              />
              <button
                onClick={handleQA}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-500 text-white px-4 rounded-xl font-medium text-sm transition-all shadow-lg shadow-orange-900/20"
              >
                Send
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
