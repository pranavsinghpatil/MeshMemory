"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  // Check read-only mode directly from env (available at build/run time)
  const isReadOnly = process.env.NEXT_PUBLIC_READ_ONLY === "true";

  const menuItems = [
    { icon: "🏠", label: "Dashboard", href: "/" },
    { icon: "💬", label: "Chat", href: "/chat" },
    { icon: "🧠", label: "Memories", href: "/memories" },
    // Only show Settings in Local Mode (Write Access)
    ...(!isReadOnly ? [{ icon: "⚙️", label: "Settings", href: "/settings" }] : []),
    { icon: "❓", label: "How it Works", href: "/how-it-works" },
  ];

  return (
    <div className="w-20 h-screen bg-black/50 backdrop-blur-xl border-r border-white/5 flex flex-col items-center p-4 shrink-0 transition-all duration-300 z-50">
      <div className="flex items-center justify-center mb-8">
        <Link href="/">
            <img src="/favicon.ico" alt="Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform" />
        </Link>
      </div>

      <nav className="space-y-4 flex-1 w-full">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex justify-center w-full relative group">
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/5 shadow-inner"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-xl relative z-10 group-hover:scale-110 transition-transform">{item.icon}</span>
                
                {/* Active Dot */}
                {isActive && (
                    <div className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                {item.label}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-gray-900 border-l border-t border-white/10 rotate-45 transform"></div>
              </div>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
