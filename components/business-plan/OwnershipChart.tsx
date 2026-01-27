
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OwnershipChartProps {
    data: {
        year: number | string; // 1, 2, ...
        amirEarnings: number;
        davidEarnings: number;
    }[];
}

export function OwnershipChart({ data }: OwnershipChartProps) {
    const formattedData = data.map(d => ({
        ...d,
        yearLabel: typeof d.year === 'number' ? `Year ${d.year}` : d.year,
        Amir: Math.round(d.amirEarnings),
        David: Math.round(d.davidEarnings)
    }));

    return (
        <div className="h-[400px] w-full bg-white p-4 rounded-xl border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={formattedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="yearLabel" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="Amir" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} barSize={50} />
                    <Bar dataKey="David" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
