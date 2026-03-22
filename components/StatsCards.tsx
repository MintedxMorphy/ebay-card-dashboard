'use client';

interface StatsCardsProps {
  stats: {
    totalSpent: number;
    totalRevenue: number;
    netProfit: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const profitColor = stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600';
  const profitBgColor = stats.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
        <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Total Spent</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {formatCurrency(stats.totalSpent)}
        </p>
        <p className="text-gray-500 text-xs mt-1">Amount invested in cards</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
        <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Total Revenue</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {formatCurrency(stats.totalRevenue)}
        </p>
        <p className="text-gray-500 text-xs mt-1">Total sales value</p>
      </div>

      <div className={`rounded-lg shadow-md p-6 border-l-4 ${profitBgColor} ${profitColor}`}>
        <h3 className="font-semibold text-sm uppercase tracking-wide">Net Profit/Loss</h3>
        <p className="text-3xl font-bold mt-2">
          {formatCurrency(stats.netProfit)}
        </p>
        <p className="text-xs mt-1 opacity-75">
          {stats.netProfit >= 0 ? '📈 Profit' : '📉 Loss'}
        </p>
      </div>
    </div>
  );
}
