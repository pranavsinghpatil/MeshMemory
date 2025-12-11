"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [mode, setMode] = useState("local");
  const [apiKey, setApiKey] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    const savedMode = localStorage.getItem("brain_mode");
    if (savedKey) setApiKey(savedKey);
    if (savedMode) setMode(savedMode);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const saveSettings = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    localStorage.setItem("brain_mode", mode);
    setToast("Settings Saved Successfully!");
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] p-8 max-w-3xl mx-auto w-full">
      {/* Toast */}
      {toast && (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50"
        >
            ✅ {toast}
        </motion.div>
      )}

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-500">Configure your MeshMemory brain.</p>
      </header>

      <div className="space-y-8">
        {/* Inference Engine */}
        <div className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                🧠 Inference Engine
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={() => setMode("local")}
                    className={`p-6 rounded-2xl text-left transition-all border ${mode === "local" ? "bg-blue-600/10 border-blue-500 text-blue-400" : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"}`}
                >
                    <div className="text-2xl mb-3">🏠</div>
                    <div className="font-bold mb-1">Local (Ollama)</div>
                    <div className="text-xs opacity-70">Runs entirely on your machine. Private and free. Requires Ollama.</div>
                </button>
                
                <button 
                    onClick={() => setMode("cloud")}
                    className={`p-6 rounded-2xl text-left transition-all border ${mode === "cloud" ? "bg-purple-600/10 border-purple-500 text-purple-400" : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"}`}
                >
                    <div className="text-2xl mb-3">☁️</div>
                    <div className="font-bold mb-1">Cloud (Gemini)</div>
                    <div className="text-xs opacity-70">Uses Google's Gemini 1.5 Flash. Faster and multimodal. Requires API Key.</div>
                </button>
            </div>
        </div>

        {/* API Keys */}
        {mode === "cloud" && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }}
                className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/5"
            >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    🔑 API Configuration
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gemini API Key</label>
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all text-white"
                            placeholder="AIzaSy..."
                        />
                        <p className="text-xs text-gray-600 mt-2">
                            Your key is stored locally in your browser. We never see it.
                        </p>
                    </div>
                </div>
            </motion.div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-6">
            <button 
                onClick={saveSettings}
                className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
}
