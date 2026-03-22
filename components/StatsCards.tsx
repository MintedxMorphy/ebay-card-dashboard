'use client';

interface StatsCardsProps {
  stats: {
    sports_spent: number;
    sports_revenue: number;
    sports_profit: number;
    pokemon_spent: number;
    pokemon_revenue: number;
    pokemon_profit: number;
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

  const profitColor = netProfit >= 0 ? 'text-green-400' : 'text-red-400';
  const profitBg = netProfit >= 0 ? 'from-green-900/50 to-green-800/50' : 'from-red-900/50 to-red-800/50';
  const profitBorder = netProfit >= 0 ? 'border-green-500/30' : 'border-red-500/30';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Spent */}
      <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl p-6 border border-blue-500/30 backdrop-blur">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-blue-300 font-semibold text-sm uppercase tracking-wide">Total Spent</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-blue-300 text-xs mt-2">💸 Amount invested</p>
          </div>
          <span className="text-3xl">🛍️</span>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-6 border border-purple-500/30 backdrop-blur">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-purple-300 font-semibold text-sm uppercase tracking-wide">Total Revenue</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-purple-300 text-xs mt-2">🎯 Total sales</p>
          </div>
          <span className="text-3xl">🏆</span>
        </div>
      </div>

      {/* Net Profit/Loss */}
      <div className={`bg-gradient-to-br ${profitBg} rounded-xl p-6 border ${profitBorder} backdrop-blur`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`${profitColor} font-semibold text-sm uppercase tracking-wide`}>
              {netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
            </h3>
            <p className={`text-3xl font-bold mt-2 ${profitColor}`}>
              {formatCurrency(Math.abs(netProfit))}
            </p>
            <p className={`${profitColor} text-xs mt-2 opacity-75`}>
              {netProfit >= 0 ? '📈 You\'re crushing it!' : '📉 Keep grinding!'}
            </p>
          </div>
          <span className="text-3xl">{netProfit >= 0 ? '💰' : '⚠️'}</span>
        </div>
      </div>
    </div>
  );
}
