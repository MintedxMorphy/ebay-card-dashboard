'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCards from '@/components/StatsCards';
import ProfitChart from '@/components/ProfitChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import Navigation from '@/components/Navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.push('/');
      return;
    }
    setUserId(uid);
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/transactions/stats?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const handleSync = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ebay_token');
      if (!token) {
        setError('No eBay token found');
        return;
      }

      const response = await fetch('/api/transactions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token, userId }),
      });

      if (!response.ok) throw new Error('Sync failed');

      // Refresh stats after sync
      const statsResponse = await fetch(`/api/transactions/stats?userId=${userId}`);
      const data = await statsResponse.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation userId={userId} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Card Sales Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your eBay sports & Pokemon card sales</p>
          </div>
          <button
            onClick={handleSync}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            {loading ? 'Syncing...' : 'Sync Transactions'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading && !stats ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            <StatsCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProfitChart data={stats.overTime} />
              <CategoryBreakdown stats={stats} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
