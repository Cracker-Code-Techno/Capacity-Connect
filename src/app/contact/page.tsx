import { Mail } from "lucide-react";
import Link from "next/link";

export default function ContactPlaceholder() {
  return (
    <div className="flex-grow flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "var(--background)" }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      
      <div className="glass-panel max-w-lg w-full text-center p-12 rounded-2xl relative z-10">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.1)]">
          <Mail className="w-8 h-8 text-[#a855f7]" />
        </div>
        <h1 className="text-3xl font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>Contact Us</h1>
        <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
          Our contact forms and support channels will be available soon.
        </p>
        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-widest rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#a855f7]/20 dark:hover:bg-[#a855f7]/30 border border-purple-600 dark:border-[#a855f7]/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}
