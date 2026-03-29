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

  // Count actual items per category
  const sportsItems = transactions?.filter((tx) => tx.card_category === 'sports').length || 0;
  const pokemonItems = transactions?.filter((tx) => tx.card_category === 'pokemon').length || 0;

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

      {/* Category Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-500/30 p-4 rounded-lg backdrop-blur">
          <h3 className="font-semibold text-purple-300 mb-2">🏈 Sports Cards</h3>
          <p className="text-sm text-purple-200">
            Items: <span className="font-bold">{sportsItems}</span>
          </p>
          <p className="text-sm text-purple-200">
            Profit: <span className={`font-bold ${stats.sports_profit >= 0 ? 'text-[#00ffff]' : 'text-[#ff6b00]'}`}>
              {formatCurrency(stats.sports_profit)}
            </span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border border-orange-500/30 p-4 rounded-lg backdrop-blur">
          <h3 className="font-semibold text-orange-300 mb-2">⚡ Pokemon Cards</h3>
          <p className="text-sm text-orange-200">
            Items: <span className="font-bold">{pokemonItems}</span>
          </p>
          <p className="text-sm text-orange-200">
            Profit: <span className={`font-bold ${stats.pokemon_profit >= 0 ? 'text-[#00ffff]' : 'text-[#ff6b00]'}`}>
              {formatCurrency(stats.pokemon_profit)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
