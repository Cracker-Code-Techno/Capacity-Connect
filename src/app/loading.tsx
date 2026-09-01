export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="w-16 h-16 rounded-full border-2 border-[#a855f7]/30 border-t-[#a855f7] animate-spin" />
        
        {/* Inner pulsing orb */}
        <div className="absolute w-8 h-8 rounded-full bg-[#a855f7]/20 animate-pulse" />
      </div>
      
      <p className="mt-6 text-xs font-mono font-bold tracking-widest text-[#a855f7] uppercase animate-pulse">
        Loading Capacity Connect...
      </p>
    </div>
  );
}
