"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-2xl border border-red-500/20 text-center relative z-10 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-[#e8ecf4]">
          Something went wrong
        </h1>
        
        <p className="text-sm text-gray-600 dark:text-[#8b9ab8] mb-6">
          An unexpected error occurred while processing your request. Please try again or return home.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-gray-500 dark:text-[#556580] mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-[rgba(255,255,255,0.1)] text-gray-800 dark:text-[#e8ecf4] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
