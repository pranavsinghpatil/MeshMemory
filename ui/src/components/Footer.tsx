export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl py-4 mt-auto relative z-20 w-full">
        <div className="max-w-[1800px] mx-auto px-6 flex flex-col md:flex-row justify-center items-center text-[11px] text-gray-500 gap-6">
            <div className="flex items-center gap-6">
                <span className="font-medium text-gray-400">© 2024 MeshMemory</span>
                <div className="h-3 w-px bg-white/10"></div>
                <a href="https://github.com/pranavsinghpatil/MeshMemory" target="_blank" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <span>GitHub</span>
                    <span className="text-[9px]">↗</span>
                </a>
                <a href="https://twitter.com/pranavenv" target="_blank" className="hover:text-white transition-colors">Twitter</a>
                <a href="https://linkedin.com/in/pranavsinghpatil" target="_blank" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
            <div className="flex items-center gap-2">
                <span>Crafted with</span>
                <span className="text-red-500 animate-pulse">❤️</span>
                <span>by </span>
                <a href="https://prnav.me/" target="_blank" className="hover:text-white transition-colors">Pranav</a>
            </div>
        </div>
    </footer>
  );
}
