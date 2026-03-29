'use client';

interface StatsCardsProps {
  stats: {
    sports_spent: number;
    sports_revenue: number;
    sports_profit: number;
    sports_count?: number;
    pokemon_spent: number;
    pokemon_revenue: number;
    pokemon_profit: number;
    pokemon_count?: number;
    total_profit: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const totalSpent = stats.sports_spent + stats.pokemon_spent;
  const totalRevenue = stats.sports_revenue + stats.pokemon_revenue;
  const netProfit = stats.total_profit;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const profitColor = netProfit >= 0 ? 'text-[#00ff41]' : 'text-[#ff006e]';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Spent */}
      <div className="bg-black rounded-xl p-6 border border-[#ff006e]/30" style={{
        boxShadow: '0 0 15px rgba(255, 0, 110, 0.1)'
      }}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[#ff006e] font-semibold text-sm uppercase tracking-wide font-mono">Total Spent</h3>
            <p className="text-3xl font-bold text-white mt-2 font-mono">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-[#ff006e] text-xs mt-2">💸 Amount invested</p>
          </div>
          <span className="text-3xl">🛍️</span>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-black rounded-xl p-6 border border-[#00ff41]/30" style={{
        boxShadow: '0 0 15px rgba(0, 255, 65, 0.1)'
      }}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[#00ff41] font-semibold text-sm uppercase tracking-wide font-mono">Total Revenue</h3>
            <p className="text-3xl font-bold text-white mt-2 font-mono">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[#00ff41] text-xs mt-2">🎯 Total sales</p>
          </div>
          <span className="text-3xl">🏆</span>
        </div>
      </div>

      {/* Net P&L */}
      <div className={`bg-black rounded-xl p-6 border ${netProfit >= 0 ? 'border-[#00ff41]/30' : 'border-[#ff006e]/30'}`} style={{
        boxShadow: netProfit >= 0 ? '0 0 15px rgba(0, 255, 65, 0.1)' : '0 0 15px rgba(255, 0, 110, 0.1)'
      }}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`${profitColor} font-semibold text-sm uppercase tracking-wide font-mono`}>
              Net P&L
            </h3>
            <p className={`text-3xl font-bold mt-2 font-mono ${profitColor}`}>
              {formatCurrency(Math.abs(netProfit))}
            </p>
            <p className={`${profitColor} text-xs mt-2 opacity-75`}>
              {netProfit >= 0 ? '📈 You\'re crushing it!' : '📉 Keep grinding!'}
            </p>
          </div>
          <span className="text-3xl">{netProfit >= 0 ? '💰' : '📊'}</span>
        </div>
      </div>
    </div>
  );
}
