'use client';

import { memo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPrice } from '@/lib/utils';

// IDR Currency formatter for charts
const formatIDR = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
  period: 'daily' | 'monthly';
}

export const RevenueLineChart = memo(function RevenueLineChart({ data, period }: RevenueChartProps) {
  const formatXAxis = (value: string) => {
    if (period === 'daily') {
      return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
    const [year, month] = value.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          stroke="#6B7280"
          fontSize={12}
        />
        <Tooltip
          formatter={(value: number) => [formatIDR(value), 'Revenue']}
          labelFormatter={(label) => period === 'daily' 
            ? new Date(label).toLocaleDateString('id-ID', { dateStyle: 'full' })
            : label
          }
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#03AC0E"
          strokeWidth={2}
          dot={{ fill: '#03AC0E', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#03AC0E' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

interface StatusChartProps {
  data: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#FCD34D',
  processing: '#60A5FA',
  completed: '#34D399',
  rejected: '#F87171',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  processing: 'Diproses',
  completed: 'Selesai',
  rejected: 'Ditolak',
};

export const StatusBarChart = memo(function StatusBarChart({ data }: StatusChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    label: STATUS_LABELS[item.status] || item.status,
    fill: STATUS_COLORS[item.status] || '#9CA3AF',
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="label"
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value: number, name: string, props: any) => [
            `${value} pesanan`,
            props.payload.label,
          ]}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});
