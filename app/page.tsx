'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Scanline effect background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)',
      }}></div>

      {/* Grid background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, 0.1) 25%, rgba(0, 255, 65, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.1) 75%, rgba(0, 255, 65, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, 0.1) 25%, rgba(0, 255, 65, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.1) 75%, rgba(0, 255, 65, 0.1) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px',
      }}></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Top decorative line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff41] to-transparent"></div>

        <div className="max-w-2xl w-full text-center space-y-12">
          {/* Logo / Title */}
          <div className="space-y-6">
            <div className="text-6xl font-mono font-black text-[#00ff41] drop-shadow-lg" style={{
              textShadow: '0 0 20px rgba(0, 255, 65, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
            }}>
              {'> CARDTRACK'}
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#ff006e] to-transparent"></div>
            <p className="text-xs md:text-sm text-gray-400 font-mono tracking-widest uppercase">
              Neural Card Economy Interface v2.0
            </p>
          </div>

          {/* Description */}
          <div className="space-y-4 border border-[#00ff41] border-opacity-20 p-6 bg-black bg-opacity-50 backdrop-blur">
            <p className="text-sm md:text-base text-gray-300 font-mono leading-relaxed">
              <span className="text-[#00ff41]">{'$'}</span> Track your card buys & sells in real-time
            </p>
            <p className="text-sm md:text-base text-gray-300 font-mono leading-relaxed">
              <span className="text-[#ff006e]">{'>'}</span> Monitor P&L metrics across Sports & Pokémon
            </p>
            <p className="text-sm md:text-base text-gray-300 font-mono leading-relaxed">
              <span className="text-[#00ff41]">{'#'}</span> Visual analytics. Zero noise. Pure data.
            </p>
          </div>

          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="border border-[#00ff41] border-opacity-30 p-3 bg-black bg-opacity-50">
              <div className="text-[#00ff41] text-2xl font-mono font-black">12</div>
              <div className="text-xs text-gray-500 font-mono mt-1">Transactions</div>
            </div>
            <div className="border border-[#ff006e] border-opacity-30 p-3 bg-black bg-opacity-50">
              <div className="text-[#ff006e] text-2xl font-mono font-black">$370</div>
              <div className="text-xs text-gray-500 font-mono mt-1">Total Revenue</div>
            </div>
            <div className="border border-[#00ff41] border-opacity-30 p-3 bg-black bg-opacity-50">
              <div className="text-[#00ff41] text-2xl font-mono font-black">$86.50</div>
              <div className="text-xs text-gray-500 font-mono mt-1">Profit</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 border-2 border-[#00ff41] text-[#00ff41] font-mono font-bold text-sm uppercase tracking-widest hover:bg-[#00ff41] hover:text-black transition duration-300"
              style={{
                boxShadow: '0 0 15px rgba(0, 255, 65, 0.3), inset 0 0 15px rgba(0, 255, 65, 0.1)',
              }}
            >
              → Execute Dashboard
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 border-2 border-[#ff006e] text-[#ff006e] font-mono font-bold text-sm uppercase tracking-widest hover:bg-[#ff006e] hover:text-black transition duration-300"
              style={{
                boxShadow: '0 0 15px rgba(255, 0, 110, 0.3), inset 0 0 15px rgba(255, 0, 110, 0.1)',
              }}
            >
              ◆ View Data
            </button>
          </div>

          {/* Info terminal */}
          <div className="border border-gray-700 p-6 bg-black bg-opacity-70 font-mono text-xs text-gray-400 space-y-2">
            <div>
              <span className="text-[#00ff41]">{'>>>'}</span> Demo environment initialized
            </div>
            <div>
              <span className="text-[#ff006e]">{'[!]'}</span> Live data ready. No authentication required.
            </div>
            <div>
              <span className="text-[#00ff41]">{'✓'}</span> Awaiting eBay API credentials for sync
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-xs text-gray-500 font-mono">
              {'[ CARDTRACK ]'} • Built for traders who move fast
            </p>
            <p className="text-[10px] text-gray-600 font-mono mt-2">
              v2.0 • Zero Cool Engine • Neon Protocol Active
            </p>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff41] to-transparent"></div>
      </div>
    </div>
  );
}
