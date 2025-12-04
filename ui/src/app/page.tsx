"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { checkHealth, ingestNote, ingestPDF, searchNotes, askBrain, getGraphData, deleteNote, updateNote } from "@/lib/api";
import Footer from "@/components/Footer";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// Simple Toast Component
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-blue-400/20 z-50 flex items-center gap-3"
  >
    <span>✅ {message}</span>
    <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
  </motion.div>
);

export default function Home() {
  const [health, setHealth] = useState(false);
  const [note, setNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [qaQuery, setQaQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{user: string, ai: string, sources?: string[]}[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 0, height: 0 });
  const graphWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkHealth().then(setHealth);
    refreshGraph();
    
    // Resize observer for graph
    const updateDimensions = () => {
      if (graphWrapperRef.current) {
        setGraphDimensions({
          width: graphWrapperRef.current.clientWidth,
          height: graphWrapperRef.current.clientHeight
        });
      }
    };
    
    const observer = new ResizeObserver(() => {
        // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
        requestAnimationFrame(updateDimensions);
    });

    if (graphWrapperRef.current) {
        observer.observe(graphWrapperRef.current);
    }
    
    // Initial call
    updateDimensions();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const refreshGraph = async () => {
    const data = await getGraphData();
    setGraphData(data);
  };

  const handleIngest = async () => {
    setIngesting(true);
    try {
      if (file) {
        await ingestPDF(file);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setToast("PDF Ingested Successfully!");
      } else if (note) {
        await ingestNote(note);
        setNote("");
        setToast("Memory Stored Successfully!");
      }
      await refreshGraph(); 
    } catch (e) {
      alert("Error ingesting: " + e);
    }
    setIngesting(false);
  };

  const handleSearch = async () => {
    setSearching(true);
    const res = await searchNotes(searchQuery);
    setSearchResults(res.results || []);
    setSearching(false);
  };

  const handleDelete = async (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering search
    if (!confirm("Are you sure you want to delete this memory?")) return;
    
    await deleteNote(uuid);
    setToast("Memory Deleted");
    
    // Refresh
    handleSearch();
    refreshGraph();
  };

  const handleEdit = async (uuid: string, currentText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newText = prompt("Edit Memory:", currentText);
    if (newText === null || newText === currentText) return;

    await updateNote(uuid, newText);
    setToast("Memory Updated");
    handleSearch();
    refreshGraph();
  };

  const handleQA = async () => {
    if (!qaQuery.trim()) return;
    setLoading(true);
    
    const currentQuery = qaQuery;
    setQaQuery(""); 
    
    const res = await askBrain(currentQuery, chatHistory, mode, apiKey);
    
    setChatHistory(prev => [...prev, { user: currentQuery, ai: res.answer, sources: res.sources }]);
    setLoading(false);
  };

  // Helper for graph colors
  const stringToColor = (str: string) => {
    if (!str) return "#888888";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }

  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState("local"); // "local" | "cloud"
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // Load settings from local storage
    const savedKey = localStorage.getItem("gemini_api_key");
    const savedMode = localStorage.getItem("brain_mode");
    if (savedKey) setApiKey(savedKey);
    if (savedMode) setMode(savedMode);
  }, []);

  const saveSettings = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    localStorage.setItem("brain_mode", mode);
    setShowSettings(false);
    setToast("Settings Saved!");
  };

  return (
    <div className="h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-black text-gray-100 font-sans selection:bg-blue-500/30 flex flex-col overflow-hidden">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        {showSettings && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            >
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl ring-1 ring-white/5">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-2xl">⚙️</span> Brain Settings
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Inference Engine</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setMode("local")}
                                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${mode === "local" ? "bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]" : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"}`}
                                >
                                    <div className="text-lg mb-1">🏠</div>
                                    Local (Ollama)
                                </button>
                                <button 
                                    onClick={() => setMode("cloud")}
                                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${mode === "cloud" ? "bg-purple-600/20 border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.2)]" : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"}`}
                                >
                                    <div className="text-lg mb-1">☁️</div>
                                    Cloud (Gemini)
                                </button>
                            </div>
                        </div>

                        {mode === "cloud" && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Gemini API Key</label>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                                        placeholder="AIzaSy..."
                                    />
                                    <div className="absolute right-3 top-3 text-xs text-gray-600">🔒</div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                    Key is stored locally in your browser.
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                        <button onClick={saveSettings} className="bg-white text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all shadow-lg">Save Changes</button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50 shrink-0">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <Link href="/" className="group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-gray-400 flex items-center justify-center font-bold text-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                M
                </div>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                MeshMemory
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-normal text-gray-400 border border-white/5">v2.1</span>
              </h1>
            </div>
          </div>

          {/* Centered Badges */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-[10px] font-mono font-medium text-yellow-500/80 tracking-wide">VECTOR_DB</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[10px] font-mono font-medium text-blue-500/80 tracking-wide">RAG_ENGINE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/5 border border-purple-500/10 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="text-[10px] font-mono font-medium text-purple-500/80 tracking-wide">MCP_SERVER</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono font-medium text-green-500/80 tracking-wide">KNOWLEDGE_GRAPH</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <nav className="hidden md:flex gap-6 text-sm font-medium">
                <Link href="/" className="text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-px after:bg-white">Control Center</Link>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</Link>
                <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-white transition-colors">Settings</button>
             </nav>
             <div className={`pl-4 border-l border-white/10 flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${health ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"}`}></div>
                <span className={`text-xs font-medium ${health ? "text-green-400" : "text-red-400"}`}>{health ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 min-h-0 max-w-[1800px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Column 1: Tools (Ingest & Search) - Span 4 (Expanded) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
            
            {/* Ingest Card */}
            <div className="bg-[#0A0A0A]/80 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-xl hover:border-white/10 transition-colors duration-300 shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">📥</span> Ingest Data
                    </h2>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>
                
                <div className="space-y-4">
                    <textarea
                        className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 resize-none text-gray-300 custom-scrollbar"
                        placeholder="Type a note, idea, or fact..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <div className="relative group flex-1">
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
                                className="flex items-center justify-center gap-2 w-full h-full bg-black/40 border border-white/10 border-dashed rounded-2xl p-3 text-xs text-gray-400 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group-hover:text-gray-300"
                            >
                                <span className="text-lg">📄</span>
                                {file ? <span className="text-blue-400 font-medium truncate max-w-[80px]">{file.name}</span> : "Upload PDF"}
                            </label>
                        </div>
                        <button
                            onClick={handleIngest}
                            disabled={ingesting || (!note && !file)}
                            className="flex-1 bg-gradient-to-r from-white to-gray-200 text-black hover:to-white py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                            {ingesting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                    Saving...
                                </span>
                            ) : "Save Memory"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Card */}
            <div className="bg-[#0A0A0A]/80 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-xl hover:border-white/10 transition-colors duration-300 flex-1 flex flex-col min-h-[400px]">


                <div className="relative mb-6">
                    <input
                        type="text"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 outline-none transition-all placeholder:text-gray-700 text-white"
                        placeholder="Search your knowledge base..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔎</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {searching ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-600 gap-3">
                            <div className="w-6 h-6 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                            <span className="text-xs font-medium">Scanning Vector Space...</span>
                        </div>
                    ) : (
                        <>
                            {searchResults.map((res, i) => (
                                <div key={i} className="group bg-black/40 p-4 rounded-2xl border border-white/5 text-sm hover:border-green-500/30 hover:bg-green-500/5 transition-all cursor-pointer relative overflow-hidden" onClick={() => {
                                    setQaQuery(`Tell me about: ${res.text}`);
                                    setShowChat(true); 
                                }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="text-gray-300 line-clamp-2 mb-3 leading-relaxed relative z-10">{res.text}</p>
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-mono font-bold">
                                                {(res.distance * 100).toFixed(0)}% MATCH
                                            </span>
                                            <span className="text-[10px] text-gray-600 truncate max-w-[100px] flex items-center gap-1">
                                                <span>📄</span> {res.source}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => handleEdit(res.id, res.text, e)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-colors"
                                                title="Edit Memory"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={(e) => handleDelete(res.id, e)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
                                                title="Delete Memory"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {searchResults.length === 0 && searchQuery && !loading && (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3 opacity-20">📭</div>
                                    <p className="text-gray-600 text-xs">No memories found matching your query.</p>
                                </div>
                            )}
                            {!searchQuery && searchResults.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3 opacity-20">🧠</div>
                                    <p className="text-gray-600 text-xs">Search to recall memories.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Column 2: The Brain (Graph) - Span 8 (Expanded) */}
        <div className="lg:col-span-8 h-full bg-[#0A0A0A]/80 backdrop-blur-md rounded-3xl border border-white/5 relative overflow-hidden flex flex-col shadow-2xl">
             {/* Graph Grid Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
             
             <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                    <h2 className="text-lg font-bold text-white tracking-wide">Knowledge Graph</h2>
                </div>
                <div className="flex gap-4 text-[10px] font-mono text-gray-500 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                    <span>NODES: <span className="text-white">{graphData.nodes.length}</span></span>
                    <span className="w-px h-3 bg-white/10"></span>
                    <span>LINKS: <span className="text-white">{graphData.links.length}</span></span>
                </div>
             </div>
             
             <div className="flex-1 w-full h-full min-h-[400px]" ref={graphWrapperRef}>
                {graphDimensions.width > 0 && graphDimensions.height > 0 && (
                    <ForceGraph2D
                        width={graphDimensions.width}
                        height={graphDimensions.height}
                        graphData={graphData}
                        nodeLabel="name"
                        backgroundColor="rgba(0,0,0,0)"
                        nodeRelSize={6}
                        nodeColor={(node: any) => node.source === "user" ? "#ffffff" : stringToColor(node.source || "")}
                        linkColor={() => "rgba(255,255,255,0.1)"}
                        linkWidth={1}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={0.005}
                        linkDirectionalParticleWidth={2}
                        onNodeClick={(node: any) => {
                            setSearchQuery(node.fullText);
                            handleSearch();
                        }}
                    />
                )}
             </div>
        </div>

        {/* Floating Assistant Overlay */}
        <AnimatePresence>
            {showChat && (
                <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`${isExpanded ? "absolute inset-0 z-50 rounded-none border-x-0 border-y-0" : "fixed bottom-24 right-8 w-[400px] max-w-[90vw] h-[600px] max-h-[70vh] rounded-[2rem] z-[100] border border-white/10"} bg-[#0A0A0A]/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/5 transition-all duration-300 ease-in-out`}
                >
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                AI
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-white">Mesh Assistant</h2>
                                <p className="text-[10px] text-blue-300 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></span>
                                    {mode === "cloud" ? "Gemini 1.5 Flash" : "Ollama Local"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)} 
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                title={isExpanded ? "Collapse" : "Expand"}
                            >
                                {isExpanded ? "↙️" : "↗️"}
                            </button>
                            <button onClick={() => setShowChat(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">✕</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-black/20">
                        {chatHistory.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 opacity-50">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">👋</div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-400">Hello, Traveler.</p>
                                    <p className="text-xs mt-1">I'm ready to explore your memories.</p>
                                </div>
                            </div>
                        )}
                        {chatHistory.map((turn, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-end">
                                    <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm max-w-[85%] shadow-lg shadow-blue-900/20 leading-relaxed">
                                        {turn.user}
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-[#1A1A1A] text-gray-200 px-5 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[90%] leading-relaxed shadow-md border border-white/5">
                                        <div className="markdown-prose">
                                            {turn.ai}
                                        </div>
                                        {turn.sources && turn.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                                                {turn.sources.map((src, idx) => (
                                                    <span key={idx} className="text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                                                        <span>📄</span> {src}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[#1A1A1A] px-5 py-3 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-[#0A0A0A]">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full bg-black/50 border border-white/10 rounded-2xl pl-4 pr-12 py-4 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600 text-white shadow-inner"
                                placeholder="Ask a question..."
                                value={qaQuery}
                                onChange={(e) => setQaQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleQA()}
                            />
                            <button
                                onClick={handleQA}
                                disabled={loading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Chat Toggle Button */}
        {!showChat && (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowChat(true)}
                className="fixed bottom-24 right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center text-3xl z-40 transition-all border border-white/20"
            >
                💬
            </motion.button>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
