'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryBreakdownProps {
  stats: {
    sports: { spent: number; revenue: number; items: number };
    pokemon: { spent: number; revenue: number; items: number };
  };
}

export default function CategoryBreakdown({ stats }: CategoryBreakdownProps) {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const data = [
    {
      category: 'Sports Cards',
      revenue: stats.sports.revenue,
      spent: stats.sports.spent,
      profit: stats.sports.revenue - stats.sports.spent,
    },
    {
      category: 'Pokemon Cards',
      revenue: stats.pokemon.revenue,
      spent: stats.pokemon.spent,
      profit: stats.pokemon.revenue - stats.pokemon.spent,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" fontSize={12} tick={{ fill: '#6b7280' }} />
          <YAxis fontSize={12} tick={{ fill: '#6b7280' }} tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value: unknown) => formatCurrency(typeof value === 'number' ? value : 0)}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
          <Bar dataKey="spent" fill="#f97316" name="Spent" />
          <Bar dataKey="profit" fill="#10b981" name="Profit" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">🏆 Sports Cards</h3>
          <p className="text-sm text-blue-700">
            Items: <span className="font-bold">{stats.sports.items}</span>
          </p>
          <p className="text-sm text-blue-700">
            Profit: <span className="font-bold">${(stats.sports.revenue - stats.sports.spent).toFixed(2)}</span>
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">⚡ Pokemon Cards</h3>
          <p className="text-sm text-yellow-700">
            Items: <span className="font-bold">{stats.pokemon.items}</span>
          </p>
          <p className="text-sm text-yellow-700">
            Profit: <span className="font-bold">${(stats.pokemon.revenue - stats.pokemon.spent).toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
