'use client';

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Color palette for charts
export const CHART_COLORS = {
    primary: '#4f46e5',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    slate: '#64748b',
};

export const PIE_COLORS = [
    CHART_COLORS.primary,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.info,
    CHART_COLORS.purple,
    CHART_COLORS.pink,
];

// Custom tooltip styling
export const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-3 border border-slate-700">
                <p className="text-white font-semibold mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number'
                            ? entry.value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD'
                            })
                            : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface ProfitabilityChartProps {
    data: Array<{
        name: string;
        revenue: number;
        cost: number;
        profit: number;
    }>;
}

export function ProfitabilityChart({ data }: ProfitabilityChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ color: '#94a3b8' }}
                    iconType="circle"
                />
                <Bar dataKey="revenue" fill={CHART_COLORS.primary} name="Revenue" />
                <Bar dataKey="cost" fill={CHART_COLORS.warning} name="Cost" />
                <Bar dataKey="profit" fill={CHART_COLORS.success} name="Profit" />
            </BarChart>
        </ResponsiveContainer>
    );
}

interface TrendLineChartProps {
    data: Array<{
        name: string;
        value: number;
        [key: string]: any;
    }>;
    dataKey: string;
    color?: string;
    title?: string;
}

export function TrendLineChart({ data, dataKey, color = CHART_COLORS.primary, title }: TrendLineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ fill: color, r: 4 }}
                    activeDot={{ r: 6 }}
                    name={title || dataKey}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

interface CostBreakdownChartProps {
    data: Array<{
        name: string;
        value: number;
    }>;
}

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'success' | 'warning' | 'danger' | 'info';
}

export function MetricCard({ title, value, subtitle, trend, color = 'info' }: MetricCardProps) {
    const colorClasses = {
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
        info: 'text-primary',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    return (
        <div className="card">
            <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
            <p className={`text-4xl font-bold mt-2 ${colorClasses[color]}`}>
                {typeof value === 'number'
                    ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    : value}
            </p>
            {subtitle && (
                <span className={`text-sm mt-1 ${trend ? colorClasses[trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'info'] : 'text-slate-500'}`}>
                    {trend && trendIcons[trend]} {subtitle}
                </span>
            )}
        </div>
    );
}
