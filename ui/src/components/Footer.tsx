"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="py-8 mt-12 border-t border-white/5 mx-auto max-w-4xl px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
            <h3 className="font-bold text-white text-lg flex items-center gap-2 justify-center md:justify-start">
                🧠 MeshMemory
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">BETA</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
                A Second Brain for Developers.
            </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
            <div className="text-xs text-gray-400">
                Created by <strong className="text-white hover:text-blue-400 transition-colors cursor-pointer">@pranavsinghpatil</strong>
            </div>
            
            <div className="flex gap-4">
                <a 
                    href="https://github.com/pranavsinghpatil/MeshMemory" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10"
                >
                    ⭐ Star on GitHub
                </a>
                <a 
                    href="https://x.com/pranavsinghpatil" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10"
                >
                    🐦 Follow on X
                </a>
            </div>
            
            <p className="text-[10px] text-gray-600 mt-1">
                Want to build your own? <a href="https://github.com/pranavsinghpatil/MeshMemory" className="underline hover:text-gray-400">Fork the repo</a>.
            </p>
        </div>
      </div>
    </footer>
  );
}
