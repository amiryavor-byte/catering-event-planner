
"use client";

import { BusinessPlanData } from '@/lib/data/business-plan-service';
import { InlineEditable } from './InlineEditable';
import { useState } from 'react';
import { OwnershipChart } from './OwnershipChart';

interface ExitStrategySectionProps {
    data: BusinessPlanData;
    onChange: (newData: BusinessPlanData) => void;
}

export function ExitStrategySection({ data, onChange }: ExitStrategySectionProps) {

    // --- Helper Calculations ---
    const calculateYearlyGenerals = () => {
        const yearlyData: { year: number; revenue: number; profit: number; amirEarnings: number; davidEarnings: number; amirSharePct: number }[] = [];

        // Group by year (every 12 months)
        for (let y = 0; y < 5; y++) {
            const startM = y * 12;
            const endM = startM + 12;
            const yearMonths = data.monthlyProjections.slice(startM, endM);

            let revenue = 0;
            let profit = 0;

            // Get Amir's share % from the schedule for this year
            const scheduleRow = data.exitSchedule?.find(s => s.year.includes((y + 1).toString()));
            const amirPct = scheduleRow ? scheduleRow.amir : 0;
            const davidPct = scheduleRow ? scheduleRow.david : 0;

            yearMonths.forEach(m => {
                const avgBasePrice = (data.basePriceLow + data.basePriceHigh) / 2;
                const avgFeaturePrice = (data.featurePriceLow + data.featurePriceHigh) / 2;

                // Revenue
                // Note: Client count increases. New clients = current - prev (approx). 
                // We use total revenue from FinancialProjection logic:
                const baseRevenue = m.clientCount * avgBasePrice; // Simple model assumes all are new? No. FinancialProjection logic treats 'clientCount' as total.
                // Wait, FinancialProjection logic: "baseRevenue = p.clientCount * avgBasePrice". 
                // That implies MONTHLY RECURRING REVENUE or misnamed "Client Count" as "New Clients"? 
                // Let's re-read the FinancialProjection logic... 
                // "baseRevenue = p.clientCount * avgBasePrice" -> If clientCount is TOTAL active, then Base Price is recurring?? 
                // User said "Initial Setup" is base price. Usually one-time. 
                // If FinancialProjection calculates total revenue as (Total Clients * BasePrice), it treats BasePrice as MRR. 
                // IF the model is meant to be SAAS + Setup:
                // We'll stick to consistency with FinancialProjection for now to match the table.

                const baseRev = m.clientCount * avgBasePrice;
                const upgradeRev = (m.clientCount * (m.upgradeAdoption / 100)) * avgFeaturePrice; // Using new Feature Price
                const totalRev = baseRev + upgradeRev;

                const expenses = data.hostingCost + (m.month === 1 ? data.serverCost : 0);
                const net = totalRev - expenses;

                revenue += totalRev;
                profit += net;
            });

            yearlyData.push({
                year: y + 1,
                revenue: 0, // Not used here
                profit,
                amirEarnings: profit * (amirPct / 100),
                davidEarnings: profit * (davidPct / 100),
                amirSharePct: amirPct
            });
        }
        return yearlyData;
    };

    const yearlyStats = calculateYearlyGenerals();
    const [goalSeekOpen, setGoalSeekOpen] = useState<{ year: number, current: number } | null>(null);

    const updateSchedule = (index: number, field: keyof typeof data.exitSchedule[0], value: any) => {
        if (!data.exitSchedule) return;
        const newSchedule = [...data.exitSchedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        onChange({ ...data, exitSchedule: newSchedule });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-red-100 flex items-center">
                <span className="bg-red-100 text-red-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">4</span>
                Strategic Vision & Exit Plan
            </h2>

            {/* Pricing Config Row */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Likely Setup Fee Range</label>
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                        $<InlineEditable value={data.basePriceLow.toString()} onSave={(v) => onChange({ ...data, basePriceLow: Number(v) })} />
                        <span className="text-gray-400">-</span>
                        $<InlineEditable value={data.basePriceHigh.toString()} onSave={(v) => onChange({ ...data, basePriceHigh: Number(v) })} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Feature Update Price Range</label>
                    <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
                        $<InlineEditable value={(data.featurePriceLow || 500).toString()} onSave={(v) => onChange({ ...data, featurePriceLow: Number(v) })} />
                        <span className="text-blue-300">-</span>
                        $<InlineEditable value={(data.featurePriceHigh || 1500).toString()} onSave={(v) => onChange({ ...data, featurePriceHigh: Number(v) })} />
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📊 Profit Share Projection
                </h3>
                <OwnershipChart data={yearlyStats} />
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        🚀 The "Upsell Engine"
                    </h3>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-sm leading-relaxed text-gray-700">
                        <InlineEditable
                            value={data.revenueStrategy || "Strategy pending..."}
                            onSave={(v) => onChange({ ...data, revenueStrategy: v })}
                            multiline
                        />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        🤝 Buyout Clause
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm leading-relaxed text-gray-600">
                        <InlineEditable
                            value={data.buyoutClause || "Clause pending..."}
                            onSave={(v) => onChange({ ...data, buyoutClause: v })}
                            multiline
                        />
                    </div>
                </div>
            </div>

            {/* Exit Schedule Table */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    📉 5-Year Ownership Transition
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-800 text-white rounded-t-lg">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Timeline</th>
                                <th className="px-4 py-3 bg-blue-900/50">Amir %</th>
                                <th className="px-4 py-3 bg-blue-900/30">Proj. Earnings</th>
                                <th className="px-4 py-3 bg-green-900/50">David %</th>
                                <th className="px-4 py-3 bg-green-900/30">Proj. Earnings</th>
                                <th className="px-4 py-3 rounded-tr-lg">Amir's Role Context</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-x border-b border-gray-200">
                            {data.exitSchedule?.map((row, i) => {
                                // Match year string "Year 1" to index 0
                                const yearNum = parseInt(row.year.replace(/\D/g, '')) || (i + 1);
                                const stats = yearlyStats.find(y => y.year === yearNum);
                                const amirEarnings = stats ? stats.amirEarnings : 0;
                                const davidEarnings = stats ? stats.davidEarnings : 0;

                                return (
                                    <tr key={i} className="hover:bg-gray-50 group">
                                        <td className="px-4 py-4 font-bold text-gray-900">{row.year}</td>
                                        <td className="px-4 py-4 font-medium text-blue-700">
                                            <div className="flex items-center gap-1">
                                                <InlineEditable
                                                    value={row.amir.toString()}
                                                    onSave={(v) => updateSchedule(i, 'amir', Number(v))}
                                                />%
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-blue-800 bg-blue-50/50 relative group-hover:bg-blue-100 transition-colors cursor-pointer"
                                            title="Click to calculate required sales (Goal Seek)"
                                            onClick={() => setGoalSeekOpen({ year: yearNum, current: Math.round(amirEarnings) })}
                                        >
                                            ${Math.round(amirEarnings).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 font-medium text-green-700">
                                            <div className="flex items-center gap-1">
                                                <InlineEditable
                                                    value={row.david.toString()}
                                                    onSave={(v) => updateSchedule(i, 'david', Number(v))}
                                                />%
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-green-800 bg-green-50/50">
                                            ${Math.round(davidEarnings).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 italic text-xs">
                                            <InlineEditable
                                                value={row.role}
                                                onSave={(v) => updateSchedule(i, 'role', v)}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                            <tr className="bg-yellow-50 border-t-2 border-yellow-200">
                                <td className="px-4 py-4 font-bold text-gray-900">Year 6+</td>
                                <td className="px-4 py-4 font-bold text-blue-700">5%</td>
                                <td className="px-4 py-4 text-gray-500 italic">Perpetual</td>
                                <td className="px-4 py-4 font-bold text-green-700">95%</td>
                                <td className="px-4 py-4 text-gray-500 italic">Perpetual</td>
                                <td className="px-4 py-4 text-gray-600 font-medium text-xs">
                                    Royalty continues indefinitely as long as David sells the software.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Goal Seek Popover */}
            {goalSeekOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setGoalSeekOpen(null)}>
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">🎯 Goal Seek: Year {goalSeekOpen.year}</h3>
                        <p className="mb-4 text-gray-600">
                            Current Projection: <strong className="text-green-600">${goalSeekOpen.current.toLocaleString()}</strong>
                            <br /> based on current sales trajectory.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Target Annual Earnings for Amir</label>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-400">$</span>
                                <input
                                    className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none w-full"
                                    autoFocus
                                    placeholder={goalSeekOpen.current.toString()}
                                    onChange={(e) => {
                                        const target = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                        // Simple Reverse Logic:
                                        // If current earning X comes from Y clients/month avg
                                        // Then target earning Z needs (Z/X)*Y clients/month
                                        // This is a rough heuristic.

                                        const ratio = target / (goalSeekOpen.current || 1);
                                        const currentAvgClients = data.monthlyProjections[(goalSeekOpen.year * 12) - 1].clientCount; // End of year count
                                        const requiredClients = Math.round(currentAvgClients * ratio);

                                        const el = document.getElementById('goal-result');
                                        if (el) el.innerText = requiredClients.toString();
                                    }}
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800 mb-1 font-bold">Reality Check:</p>
                            <p className="text-blue-900 leading-snug">
                                To hit this number, you'd need to ramp up to <strong className="text-xl" id="goal-result">--</strong> active clients by Year {goalSeekOpen.year}.
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium" onClick={() => setGoalSeekOpen(null)}>Done</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
