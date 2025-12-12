"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function DemoPage() {
  return (
    <div className="h-full bg-[#0a0a0a] text-gray-100 font-sans selection:bg-purple-500/30 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto px-6 py-16">
        
        {/* Hero Section */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
        >
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                🚀 Live Showcase
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 mb-6 pb-2">
                MeshMemory
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                The Personal AI Second Brain of <span className="text-white font-semibold">@pranavsinghpatil</span>.
            </p>
        </motion.div>

        {/* Status Card */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-8 mb-16 relative overflow-hidden"
        >
            <div className="flex items-start gap-6 relative z-10">
                <div className="text-4xl">🔒</div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Read-Only Access</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        You are viewing a <strong>Live Deployment</strong> of my personal knowledge base. 
                        To prevent data loss and maintain integrity, <strong>Ingestion, Editing, and Deletion are disabled</strong> for visitors.
                    </p>
                    <p className="text-sm text-gray-500 italic">
                        * I use this system daily for my projects, research, and coding snippets.
                    </p>
                </div>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        </motion.div>

        {/* Walkthrough Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <FeatureCard 
                icon="🕸️"
                title="Knowledge Graph"
                desc="Visualize connections between seemingly unrelated ideas. Toggle the 'Physics' engine to see the brain adapt."
                delay={0.3}
            />
            <FeatureCard 
                icon="💬"
                title="Neural Chat"
                desc="Ask questions like 'What project did I work on last week?' and get answers grounded in my actual notes."
                delay={0.4}
            />
            <FeatureCard 
                icon="📥"
                title="Multi-Modal Ingest"
                desc="I can save Text, PDFs, YouTube Videos, and Websites. The AI automatically chunks and links them."
                delay={0.5}
            />
            <FeatureCard 
                icon="🧠"
                title="Local-First AI"
                desc="Powered by Weaviate and Ollama. It runs 100% locally on my machine, but syncs here for the showcase."
                delay={0.6}
            />
            <FeatureCard 
                icon="🔌"
                title="Model Context Protocol (MCP)"
                desc="Works with Anthropic's Claude Desktop! (Local Mode Only) Connect it to let Claude browse your personal brain."
                delay={0.7}
            />
        </div>

        {/* CTA */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center bg-white/5 border border-white/10 rounded-3xl p-12"
        >
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Feel free to look around the Dashboard, try the Search, and play with the Graph.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link href="/">
                    <button 
                        onClick={() => localStorage.setItem("mesh_visited", "true")}
                        className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10 w-full md:w-auto"
                    >
                        Enter Dashboard
                    </button>
                </Link>
                <a href="https://github.com/pranavsinghpatil/MeshMemory" target="_blank" rel="noopener noreferrer">
                    <button className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/10 w-full md:w-auto">
                        Get the Code (GitHub)
                    </button>
                </a>
            </div>
        </motion.div>

        <Footer />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: string, title: string, desc: string, delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-[#111] p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group"
        >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}
