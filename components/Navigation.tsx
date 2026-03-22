'use client';

import { useRouter } from 'next/navigation';

interface NavigationProps {
  userId: string;
}

export default function Navigation({ userId }: NavigationProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('ebay_token');
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎴</span>
          <h1 className="text-2xl font-bold text-gray-900">CardTrack</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">ID: {userId.substring(0, 8)}...</span>
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
