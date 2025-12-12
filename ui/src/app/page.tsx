"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { checkHealth, ingestNote, getGraphData, ingestURL, ingestYouTube, ingestFile } from "@/lib/api";
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
  const [ingesting, setIngesting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("note"); // note, file, web, youtube
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 0, height: 0 });
  const graphWrapperRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    checkHealth().then(setHealth);
    refreshGraph();
    
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);

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
        requestAnimationFrame(updateDimensions);
    });

    if (graphWrapperRef.current) {
        observer.observe(graphWrapperRef.current);
    }
    
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
    try {
        const data = await getGraphData();
        setGraphData(data);
    } catch (e) {
        console.error("Error refreshing graph:", e);
    }
  };

  const handleIngest = async () => {
    setIngesting(true);
    try {
      if (activeTab === "file" && file) {
        await ingestFile(file, apiKey);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setToast("File Ingested Successfully!");
      } else if (activeTab === "note" && note) {
        await ingestNote(note);
        setNote("");
        setToast("Memory Stored Successfully!");
      } else if (activeTab === "web" && urlInput) {
        await ingestURL(urlInput);
        setUrlInput("");
        setToast("Web Page Ingested Successfully!");
      } else if (activeTab === "youtube" && urlInput) {
        await ingestYouTube(urlInput);
        setUrlInput("");
        setToast("YouTube Video Ingested Successfully!");
      }
      await refreshGraph(); 
    } catch (e) {
      alert("Error ingesting: " + e);
    }
    setIngesting(false);
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
    <div className="flex flex-col h-full bg-[#050505] p-6 gap-6">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-500">Overview of your knowledge base.</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 relative z-10">
        
        {/* Left Column: Ingest (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-1 shadow-2xl flex-1 flex flex-col overflow-hidden group hover:border-white/20 transition-colors">
                <div className="bg-black/40 p-6 flex-1 flex flex-col rounded-[20px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">⚡</span> 
                            Neural Input
                        </h2>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 p-1 bg-black/60 rounded-xl border border-white/5">
                        {["note", "file", "web", "youtube"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all relative overflow-hidden ${activeTab === tab ? "text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                            >
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="ingest-tab"
                                        className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{tab}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-4 relative">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 flex flex-col"
                            >
                                {activeTab === "note" && (
                                    <textarea
                                        className="flex-1 w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 resize-none text-gray-300 custom-scrollbar font-mono leading-relaxed"
                                        placeholder="// Enter your thoughts, ideas, or raw data..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                )}

                                {activeTab === "file" && (
                                    <div className="flex-1 relative group">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden" 
                                            id="file-upload"
                                        />
                                        <label 
                                            htmlFor="file-upload"
                                            className="flex flex-col items-center justify-center gap-4 w-full h-full bg-black/40 border border-white/10 border-dashed rounded-2xl p-6 text-xs text-gray-400 cursor-pointer hover:bg-white/5 hover:border-blue-500/30 transition-all group-hover:text-gray-300"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                                                📁
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-sm mb-1 text-gray-300">{file ? file.name : "Drop File Here"}</p>
                                                <p className="text-gray-600 text-[10px] uppercase tracking-wide">PDF • Audio • Video • Image</p>
                                            </div>
                                        </label>
                                    </div>
                                )}

                                {(activeTab === "web" || activeTab === "youtube") && (
                                    <div className="flex-1 flex flex-col justify-center gap-6">
                                        <div className="text-center opacity-30">
                                            <span className="text-6xl filter blur-sm">{activeTab === "web" ? "🌐" : "📺"}</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 text-white font-mono"
                                                placeholder={activeTab === "web" ? "https://example.com/article" : "https://youtube.com/watch?v=..."}
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔗</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <button
                            onClick={handleIngest}
                            disabled={ingesting || (activeTab === "note" && !note) || (activeTab === "file" && !file) || ((activeTab === "web" || activeTab === "youtube") && !urlInput)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] mt-auto flex items-center justify-center gap-2 group"
                        >
                            {ingesting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Ingest Memory</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Graph (Span 8) */}
        <div className="lg:col-span-8 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 relative overflow-hidden flex flex-col shadow-2xl group hover:border-white/20 transition-colors">
             {/* Grid Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
             <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 via-transparent to-transparent pointer-events-none"></div>
             
             <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
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
                        linkColor={() => "rgba(255,255,255,0.15)"}
                        linkWidth={1.5}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={0.005}
                        linkDirectionalParticleWidth={2}
                        d3VelocityDecay={0.3}
                    />
                )}
             </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
