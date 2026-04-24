'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAnalytics, subscribeToOrders, type AnalyticsData } from '@/lib/orders';
import { formatPrice } from '@/lib/utils';
import { RevenueLineChart, StatusBarChart } from '@/components/admin/AdminCharts';
import { StatCardSkeleton, ChartSkeleton, ErrorState, EmptyState } from '@/components/admin/AdminSkeletons';

// Icon components (SVG, no emoji)
const Icons = {
  dollar: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  package: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  check: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  clock: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  cooking: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  x: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const STATS_CONFIG = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: 'dollar', color: 'bg-green-100 text-green-800' },
  { key: 'totalOrders', label: 'Total Orders', icon: 'package', color: 'bg-blue-100 text-blue-800' },
  { key: 'completedOrders', label: 'Completed', icon: 'check', color: 'bg-emerald-100 text-emerald-800' },
  { key: 'pendingOrders', label: 'Pending', icon: 'clock', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'processingOrders', label: 'Processing', icon: 'cooking', color: 'bg-blue-100 text-blue-800' },
  { key: 'rejectedOrders', label: 'Rejected', icon: 'x', color: 'bg-red-100 text-red-800' },
] as const;

const DATE_RANGES = [
  { label: '7 Hari Terakhir', value: '7d' },
  { label: '30 Hari Terakhir', value: '30d' },
  { label: 'Bulan Ini', value: 'month' },
  { label: 'Semua', value: 'all' },
];

export default function AdminDashboardClient() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [activeChart, setActiveChart] = useState<'daily' | 'monthly'>('daily');

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const range = getDateRange(dateRange);
      const data = await getAnalytics(range);
      setAnalytics(data);
    } catch (err) {
      setError('Gagal memuat data analytics');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();

    // Realtime subscription
    const channel = subscribeToOrders(() => {
      fetchAnalytics();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchAnalytics]);

  const getDateRange = (range: string): { from: string; to: string } | undefined => {
    const now = new Date();
    const to = now.toISOString();

    switch (range) {
      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { from: sevenDaysAgo.toISOString(), to };
      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { from: thirtyDaysAgo.toISOString(), to };
      case 'month':
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: firstDayOfMonth.toISOString(), to };
      default:
        return undefined;
    }
  };

  const statValues = useMemo(() => {
    if (!analytics) return {};
    return {
      totalRevenue: analytics.totalRevenue,
      totalOrders: analytics.totalOrders,
      completedOrders: analytics.completedOrders,
      pendingOrders: analytics.pendingOrders,
      processingOrders: analytics.processingOrders,
      rejectedOrders: analytics.rejectedOrders,
    };
  }, [analytics]);

  const chartData = useMemo(() => {
    if (!analytics) return [];
    return activeChart === 'daily' ? analytics.dailyRevenue : analytics.monthlyRevenue;
  }, [analytics, activeChart]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Monitor penjualan dan analytics real-time</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap gap-2">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range.value
                  ? 'bg-[#03AC0E] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchAnalytics} />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
              : STATS_CONFIG.map((stat, index) => {
                  const value = statValues[stat.key as keyof typeof statValues] || 0;
                  const displayValue = stat.key === 'totalRevenue' ? formatPrice(value) : value.toString();

                  return (
                    <motion.div
                      key={stat.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                        {Icons[stat.icon]()}
                      </div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-lg font-bold text-gray-900">{displayValue}</p>
                    </motion.div>
                  );
                })}
          </div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveChart('daily')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        activeChart === 'daily'
                          ? 'bg-[#03AC0E] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Harian
                    </button>
                    <button
                      onClick={() => setActiveChart('monthly')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        activeChart === 'monthly'
                          ? 'bg-[#03AC0E] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Bulanan
                    </button>
                  </div>
                </div>
                {chartData.length > 0 ? (
                  <RevenueLineChart data={chartData} period={activeChart} />
                ) : (
                  <EmptyState message="Tidak ada data revenue untuk periode ini" />
                )}
              </motion.div>
            )}

            {/* Status Distribution Chart */}
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Distribusi Status</h2>
                {analytics?.statusDistribution && analytics.statusDistribution.length > 0 ? (
                  <StatusBarChart data={analytics.statusDistribution} />
                ) : (
                  <EmptyState message="Tidak ada data status pesanan" />
                )}
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
