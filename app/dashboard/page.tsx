'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCards from '@/components/StatsCards';
import ProfitChart from '@/components/ProfitChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import Navigation from '@/components/Navigation';

interface Transaction {
  id: string;
  card_category: string;
  transaction_type: string;
  amount: number;
  card_name: string;
  transaction_date: string;
}

interface Stats {
  sports_spent: number;
  sports_revenue: number;
  sports_profit: number;
  pokemon_spent: number;
  pokemon_revenue: number;
  pokemon_profit: number;
  total_profit: number;
  transactions: Transaction[];
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchStats = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const userIdCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('userId='))
          ?.split('=')[1];

        // Use authenticated userId if available, otherwise use test userId
        const finalUserId = userIdCookie || 'gabriel_ebay_account';
        setUserId(finalUserId);
        console.log('Using userId:', finalUserId);

        // Fetch real stats for this user
        const response = await fetch(`/api/transactions/stats?userId=${finalUserId}`);

        if (!response.ok) {
          throw new Error('Failed to load dashboard');
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)',
        }}></div>
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4 animate-spin">⚡</div>
          <p className="text-[#00ff41] text-xl font-mono">Loading your card empire...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)',
        }}></div>
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-[#ff006e] text-xl font-mono">{error || 'Failed to load dashboard'}</p>
          <p className="text-gray-400 text-sm mt-4">Try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Scanline effect */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)',
      }}></div>

      <Navigation />
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-[#00ff41] mb-2 font-mono" style={{
            textShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
          }}>
            Your Card Empire 💰
          </h1>
          <p className="text-gray-300 text-lg font-mono">
            Track every buy and sell. Dominate the card economy.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-12">
          <StatsCards stats={stats} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="rounded-xl bg-black border border-[#00ff41]/30 p-6" style={{
            boxShadow: '0 0 15px rgba(0, 255, 65, 0.1)'
          }}>
            <h2 className="text-2xl font-bold text-[#00ff41] mb-6 font-mono">Profit Over Time 📈</h2>
            <ProfitChart transactions={stats.transactions} />
          </div>
          
          <div className="rounded-xl bg-black border border-[#ff006e]/30 p-6" style={{
            boxShadow: '0 0 15px rgba(255, 0, 110, 0.1)'
          }}>
            <h2 className="text-2xl font-bold text-[#ff006e] mb-6 font-mono">Category Breakdown 🏆</h2>
            <CategoryBreakdown stats={stats} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl bg-black border border-[#00ff41]/30 p-6" style={{
          boxShadow: '0 0 15px rgba(0, 255, 65, 0.1)'
        }}>
          <h2 className="text-2xl font-bold text-[#00ff41] mb-6 font-mono">Recent Transactions 🃏</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.transactions.length === 0 ? (
              <p className="text-gray-400">No transactions yet. Start logging your cards!</p>
            ) : (
              stats.transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-black border transition" style={{
                    borderColor: tx.transaction_type === 'buy' ? 'rgba(255, 0, 110, 0.2)' : 'rgba(0, 255, 65, 0.2)',
                  }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white font-mono">
                      {tx.card_name}
                      <span className={`ml-2 text-sm font-bold ${
                        tx.transaction_type === 'buy' ? 'text-[#ff006e]' : 'text-[#00ff41]'
                      }`}>
                        {tx.transaction_type === 'buy' ? '🛍️ Bought' : '🎯 Sold'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400 font-mono">
                      {tx.card_category === 'sports' ? '🏈 Sports' : '⚡ Pokémon'} • {new Date(tx.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-right font-bold font-mono ${
                    tx.transaction_type === 'buy' ? 'text-[#ff006e]' : 'text-[#00ff41]'
                  }`}>
                    {tx.transaction_type === 'buy' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm border-t border-[#00ff41]/20 pt-8">
          <p className="font-mono">Keep crushing it in the card economy! 🚀</p>
        </div>
      </main>
    </div>
  );
}
