import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#050810] border-t border-[rgba(255,255,255,0.06)] mt-auto relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="bg-[#a855f7]/10 p-1.5 rounded-lg border border-[#a855f7]/30 shadow-[0_0_10px_rgba(168, 85, 247,0.1)]">
                <BookOpen className="h-4 w-4 text-[#a855f7]" />
              </div>
              <span className="self-center text-lg font-bold whitespace-nowrap text-[#e8ecf4] tracking-tight">
                CAPACITY CONNECT
              </span>
            </Link>
            <p className="text-sm text-[#8b9ab8] max-w-sm">
              A premier Digital Capacity Building and Learning Management Portal designed to support organizational training and competency development.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#e8ecf4] tracking-[0.1em] uppercase mb-4 text-mono">Quick Links</h3>
            <ul className="space-y-3 text-sm text-[#8b9ab8]">
              <li><Link href="/courses" className="hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Portal Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#e8ecf4] tracking-[0.1em] uppercase mb-4 text-mono">Support</h3>
            <ul className="space-y-3 text-sm text-[#8b9ab8]">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#556580] text-mono">
            &copy; {new Date().getFullYear()} CAPACITY CONNECT. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
