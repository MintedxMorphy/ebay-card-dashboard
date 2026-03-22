'use client';

import { useEffect, useState } from 'react';
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/transactions/stats');
        
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

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚡</div>
          <p className="text-purple-300 text-xl">Loading your card empire...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 text-xl">{error || 'Failed to load dashboard'}</p>
          <p className="text-gray-400 text-sm mt-4">Try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
            Your Card Empire 💰
          </h1>
          <p className="text-gray-300 text-lg">
            Track every buy and sell. Dominate the card economy.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-12">
          <StatsCards stats={stats} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="rounded-xl bg-slate-900/50 border border-purple-500/30 p-6 backdrop-blur">
            <h2 className="text-2xl font-bold text-purple-300 mb-6">Profit Over Time 📈</h2>
            <ProfitChart transactions={stats.transactions} />
          </div>
          
          <div className="rounded-xl bg-slate-900/50 border border-purple-500/30 p-6 backdrop-blur">
            <h2 className="text-2xl font-bold text-purple-300 mb-6">Category Breakdown 🏆</h2>
            <CategoryBreakdown stats={stats} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl bg-slate-900/50 border border-purple-500/30 p-6 backdrop-blur">
          <h2 className="text-2xl font-bold text-purple-300 mb-6">Recent Transactions 🃏</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.transactions.length === 0 ? (
              <p className="text-gray-400">No transactions yet. Start logging your cards!</p>
            ) : (
              stats.transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-purple-500/20 hover:border-purple-400/50 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {tx.card_name}
                      <span className={`ml-2 text-sm font-bold ${
                        tx.transaction_type === 'buy' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {tx.transaction_type === 'buy' ? '🛍️ Bought' : '🎯 Sold'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">
                      {tx.card_category === 'sports' ? '🏈 Sports' : '⚡ Pokémon'} • {new Date(tx.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-right font-bold ${
                    tx.transaction_type === 'buy' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {tx.transaction_type === 'buy' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm border-t border-purple-500/20 pt-8">
          <p>Keep crushing it in the card economy! 🚀</p>
        </div>
      </main>
    </div>
  );
}
