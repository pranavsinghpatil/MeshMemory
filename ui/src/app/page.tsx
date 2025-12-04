"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { checkHealth, ingestNote, ingestPDF, searchNotes, askBrain, getGraphData } from "@/lib/api";

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
          width: graphWrapperRef.current.offsetWidth,
          height: graphWrapperRef.current.offsetHeight
        });
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions(); // Initial size
    
    // Delay slightly to ensure layout is done
    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener('resize', updateDimensions);
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

  const handleQA = async () => {
    if (!qaQuery.trim()) return;
    setLoading(true);
    
    const currentQuery = qaQuery;
    setQaQuery(""); 
    
    const res = await askBrain(currentQuery, chatHistory);
    
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

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-blue-500/30 flex flex-col">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Navbar */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black">
                M
                </div>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">MeshMemory</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <nav className="hidden md:flex gap-6 text-sm font-medium">
                <Link href="/" className="text-white">Control Center</Link>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</Link>
             </nav>
             <div className={`px-3 py-1 rounded-full text-xs font-medium border ${health ? "bg-green-900/20 border-green-500/20 text-green-400" : "bg-red-900/20 border-red-500/20 text-red-400"}`}>
                {health ? "● ONLINE" : "● OFFLINE"}
             </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-[1800px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Tools (Ingest & Search) - Span 3 */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            
            {/* Ingest Card */}
            <div className="bg-neutral-900/30 rounded-2xl border border-white/5 p-5">
                <h2 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">Ingest</h2>
                <div className="space-y-4">
                    <textarea
                        className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-700 resize-none"
                        placeholder="Quick note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="flex flex-col gap-2">
                        <div className="relative">
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
                                className="flex items-center justify-center gap-2 w-full bg-black/50 border border-white/10 border-dashed rounded-xl p-3 text-xs text-gray-400 cursor-pointer hover:bg-white/5 transition-all"
                            >
                                {file ? <span className="text-blue-400 truncate">{file.name}</span> : "📄 Upload PDF"}
                            </label>
                        </div>
                        <button
                            onClick={handleIngest}
                            disabled={ingesting || (!note && !file)}
                            className="bg-white text-black hover:bg-gray-200 w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {ingesting ? "Processing..." : "Save Memory"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Card */}
            <div className="bg-neutral-900/30 rounded-2xl border border-white/5 p-5 flex-1 flex flex-col">
                <h2 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">Recall</h2>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                    {searching ? (
                        <div className="text-center py-8 text-gray-600 text-xs">Searching...</div>
                    ) : (
                        <>
                            {searchResults.map((res, i) => (
                                <div key={i} className="bg-black/40 p-3 rounded-lg border border-white/5 text-xs hover:border-white/20 transition-colors cursor-pointer" onClick={() => {
                                    setQaQuery(`Tell me about: ${res.text}`);
                                }}>
                                    <p className="text-gray-300 line-clamp-3 mb-2">{res.text}</p>
                                    <div className="flex justify-between text-gray-600">
                                        <span>{(res.distance * 100).toFixed(0)}%</span>
                                        <span className="truncate max-w-[100px]">{res.source}</span>
                                    </div>
                                </div>
                            ))}
                            {searchResults.length === 0 && searchQuery && !loading && (
                                <p className="text-center text-gray-600 py-4 text-xs">No results.</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Column 2: The Brain (Graph) - Span 6 */}
        <div className="lg:col-span-6 h-[calc(100vh-120px)] bg-neutral-900/20 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col">
             <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h2 className="text-xl font-bold text-white mb-1">Knowledge Graph</h2>
                <p className="text-sm text-gray-500">{graphData.nodes.length} Nodes • {graphData.links.length} Connections</p>
             </div>
             
             <div className="flex-1 w-full h-full" ref={graphWrapperRef}>
                {graphDimensions.width > 0 && (
                    <ForceGraph2D
                        width={graphDimensions.width}
                        height={graphDimensions.height}
                        graphData={graphData}
                        nodeLabel="name"
                        backgroundColor="#000000"
                        nodeRelSize={8}
                        nodeColor={(node: any) => node.source === "user" ? "#ffffff" : stringToColor(node.source || "")}
                        linkColor={() => "#555555"}
                        linkWidth={1}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={0.005}
                        linkDirectionalParticleWidth={2}
                        onNodeClick={(node: any) => {
                            setSearchQuery(node.fullText);
                            handleSearch();
                        }}
                        // Physics Tuning
                        d3Force={(d3: any) => {
                            d3.force('charge').strength(-400); // More repulsion
                            d3.force('link').distance(100);   // Longer links
                        }}
                    />
                )}
             </div>
        </div>

        {/* Column 3: Chat - Span 3 */}
        <div className="lg:col-span-3 h-[calc(100vh-120px)] bg-neutral-900/30 rounded-2xl border border-white/5 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Assistant</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence>
                    {chatHistory.map((turn, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <div className="flex justify-end">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[90%]">
                                    {turn.user}
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-neutral-800 text-gray-200 px-4 py-2 rounded-2xl rounded-tl-sm text-sm max-w-[90%] leading-relaxed">
                                    {turn.ai}
                                    {turn.sources && turn.sources.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                                            {turn.sources.map((src, idx) => (
                                                <span key={idx} className="text-[10px] text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded">
                                                    {src}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-neutral-800 text-gray-500 px-4 py-2 rounded-2xl rounded-tl-sm text-sm">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Ask..."
                        value={qaQuery}
                        onChange={(e) => setQaQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleQA()}
                    />
                    <button
                        onClick={handleQA}
                        disabled={loading}
                        className="bg-white text-black hover:bg-gray-200 px-4 rounded-xl font-medium text-sm transition-all"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
