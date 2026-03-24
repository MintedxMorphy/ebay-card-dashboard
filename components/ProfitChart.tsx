'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Transaction {
  id: string;
  card_category: string;
  transaction_type: string;
  amount: number;
  card_name: string;
  created_at: string;
  transaction_date: string;
}

interface ProfitChartProps {
  transactions: Transaction[];
}

export default function ProfitChart({ transactions }: ProfitChartProps) {
  // Process transactions into daily data
  const dailyData: { [key: string]: { date: string; profit: number; revenue: number; spent: number } } = {};

  console.log('[ProfitChart] Processing transactions:', transactions);

  transactions.forEach((tx) => {
    // Use transaction_date (actual date of transaction) not created_at (insertion date)
    const transactionDate = tx.transaction_date || tx.created_at;
    const date = new Date(transactionDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    console.log(`[ProfitChart] ${tx.card_name} (${tx.transaction_type}): ${transactionDate} -> ${date}`);

    if (!dailyData[date]) {
      dailyData[date] = { date, profit: 0, revenue: 0, spent: 0 };
    }

    if (tx.transaction_type === 'buy') {
      dailyData[date].spent += tx.amount;
    } else {
      dailyData[date].revenue += tx.amount;
    }

    dailyData[date].profit = dailyData[date].revenue - dailyData[date].spent;
  });

  const data = Object.values(dailyData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Last 30 days

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="w-full">
      {data.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No transaction data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis
              dataKey="date"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: unknown) => formatCurrency(typeof value === 'number' ? value : 0)}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #404040',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Profit"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="spent"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 4 }}
              activeDot={{ r: 6 }}
              name="Spent"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
