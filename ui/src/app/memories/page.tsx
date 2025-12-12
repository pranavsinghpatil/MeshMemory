"use client";

import { useState, useEffect } from "react";
import { searchNotes, deleteNote, updateNote } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  id: string;
  text: string;
  source: string;
  date?: string;
  title?: string;
}

export default function MemoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    handleSearch("");
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
        // If empty, we might want a "list all" endpoint, but search with empty string might work or return nothing.
        // For now, let's assume search("") returns recent or random.
        // If backend doesn't support empty search, we might need to add a 'list' endpoint.
        // Let's try searching for " " or "*" if empty.
        const q = query || " "; 
        const res = await searchNotes(q);
        setSearchResults(res.results || []);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this memory?")) return;
    
    await deleteNote(uuid);
    setToast("Memory Deleted");
    handleSearch(searchQuery);
  };

  const handleEdit = async (uuid: string, currentText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newText = prompt("Edit Memory:", currentText);
    if (newText === null || newText === currentText) return;

    await updateNote(uuid, newText);
    setToast("Memory Updated");
    handleSearch(searchQuery);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] p-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50"
            >
                ✅ {toast}
            </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Memories</h1>
            <p className="text-gray-500">Manage and explore your knowledge base.</p>
        </div>
        <div className="text-right">
            <span className="text-2xl font-bold text-white">{searchResults.length}</span>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Items Found</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-base focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600 text-white"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
            }}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">🔎</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10 custom-scrollbar">
        {loading && searchResults.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-600">
                Loading...
            </div>
        ) : (
            searchResults.map((res, i) => (
                <motion.div 
                    key={res.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex flex-col relative overflow-hidden"
                >
                    <div className="flex-1 mb-4">
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-6">{res.text}</p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-md truncate max-w-[120px]">
                            {res.source}
                        </span>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => handleEdit(res.id, res.text, e)}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-colors"
                            >
                                ✏️
                            </button>
                            <button 
                                onClick={(e) => handleDelete(res.id, e)}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))
        )}
        
        {!loading && searchResults.length === 0 && (
            <div className="col-span-full text-center py-20">
                <div className="text-4xl mb-4 opacity-20">📭</div>
                <p className="text-gray-500">No memories found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
