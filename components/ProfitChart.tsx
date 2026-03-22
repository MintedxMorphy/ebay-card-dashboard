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

interface ProfitChartProps {
  data: Array<{
    date: string;
    profit: number;
    revenue: number;
    spent: number;
  }>;
}

export default function ProfitChart({ data }: ProfitChartProps) {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">P&L Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            formatter={(value: unknown) => formatCurrency(typeof value === 'number' ? value : 0)}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
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
    </div>
  );
}
