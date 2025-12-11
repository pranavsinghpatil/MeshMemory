"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const menuItems = [
  { icon: "🏠", label: "Dashboard", href: "/" },
  { icon: "💬", label: "Chat", href: "/chat" },
  { icon: "🧠", label: "Memories", href: "/memories" },
  { icon: "⚙️", label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-20 lg:w-64 h-screen bg-black/50 backdrop-blur-xl border-r border-white/5 flex flex-col p-4 shrink-0 transition-all duration-300">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">
          M
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight hidden lg:block">MeshMemory</h1>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/5 shadow-inner"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-xl relative z-10 group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-sm font-medium relative z-10 hidden lg:block">{item.label}</span>
                
                {isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] hidden lg:block"></div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 hidden lg:block">
         <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">System</span>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-gray-500">Online</span>
            </div>
         </div>
      </div>
    </div>
  );
}
