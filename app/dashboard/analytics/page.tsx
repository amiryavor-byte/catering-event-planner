'use client';

import { useEffect, useState } from 'react';
import { ProfitabilityChart, MetricCard, CostBreakdownChart } from '@/components/analytics/Charts';
import styles from './analytics.module.css';

interface EventProfitability {
    id: number;
    name: string;
    status: string;
    eventType: string;
    startDate: string;
    guestCount: number;
    revenue: number;
    totalCost: number;
    profit: number;
    profitMargin: number;
    depositPaid: number;
    menuItemsCount: number;
}

interface RevenueOverview {
    totalRevenue: number;
    totalCosts: number;
    totalProfit: number;
    averageProfitMargin: number;
    totalDeposits: number;
    eventCount: number;
    eventsByStatus: Array<{ status: string; count: string }>;
}

export default function AnalyticsPage() {
    const [profitabilityData, setProfitabilityData] = useState<EventProfitability[]>([]);
    const [revenueOverview, setRevenueOverview] = useState<RevenueOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    async function fetchAnalyticsData() {
        try {
            setLoading(true);

            // Fetch profitability data
            const profitResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/analytics.php?type=event-profitability`
            );

            if (!profitResponse.ok) {
                throw new Error('Failed to fetch profitability data');
            }

            const profitData = await profitResponse.json();
            setProfitabilityData(profitData);

            // Fetch revenue overview
            const revenueResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/analytics.php?type=revenue-overview`
            );

            if (!revenueResponse.ok) {
                throw new Error('Failed to fetch revenue overview');
            }

            const revenueData = await revenueResponse.json();
            setRevenueOverview(revenueData);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
            console.error('Analytics error:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className="glass-panel p-8 text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-700 rounded w-48 mx-auto mb-4"></div>
                        <div className="h-4 bg-slate-700 rounded w-64 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className="glass-panel p-8 text-center border-warning">
                    <h2 className="text-xl font-semibold text-warning mb-2">⚠️ Error Loading Analytics</h2>
                    <p className="text-slate-400">{error}</p>
                    <button
                        onClick={fetchAnalyticsData}
                        className="btn-primary mt-4"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const chartData = profitabilityData.slice(0, 10).map(event => ({
        name: event.name.length > 20 ? event.name.substring(0, 20) + '...' : event.name,
        revenue: event.revenue,
        cost: event.totalCost,
        profit: event.profit,
    }));

    // Prepare category breakdown
    const categoryBreakdown = profitabilityData.reduce((acc, event) => {
        const type = event.eventType || 'other';
        if (!acc[type]) {
            acc[type] = { name: type, value: 0 };
        }
        acc[type].value += event.totalCost;
        return acc;
    }, {} as Record<string, { name: string; value: number }>);

    const categoryData = Object.values(categoryBreakdown);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Analytics & Reports</h1>
                    <p className="text-slate-400">Business insights and profitability analysis</p>
                </div>
                <button
                    onClick={fetchAnalyticsData}
                    className="btn-secondary"
                >
                    🔄 Refresh Data
                </button>
            </header>

            {/* Key Metrics */}
            <div className={styles.metricsGrid}>
                <MetricCard
                    title="Total Revenue"
                    value={revenueOverview?.totalRevenue || 0}
                    subtitle={`From ${revenueOverview?.eventCount || 0} events`}
                    color="info"
                />
                <MetricCard
                    title="Total Costs"
                    value={revenueOverview?.totalCosts || 0}
                    subtitle="Ingredient costs"
                    color="warning"
                />
                <MetricCard
                    title="Net Profit"
                    value={revenueOverview?.totalProfit || 0}
                    subtitle={`${revenueOverview?.averageProfitMargin || 0}% margin`}
                    trend={revenueOverview && revenueOverview.totalProfit > 0 ? 'up' : 'down'}
                    color={revenueOverview && revenueOverview.totalProfit > 0 ? 'success' : 'danger'}
                />
                <MetricCard
                    title="Deposits Collected"
                    value={revenueOverview?.totalDeposits || 0}
                    subtitle="Secured revenue"
                    color="success"
                />
            </div>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                <div className="card">
                    <h2 className="text-xl font-semibold text-white mb-4">Event Profitability</h2>
                    {chartData.length > 0 ? (
                        <ProfitabilityChart data={chartData} />
                    ) : (
                        <div className="glass-panel p-8 text-center text-slate-500">
                            No event data available
                        </div>
                    )}
                </div>

                <div className="card">
                    <h2 className="text-xl font-semibold text-white mb-4">Cost by Event Type</h2>
                    {categoryData.length > 0 ? (
                        <CostBreakdownChart data={categoryData} />
                    ) : (
                        <div className="glass-panel p-8 text-center text-slate-500">
                            No cost breakdown available
                        </div>
                    )}
                </div>
            </div>

            {/* Event Profitability Table */}
            <div className="card">
                <h2 className="text-xl font-semibold text-white mb-4">Event Profitability Details</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Status</th>
                                <th>Type</th>
                                <th>Guests</th>
                                <th>Revenue</th>
                                <th>Cost</th>
                                <th>Profit</th>
                                <th>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profitabilityData.map((event) => (
                                <tr key={event.id}>
                                    <td className="font-medium">{event.name}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[event.status]}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="text-slate-400 capitalize">{event.eventType || '-'}</td>
                                    <td className="text-slate-400">{event.guestCount || '-'}</td>
                                    <td className="text-primary font-semibold">
                                        ${event.revenue.toLocaleString()}
                                    </td>
                                    <td className="text-warning">
                                        ${event.totalCost.toLocaleString()}
                                    </td>
                                    <td className={event.profit >= 0 ? 'text-success' : 'text-danger'}>
                                        ${event.profit.toLocaleString()}
                                    </td>
                                    <td className={event.profitMargin >= 0 ? 'text-success' : 'text-danger'}>
                                        {event.profitMargin.toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
