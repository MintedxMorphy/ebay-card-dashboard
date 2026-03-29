'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  card_category: string;
  transaction_type: string;
  amount: number;
  card_name: string;
  created_at: string;
}

interface CategoryBreakdownProps {
  stats: {
    sports_spent: number;
    sports_revenue: number;
    sports_profit: number;
    sports_count?: number;
    pokemon_spent: number;
    pokemon_revenue: number;
    pokemon_profit: number;
    pokemon_count?: number;
  };
  transactions?: Transaction[];
}

export default function CategoryBreakdown({ stats, transactions }: CategoryBreakdownProps) {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const data = [
    {
      category: '🏈 Sports',
      revenue: stats.sports_revenue,
      spent: stats.sports_spent,
      profit: stats.sports_profit,
    },
    {
      category: '⚡ Pokemon',
      revenue: stats.pokemon_revenue,
      spent: stats.pokemon_spent,
      profit: stats.pokemon_profit,
    },
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="category" fontSize={12} tick={{ fill: '#9ca3af' }} />
          <YAxis fontSize={12} tick={{ fill: '#9ca3af' }} tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value: unknown) => formatCurrency(typeof value === 'number' ? value : 0)}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#fff',
            }}
            labelStyle={{ color: '#fff' }}
            cursor={{ fill: 'rgba(0, 0, 0, 0)' }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
          <Bar dataKey="revenue" fill="#8b00ff" name="Revenue" radius={[8, 8, 0, 0]} />
          <Bar dataKey="spent" fill="#ff6b00" name="Spent" radius={[8, 8, 0, 0]} />
          <Bar dataKey="profit" fill="#00ffff" name="Profit" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>


    </div>
  );
}
