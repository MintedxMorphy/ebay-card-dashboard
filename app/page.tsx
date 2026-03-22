'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Main content */}
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Title with emoji */}
          <div className="space-y-4">
            <div className="text-6xl md:text-8xl mb-4 animate-bounce">
              💰🃏
            </div>
            <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 leading-tight">
              CardTrack
            </h1>
            <p className="text-xl md:text-2xl text-purple-300 font-bold">
              Your Card Game Economy Dashboard
            </p>
          </div>

          {/* Subtitle */}
          <div className="space-y-3">
            <p className="text-base md:text-lg text-gray-300">
              Track your <span className="text-red-400 font-bold">Sports</span> & <span className="text-yellow-400 font-bold">Pokémon</span> card buys and sells
            </p>
            <p className="text-sm md:text-base text-gray-400">
              See your profits, analyze trends, and dominate the card game economy 📈
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-500/30 hover:border-purple-400/60 transition">
              <div className="text-3xl mb-2">📊</div>
              <p className="font-bold text-purple-300">Real-Time Stats</p>
              <p className="text-sm text-gray-400">See your profit & loss instantly</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-500/30 hover:border-blue-400/60 transition">
              <div className="text-3xl mb-2">📈</div>
              <p className="font-bold text-blue-300">Charts & Graphs</p>
              <p className="text-sm text-gray-400">Watch your profits grow over time</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-pink-900/50 to-pink-800/50 border border-pink-500/30 hover:border-pink-400/60 transition">
              <div className="text-3xl mb-2">🎯</div>
              <p className="font-bold text-pink-300">Category Breakdown</p>
              <p className="text-sm text-gray-400">Sports vs Pokémon performance</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-lg hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105 shadow-lg"
            >
              🚀 Launch Dashboard
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg rounded-lg hover:from-blue-600 hover:to-purple-600 transition transform hover:scale-105 shadow-lg"
            >
              📊 View Demo Data
            </button>
          </div>

          {/* Info box */}
          <div className="mt-12 p-6 rounded-lg bg-slate-900/50 border border-purple-500/30 backdrop-blur">
            <p className="text-sm md:text-base text-gray-300 mb-3">
              <span className="text-green-400 font-bold">✅ Demo Data Ready</span> - See sample transactions now!
            </p>
            <p className="text-xs md:text-sm text-gray-400">
              When your eBay API is approved, connect it to see your real transactions auto-sync. No login needed to start! 🎮
            </p>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-gray-500 text-sm">
            <p>Built for card traders who mean business 💪</p>
            <p className="mt-2 text-xs">Dashboard by Zero Cool • Powered by Next.js + Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
