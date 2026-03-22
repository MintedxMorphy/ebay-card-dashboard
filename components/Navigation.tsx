'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavigationProps {
  userId?: string;
}

export default function Navigation({ userId = 'demo_user' }: NavigationProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('ebay_token');
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-purple-900 border-b border-purple-500/30">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
          <span className="text-2xl">🎴</span>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            CardTrack
          </h1>
        </Link>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            ID: <span className="text-purple-300">{userId.substring(0, 8)}...</span>
          </span>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
