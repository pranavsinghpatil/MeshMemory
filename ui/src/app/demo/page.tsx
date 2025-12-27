"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";
import { FaRocket, FaDatabase, FaBrain, FaFileAlt, FaNetworkWired, FaRobot, FaCube } from "react-icons/fa";
import { SiPython, SiNumpy, SiFastapi, SiReact, SiTailwindcss } from "react-icons/si";
import { TbBrandOpenai, TbPlugConnected, TbTextSize } from "react-icons/tb";
import { BiMath } from "react-icons/bi";
import { MdSearch, MdCloud } from "react-icons/md";

export default function DemoPage() {
  return (
    <div className="h-full bg-[#0a0a0a] text-gray-100 font-sans selection:bg-purple-500/30 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-16">
        
        {/* Hero Section */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
        >
            <div className="flex flex-col md:flex-row items-center md:items-center justify-center gap-3 md:gap-3 max-w-5xl mx-auto">
                {/* Left: Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 whitespace-nowrap">
                    MeshMemory
                </h1>
                
                {/* Right: Both Captions Stacked */}
                <div className="flex flex-col gap-1.5">
                    {/* Caption 1 - Single Line */}
                    <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] md:text-[10px] font-medium animate-pulse whitespace-nowrap">
                        🚀 Live Vector Database System for LLMs and Data assistance
                    </div>
                    
                    {/* Caption 2 - Single Line */}
                    <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] md:text-[10px] font-medium whitespace-nowrap">
                        Watch how it connects, retrieves, and amplifies knowledge
                    </div>
                </div>
            </div>
        </motion.div>

        {/* 🎥 Video Showcase Section - MOVED TO TOP */}
        <motion.div
            id="video"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 mt-8"
        >
            

            <div className="aspect-video w-full bg-black/50 rounded-3xl border border-white/10 relative overflow-hidden group shadow-2xl">
                {/* TODO: Replace with your actual YouTube video ID */}
                {/* Once you have the video, uncomment this: */}
                {/* <iframe 
                    src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=0&rel=0" 
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="MeshMemory Demo Video"
                ></iframe> */}
                
                {/* Placeholder until video is ready */}
                <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                    <div>
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md group-hover:scale-110 transition-transform cursor-pointer">
                            <span className="text-5xl ml-1">▶️</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Full Walkthrough Video</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            See how I ingest documents, visualize connections, and chat with my second brain in real-time.
                        </p>
                        <div className="inline-block bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg text-sm">
                            🎬 Video Coming Soon
                        </div>
                    </div>
                </div>
                
                {/* Decorative BG */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
            </div>
            
            
        </motion.div>
        
        {/* Live Sandbox Notice */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-8 mb-20 relative overflow-hidden"
        >
            <div className="flex items-start gap-6 relative z-10">
                <div className="text-4xl text-white"><MdSearch /></div>
                <div>
                    {/* <h2 className="text-2xl font-bold text-white mb-2">Explore What's Available</h2> */}
                    <p className="text-gray-300 leading-relaxed mb-4">
                        You're viewing a <strong>live production system</strong> of my personal AI second brain. 
                        While the main dashboard and graph are restricted to preserve my personal knowledge base, you have full access to several interactive features. 
                        <span className="block mt-2 text-blue-300">💡 Feel free to explore the available pages and see how the system works in action!</span>
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">✓ AI Chat Interface</span>
                        <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">✓ Memories Browser</span>
                        <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">✓ Technical Deep Dive</span>
                    </div>
                </div>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 mb-16"
        >
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-3">Built with Modern AI Stack</h2>
                <p className="text-gray-400">Powerful, open-source technologies working together</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <TechCard icon={<FaDatabase />} name="Weaviate" desc="Vector Database" color="from-green-500/10 to-emerald-500/10" border="border-green-500/20" />
                <TechCard icon={<FaRobot />} name="Ollama" desc="Local LLM" color="from-purple-500/10 to-pink-500/10" border="border-purple-500/20" />
                <TechCard icon={<MdCloud />} name="Gemini" desc="Cloud AI" color="from-blue-500/10 to-cyan-500/10" border="border-blue-500/20" />
                <TechCard icon={<SiFastapi />} name="FastAPI" desc="Backend" color="from-teal-500/10 to-green-500/10" border="border-teal-500/20" />
                <TechCard icon={<TbTextSize />} name="Sentence-Transformers" desc="Embeddings" color="from-indigo-500/10 to-purple-500/10" border="border-indigo-500/20" />
                <TechCard icon={<SiTailwindcss />} name="Tailwind CSS" desc="Modern Styling" color="from-sky-500/10 to-blue-500/10" border="border-sky-500/20" />
                <TechCard icon={<FaNetworkWired />} name="Force Graph" desc="3D Visualization" color="from-orange-500/10 to-red-500/10" border="border-orange-500/20" />
                <TechCard icon={<TbPlugConnected />} name="MCP" desc="Claude Integration" color="from-yellow-500/10 to-orange-500/10" border="border-yellow-500/20" />
            </div>
        </motion.div>


        {/* Personal Attribution */}
        <div className="text-center mb-16">
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                The Personal AI Second Brain of <span className="text-white font-semibold">@pranavsinghpatil</span>
            </p>
        </div>

        {/* Walkthrough Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <FeatureCard 
                icon={<FaBrain />}
                title="AI-Powered Intelligence"
                desc="Powered by Weaviate vector database and Ollama/Gemini LLMs. Chat with your knowledge base using natural language and get answers grounded in your actual notes and documents. Works locally or in the cloud."
                delay={0.3}
            />
            <FeatureCard 
                icon={<FaFileAlt />}
                title="Multi-Modal Ingestion"
                desc="Ingest text notes, PDFs, YouTube videos, and web pages. The AI automatically chunks content, generates embeddings, and creates semantic connections across all your information sources."
                delay={0.4}
            />
            <FeatureCard 
                icon={<FaNetworkWired />}
                title="Knowledge Graph & MCP"
                desc="Visualize connections between ideas with an interactive 3D graph. Integrates with Claude Desktop via Model Context Protocol (MCP), letting Claude access your entire personal knowledge base."
                delay={0.5}
            />
        </div>


        <Footer />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-[#111] p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group"
        >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 text-white">{icon}</div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function TechCard({ icon, name, desc, color, border }: { icon: React.ReactNode, name: string, desc: string, color: string, border: string }) {
    return (
        <div className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-default`}>
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-white">{icon}</div>
            <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
            <p className="text-xs text-gray-400">{desc}</p>
        </div>
    );
}
