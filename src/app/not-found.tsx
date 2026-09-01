import Link from "next/link";
import { Compass, Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#a855f7]/10 blur-[130px] pointer-events-none" />

      <div className="max-w-lg w-full glass-panel p-8 sm:p-12 rounded-3xl border border-[#a855f7]/20 text-center relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.12)]">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <p className="text-xs font-mono font-bold tracking-widest text-[#a855f7] mb-2 uppercase">
          404 &bull; Page Not Found
        </p>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight text-gray-900 dark:text-[#e8ecf4]">
          Lost in Capacity?
        </h1>
        
        <p className="text-sm text-gray-600 dark:text-[#8b9ab8] mb-8 max-w-sm mx-auto">
          The page or learning resource you are looking for has been moved, renamed, or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-wider text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <Home className="w-4 h-4" /> RETURN HOME
          </Link>
          
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-[rgba(255,255,255,0.1)] text-gray-800 dark:text-[#e8ecf4] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#a855f7]" /> Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
