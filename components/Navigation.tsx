'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavigationProps {
  userId?: string;
}

export default function Navigation({ userId = 'demo_user' }: NavigationProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear cookies
    document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    localStorage.removeItem('ebay_token');
    router.push('/');
  };

  return (
    <nav className="bg-black border-b border-[#00ff41]/20" style={{
      boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)'
    }}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl gap-4 flex-wrap">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
          <span className="text-2xl">🎴</span>
          <h1 className="text-2xl font-bold text-[#00ff41] font-mono" style={{
            textShadow: '0 0 10px rgba(0, 255, 65, 0.4)'
          }}>
            CardTrack
          </h1>
        </Link>
        <div className="flex items-center space-x-4 ml-auto">
          <span className="text-sm text-gray-400 font-mono hidden md:inline">
            ID: <span className="text-[#00ff41]">{userId.substring(0, 8)}...</span>
          </span>
          <button
            onClick={handleLogout}
            className="border-2 border-[#ff006e] text-[#ff006e] font-mono font-bold py-2 px-4 hover:bg-[#ff006e] hover:text-black transition whitespace-nowrap"
            style={{
              boxShadow: '0 0 10px rgba(255, 0, 110, 0.3)'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
