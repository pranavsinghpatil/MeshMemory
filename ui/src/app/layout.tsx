import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeshMemory",
  description: "Your Local-First, AI-Powered Second Brain.",
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-black text-gray-100 antialiased" suppressHydrationWarning>
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full overflow-hidden relative flex flex-col">
                {children}
            </main>
        </div>
      </body>
    </html>
  );
}