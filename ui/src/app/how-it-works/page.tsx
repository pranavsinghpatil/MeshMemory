"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function HowItWorks() {
  const steps = [
    {
      icon: "📄",
      title: "1. Ingestion & Chunking",
      desc: "When you upload a PDF, MeshMemory doesn't just 'read' it. It breaks it down into small, digestible 'chunks' (paragraphs). This ensures that no detail is lost and the AI can focus on specific facts.",
      tech: "PyPDF + Python String Manipulation"
    },
    {
      icon: "🔢",
      title: "2. Vector Embedding",
      desc: "Each chunk is passed through a local AI model (SentenceTransformers) which converts the text into a list of numbers (a Vector). This represents the 'meaning' of the text mathematically.",
      tech: "all-MiniLM-L6-v2 (Local Embedding Model)"
    },
    {
      icon: "💾",
      title: "3. Vector Storage",
      desc: "These vectors are stored in Weaviate, a high-performance Vector Database running in Docker. This allows us to search for 'concepts' rather than just keywords.",
      tech: "Weaviate (Docker Container)"
    },
    {
      icon: "🕸️",
      title: "4. Semantic Graph Construction",
      desc: "This is the magic. We calculate the similarity between every single memory. If two notes are semantically related (e.g., 'React' and 'Frontend'), we create a link. This builds a 'Mesh' of knowledge.",
      tech: "NumPy + Cosine Similarity"
    },
    {
      icon: "🧠",
      title: "5. Retrieval Augmented Generation (RAG)",
      desc: "When you ask a question, we first search the Vector DB for relevant chunks. We then feed those chunks + your chat history to Llama 3, which composes the final answer.",
      tech: "Ollama (Llama 3) + RAG Pipeline"
    }
  ];

  return (
    <div className="h-full bg-[#0a0a0a] text-gray-100 font-sans selection:bg-purple-500/30 overflow-y-auto custom-scrollbar">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
        >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
                Under the Hood
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                MeshMemory isn&apos;t just a database. It&apos;s a <span className="text-white font-semibold">Living Organism</span> of information. Here is how raw data becomes intelligence.
            </p>
        </motion.div>

        <div className="space-y-12 relative before:absolute before:left-8 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-blue-500/50 before:to-purple-500/50 before:hidden md:before:block">
            {steps.map((step, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`flex flex-col md:flex-row gap-8 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                >
                    {/* Icon Bubble */}
                    <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-3xl shadow-xl shadow-purple-900/10 z-10 relative shrink-0">
                        {step.icon}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl animate-pulse"/>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-neutral-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm hover:border-white/10 transition-colors w-full">
                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-gray-400 leading-relaxed mb-4">{step.desc}</p>
                        <div className="inline-block bg-white/5 px-3 py-1 rounded-full text-xs font-mono text-blue-400 border border-blue-500/20">
                            ⚙️ {step.tech}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Tech Stack Overview */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24"
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-3">Complete Tech Stack</h2>
                <p className="text-gray-400">Every technology powering MeshMemory</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                <TechCard icon="🗄️" name="Weaviate" desc="Vector Database" />
                <TechCard icon="🦙" name="Ollama" desc="Local LLM (Llama 3)" />
                <TechCard icon="✨" name="Gemini" desc="Cloud AI (Optional)" />
                <TechCard icon="⚡" name="FastAPI" desc="Python Backend" />
                <TechCard icon="⚛️" name="Next.js 14" desc="React Framework" />
                <TechCard icon="🎨" name="TailwindCSS" desc="Styling" />
                <TechCard icon="🕸️" name="Force Graph" desc="3D Visualization" />
                <TechCard icon="🔌" name="MCP" desc="Claude Integration" />
                <TechCard icon="🧮" name="NumPy" desc="Math Operations" />
                <TechCard icon="📊" name="SentenceTransformers" desc="Embeddings" />
                <TechCard icon="🐳" name="Docker" desc="Containerization" />
                <TechCard icon="🐍" name="Python 3.10+" desc="Backend Language" />
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-24 p-8 rounded-3xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 text-center"
        >
            <h2 className="text-2xl font-bold mb-4">🔌 Connect to Claude Desktop</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Want to use MeshMemory inside Claude? We support the <strong>Model Context Protocol (MCP)</strong>.
                Simply add our config to your Claude Desktop settings.
            </p>
            
            <div className="bg-black/50 p-4 rounded-xl text-left font-mono text-xs text-gray-300 overflow-x-auto mb-6 max-w-2xl mx-auto border border-white/10">
                <pre>{`{
  "mcpServers": {
    "MeshMemory": {
      "command": "d:\\\\MeshMemory\\\\.venv\\\\Scripts\\\\python.exe",
      "args": ["d:\\\\MeshMemory\\\\mesh-core\\\\backend\\\\mcp_server.py"]
    }
  }
}`}</pre>
            </div>

            <div className="flex gap-4 justify-center">
                <a 
                    href="/claude_mcp_config.json" 
                    download="claude_mcp_config.json"
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-white/10 flex items-center gap-2"
                >
                    📥 Download Config
                </a>
                <a 
                    href="https://github.com/pranavsinghpatil/MeshMemory#mcp-setup" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-xl shadow-white/10"
                >
                    📖 MCP Setup Guide
                </a>
            </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

function TechCard({ icon, name, desc }: { icon: string, name: string, desc: string }) {
    return (
        <div className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 group cursor-default">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
            <p className="text-xs text-gray-400">{desc}</p>
        </div>
    );
}
