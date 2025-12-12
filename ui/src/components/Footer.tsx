"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="py-1 mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        
        {/* Left: Branding & Links */}
        <div className="flex items-center gap-6">
            {/* <span className="font-bold text-gray-400 flex items-center gap-2">
                🧠 MeshMemory <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 rounded-full">BETA</span>
            </span> */}
            <div className="flex gap-4">
                <a href="https://github.com/pranavsinghpatil/MeshMemory" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors flex items-center gap-1 ">
                    ⭐ Star on GitHub
                </a>
                <a href="https://x.com/pranavsinghpatil" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors flex items-center gap-1">
                     Follow on X
                </a>
                {/* <a href="https://github.com/pranavsinghpatil/MeshMemory" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors flex items-center gap-1">
                    🍴 Fork Repo
                </a> */}
            </div>
        </div>

        {/* Right: Credits */}
        <div className="text-gray-500">
            Created by <a href="https://prnav.me" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors font-medium">PranavSingh</a>
        </div>

      </div>
    </footer>
  );
}
