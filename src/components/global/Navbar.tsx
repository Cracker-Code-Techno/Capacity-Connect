"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, Menu, X, BookOpen, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const getDashboardLink = () => {
    if (!(session?.user as any)?.role) return "/dashboard/trainee";
    switch ((session?.user as any).role.toLowerCase()) {
      case 'admin': return "/dashboard/admin";
      case 'trainer': return "/dashboard/trainer";
      default: return "/dashboard/trainee";
    }
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-[rgba(255,255,255,0.06)] bg-[#0b101c]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-[#a855f7]/10 p-2 rounded-lg border border-[#a855f7]/30 group-hover:bg-[#a855f7]/20 transition-colors shadow-[0_0_15px_rgba(168, 85, 247,0.15)]">
                <BookOpen className="h-5 w-5 text-[#a855f7]" />
              </div>
              <span className="self-center text-xl font-bold whitespace-nowrap text-[#e8ecf4] tracking-tight">
                CAPACITY CONNECT
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/courses" className="text-[#8b9ab8] dark:text-[#8b9ab8] hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md font-medium transition-colors">Courses</Link>
            <Link href="/about" className="text-[#8b9ab8] dark:text-[#8b9ab8] hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md font-medium transition-colors">About Us</Link>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-[#8b9ab8] hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            {status === "loading" ? (
              <div className="h-8 w-24 bg-[rgba(255,255,255,0.05)] animate-pulse rounded-md ml-2 border-l border-[rgba(255,255,255,0.06)] pl-4"></div>
            ) : session ? (
              <div className="flex items-center gap-4 ml-2 pl-4 border-l border-[rgba(255,255,255,0.06)]">
                <Link href={getDashboardLink()} className="flex items-center gap-2 text-sm font-medium text-[#e8ecf4] hover:text-[#a855f7] transition-colors">
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-[rgba(255,255,255,0.06)]">
                <Link href="/login" className="text-sm font-medium text-[#8b9ab8] hover:text-white transition-colors">Log in</Link>
                <Link href="/signup" className="text-white bg-[#a855f7]/20 border border-[#a855f7]/30 hover:bg-[#a855f7]/30 focus:ring-2 focus:outline-none focus:ring-[#a855f7]/50 font-medium rounded-lg text-sm px-4 py-2 text-center transition-all shadow-[0_0_15px_rgba(168, 85, 247,0.1)]">Sign up</Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-[#8b9ab8] hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#8b9ab8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#a855f7]"
            >
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#050810] border-b border-[rgba(255,255,255,0.06)] overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/courses" className="block px-3 py-2 rounded-md text-base font-medium text-[#8b9ab8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]">Courses</Link>
              <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-[#8b9ab8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]">About Us</Link>
              
              {session ? (
                <>
                  <Link href={getDashboardLink()} className="block px-3 py-2 rounded-md text-base font-medium text-[#e8ecf4] hover:text-[#a855f7] hover:bg-[rgba(255,255,255,0.05)]">Dashboard</Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-[#8b9ab8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]">Log in</Link>
                  <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-[#a855f7] hover:bg-[#a855f7]/10">Sign up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
