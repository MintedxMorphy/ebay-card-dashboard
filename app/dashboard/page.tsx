'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCards from '@/components/StatsCards';
import ProfitChart from '@/components/ProfitChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import Navigation from '@/components/Navigation';
import Transactions from '@/components/Transactions';
import EdgeNews from '@/components/EdgeNews';

interface Transaction {
  id: string;
  card_category: string;
  transaction_type: string;
  amount: number;
  card_name: string;
  created_at: string;
  transaction_date: string;
}

interface Stats {
  sports_spent: number;
  sports_revenue: number;
  sports_profit: number;
  sports_count: number;
  pokemon_spent: number;
  pokemon_revenue: number;
  pokemon_profit: number;
  pokemon_count: number;
  total_profit: number;
  transactions: Transaction[];
}

// Section Divider Component
function SectionDivider() {
  return (
    <div className="my-8 border-t border-[#00ff41]/20" style={{
      boxShadow: '0 0 10px rgba(0, 255, 65, 0.05)'
    }}></div>
  );
}

// Section Label Component
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <p className="text-sm font-mono text-gray-500 tracking-widest">{label}</p>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-500 to-transparent"></div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [includeOther, setIncludeOther] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Use fixed userId for Gabriel's account (matches users table and sync)
        const userId = 'gabriel_ebay_account';
        setUserId(userId);

        // Load toggle preference from localStorage
        const savedIncludeOther = localStorage.getItem('includeOtherSales') === 'true';
        setIncludeOther(savedIncludeOther);

        // Fetch stats for authenticated user
        const response = await fetch(`/api/transactions/stats?userId=${userId}&includeOther=${savedIncludeOther}`);

        if (!response.ok) {
          throw new Error('Failed to load dashboard');
        }

        const data = await response.json();
        
        // Ensure transactions is always an array
        if (!data.transactions) {
          data.transactions = [];
        }
        
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

  const handleToggleOther = async () => {
    const newValue = !includeOther;
    setIncludeOther(newValue);
    localStorage.setItem('includeOtherSales', newValue.toString());
    
    // Refetch stats with new filter
    try {
      const userId = 'gabriel_ebay_account';
      const response = await fetch(`/api/transactions/stats?userId=${userId}&includeOther=${newValue}`);
      
      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }
      
      const data = await response.json();
      if (!data.transactions) {
        data.transactions = [];
      }
      
      setStats(data);
    } catch (err) {
      console.error('Error refetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  const refetchStats = async () => {
    try {
      const userId = 'gabriel_ebay_account';
      const response = await fetch(`/api/transactions/stats?userId=${userId}&includeOther=${includeOther}`);
      
      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }
      
      const data = await response.json();
      if (!data.transactions) {
        data.transactions = [];
      }
      
      setStats(data);
    } catch (err) {
      console.error('Error refetching stats:', err);
    }
  };

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

      {/* ===== 1. HEADER ===== */}
      <Navigation userId={userId || 'demo_user'} />
      
      <main className="relative z-10">
        {/* Header Branding - Full Width */}
        <div className="mb-8 px-4 py-8">
          <div className="container mx-auto max-w-6xl flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-5xl md:text-6xl font-black text-[#00ff41] mb-2 font-mono" style={{
                textShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
              }}>
                Your Card Empire 💰
              </h1>
              <p className="text-gray-300 text-lg font-mono">
                Track every buy and sell. Dominate the card economy.
              </p>
            </div>
            <button
              onClick={handleToggleOther}
              className={`px-4 py-2 rounded border-2 font-mono font-bold text-sm transition whitespace-nowrap flex-shrink-0 ${
                includeOther
                  ? 'border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10'
                  : 'border-[#ff006e] text-[#ff006e] bg-[#ff006e]/10'
              }`}
              style={{
                boxShadow: includeOther
                  ? '0 0 10px rgba(0, 255, 65, 0.3)'
                  : '0 0 10px rgba(255, 0, 110, 0.3)'
              }}
            >
              {includeOther ? '✓ Include Other' : '◆ Cards Only'}
            </button>
          </div>
        </div>

        <SectionDivider />

        {/* Content Container */}
        <div className="px-4 container mx-auto max-w-6xl">
          {/* ===== 2. P&L STATS ===== */}
          <SectionLabel label="// P&L OVERVIEW" />
          <div className="mb-8">
            <StatsCards stats={stats} />
          </div>

          <SectionDivider />

          {/* ===== 3. CHARTS SECTION ===== */}
          <SectionLabel label="// PERFORMANCE" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-xl bg-black border border-[#00ffff]/30 p-6" style={{
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.1)'
            }}>
              <h2 className="text-2xl font-bold text-[#00ffff] mb-6 font-mono">Profit Over Time 📈</h2>
              <ProfitChart transactions={stats.transactions} />
            </div>
            
            <div className="rounded-xl bg-black border border-[#8b00ff]/30 p-6" style={{
              boxShadow: '0 0 15px rgba(139, 0, 255, 0.1)'
            }}>
              <h2 className="text-2xl font-bold text-[#8b00ff] mb-6 font-mono">Category Breakdown 🏆</h2>
              <CategoryBreakdown stats={stats} transactions={stats.transactions} />
            </div>
          </div>

          <SectionDivider />

          {/* ===== 4. ALL TRANSACTIONS ===== */}
          <SectionLabel label="// TRANSACTION HISTORY" />
          <div className="mb-8">
            <Transactions transactions={stats.transactions} onRefresh={refetchStats} />
          </div>

          <SectionDivider />

          {/* ===== 5. EDGE NEWS ===== */}
          <SectionLabel label="// MARKET INTELLIGENCE" />
          <div className="mb-12">
            <EdgeNews />
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm border-t border-[#00ff41]/20 pt-8">
            <p className="font-mono">Keep crushing it in the card economy! 🚀</p>
          </div>
        </div>
      </main>
    </div>
  );
}
