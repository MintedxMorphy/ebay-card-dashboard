'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEbayAuthUrl } from '@/lib/ebay';

export default function Home() {
  const router = useRouter();
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId');
    }
    return null;
  });

  useEffect(() => {
    if (userId) {
      router.push('/dashboard');
    }
  }, [userId, router]);

  const handleEbayLogin = async () => {
    try {
      // Generate a simple userId (in production, use proper auth)
      const newUserId = `user_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('userId', newUserId);

      // Redirect to eBay OAuth
      const authUrl = getEbayAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎴</div>
          <h1 className="text-3xl font-bold text-gray-900">CardTrack</h1>
          <p className="text-gray-600 mt-2">Track your eBay card sales like a pro</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">✨ What You Get:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Total spent & revenue</li>
              <li>✓ Profit/loss tracking</li>
              <li>✓ P&L charts over time</li>
              <li>✓ Sports vs Pokemon breakdown</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleEbayLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          <span>🔐</span>
          <span>Login with eBay</span>
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          We only access your card sales. No personal data is stored.
        </p>
      </div>
    </div>
  );
}
