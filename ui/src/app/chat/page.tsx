"use client";

import { useState, useEffect, useRef } from "react";
import { askBrain } from "@/lib/api";

export default function ChatPage() {
  const [qaQuery, setQaQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{user: string, ai: string, sources?: string[]}[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("local");
  const [apiKey, setApiKey] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isReadOnly = process.env.NEXT_PUBLIC_READ_ONLY === "true";

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    const savedMode = localStorage.getItem("brain_mode");
    if (savedKey) setApiKey(savedKey);
    if (savedMode) setMode(savedMode);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleQA = async () => {
    if (!qaQuery.trim()) return;
    setLoading(true);
    
    const currentQuery = qaQuery;
    setQaQuery(""); 
    
    // Optimistic update
    setChatHistory(prev => [...prev, { user: currentQuery, ai: "Thinking...", sources: [] }]);
    
    try {
        const res = await askBrain(currentQuery, chatHistory, mode, apiKey);
        
        setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { user: currentQuery, ai: res.answer, sources: res.sources };
            return newHistory;
        });
    } catch {
        setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { user: currentQuery, ai: "Error: Could not reach the brain.", sources: [] };
            return newHistory;
        });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                💬 Neural Chat
            </h1>
            {!isReadOnly && (
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${mode === "cloud" ? "bg-purple-500" : "bg-blue-500"}`}></span>
                    Using {mode === "cloud" ? "Gemini 1.5 Flash" : "Ollama Local"}
                </p>
            )}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar" ref={scrollRef}>
        {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-6 opacity-40">
                <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-5xl">🧠</div>
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-400">MeshMemory is ready.</p>
                    <p className="text-sm mt-2">Ask anything about your stored knowledge.</p>
                </div>
            </div>
        )}
        
        {chatHistory.map((turn, i) => (
            <div key={i} className="space-y-6 max-w-4xl mx-auto">
                {/* User Message */}
                <div className="flex justify-end">
                    <div className="bg-blue-600 text-white px-6 py-4 rounded-3xl rounded-tr-sm text-base max-w-[80%] shadow-lg shadow-blue-900/20 leading-relaxed">
                        {turn.user}
                    </div>
                </div>
                
                {/* AI Message */}
                <div className="flex justify-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-lg mt-2">
                        AI
                    </div>
                    <div className="bg-[#1A1A1A] text-gray-200 px-8 py-6 rounded-3xl rounded-tl-sm text-base max-w-[90%] leading-relaxed shadow-md border border-white/5">
                        <div className="markdown-prose whitespace-pre-wrap">
                            {turn.ai}
                        </div>
                        {turn.sources && turn.sources.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-white/5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sources</p>
                                <div className="flex flex-wrap gap-2">
                                    {turn.sources.map((src, idx) => (
                                        <span key={idx} className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-500/20 transition-colors cursor-default">
                                            <span>📄</span> {src}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ))}
        
        {loading && chatHistory.length === 0 && (
             <div className="flex justify-center py-10">
                <div className="flex items-center gap-2 text-gray-500">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
             </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[#0A0A0A] border-t border-white/5">
        <div className="max-w-4xl mx-auto relative">
            <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-16 py-5 text-base focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600 text-white shadow-inner"
                placeholder="Ask your second brain..."
                value={qaQuery}
                onChange={(e) => setQaQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQA()}
                autoFocus
            />
            <button
                onClick={handleQA}
                disabled={loading || !qaQuery.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
                ➤
            </button>
        </div>
        <div className="max-w-4xl mx-auto mt-3 text-center">
            <p className="text-[10px] text-gray-600">
                AI can make mistakes. Verify important information.
            </p>
        </div>
      </div>
    </div>
  );
}
