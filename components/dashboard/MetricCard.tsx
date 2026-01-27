'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: string; // e.g., "+12%" or "-5%"
    trendLabel?: string; // e.g., "vs last month"
    chartData?: { value: number }[]; // Simple array of values for the sparkline
    color?: string; // Hex or CSS var
    icon?: React.ReactNode;
}

export function MetricCard({ title, value, trend, trendLabel, chartData, color = '#818cf8', icon }: MetricCardProps) {
    const isPositive = trend?.startsWith('+');

    return (
        <div className="glass-card-3d relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                        {trend && (
                            <div className={`flex items-center text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                {trend}
                            </div>
                        )}
                    </div>
                    {trendLabel && <p className="text-slate-500 text-xs mt-1">{trendLabel}</p>}
                </div>
                {icon && (
                    <div className="p-2 rounded-lg bg-white/5 text-slate-300">
                        {icon}
                    </div>
                )}
            </div>

            {/* Sparkline Chart */}
            {chartData && (
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50 group-hover:opacity-80 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={2}
                                fill={`url(#gradient-${title})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
