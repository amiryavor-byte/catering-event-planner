
"use client";

import { BusinessPlanData, calculateExponentialGrowth } from '@/lib/data/business-plan-service';
import { InlineEditable } from './InlineEditable';
import { useState } from 'react';

interface FinancialProjectionProps {
    data: BusinessPlanData;
    onChange: (newData: BusinessPlanData) => void;
}

export function FinancialProjection({ data, onChange }: FinancialProjectionProps) {
    const [expanded, setExpanded] = useState(false);

    // If migrating from old data structure, safe guard
    const projections = data.monthlyProjections || [];

    const updateProjection = (index: number, field: keyof typeof projections[0], value: number) => {
        const newProjections = [...projections];
        newProjections[index] = {
            ...newProjections[index],
            [field]: value
        };
        onChange({ ...data, monthlyProjections: newProjections });
    };

    const updateGlobal = (field: keyof BusinessPlanData, value: number) => {
        onChange({ ...data, [field]: value });
    };

    // Calculations
    const calculateRow = (p: typeof projections[0]) => {
        const avgBasePrice = (data.basePriceLow + data.basePriceHigh) / 2;
        const avgFeaturePrice = (data.featurePriceLow + (data.featurePriceHigh || 1500)) / 2;

        const baseRevenue = p.clientCount * avgBasePrice;
        const upgradeRevenue = (p.clientCount * (p.upgradeAdoption / 100)) * avgFeaturePrice;

        const totalRevenue = baseRevenue + upgradeRevenue;

        // Expenses
        const monthlyHosting = data.hostingCost;
        const serverCost = p.month === 1 ? data.serverCost : 0;

        // Dev Scaling Logic
        const year = Math.ceil(p.month / 12);
        // Amir Coverage Decay: Y1:100%, Y2:80%, Y3:50%, Y4:20%, Y5:0%
        const amirCoverageMap = [1.0, 0.8, 0.5, 0.2, 0.0];
        const amirCapacity = amirCoverageMap[Math.min(year - 1, 4)];

        const devsNeeded = p.clientCount / (data.clientsPerDev || 30);
        const hiredDevs = Math.max(0, devsNeeded - amirCapacity);
        const devExpense = hiredDevs * (data.devMonthlyCost || 6000);

        const totalExpenses = monthlyHosting + serverCost + devExpense;

        const netProfit = totalRevenue - totalExpenses;

        const amirShare = netProfit * (data.shareAmir / 100);
        const davidShare = netProfit * (data.shareDavid / 100);

        return { totalRevenue, totalExpenses, netProfit, amirShare, davidShare, hiredDevs, devExpense };
    };

    // 5-Year Aggregates
    const grandTotal = projections.reduce((acc, p) => {
        const row = calculateRow(p);
        return {
            revenue: acc.revenue + row.totalRevenue,
            profit: acc.profit + row.netProfit,
            amir: acc.amir + row.amirShare,
            david: acc.david + row.davidShare,
            devCost: acc.devCost + row.devExpense
        };
    }, { revenue: 0, profit: 0, amir: 0, david: 0, devCost: 0 });

    const visibleProjections = expanded ? projections : projections.slice(0, 6);

    const simulateGrowth = (delta: number) => {
        const currentStart = projections[0]?.clientCount || 3;
        const currentEnd = projections[projections.length - 1]?.clientCount || 70;
        const newEnd = Math.max(currentStart, currentEnd + delta);

        const newCurve = calculateExponentialGrowth(currentStart, newEnd, 60);

        const newProjections = projections.map((p, i) => ({
            ...p,
            clientCount: newCurve[i].clientCount
        }));

        onChange({ ...data, monthlyProjections: newProjections });
    };

    return (
        <div className="overflow-x-auto">
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">Base Price (Low)</span>
                    <div className="flex items-center text-green-700 font-bold text-lg">
                        $<InlineEditable value={data.basePriceLow.toString()} onSave={(v) => updateGlobal('basePriceLow', Number(v))} />
                    </div>
                </div>
                <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">Base Price (High)</span>
                    <div className="flex items-center text-green-700 font-bold text-lg">
                        $<InlineEditable value={data.basePriceHigh.toString()} onSave={(v) => updateGlobal('basePriceHigh', Number(v))} />
                    </div>

                </div>
                <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">Feature Price (Low)</span>
                    <div className="flex items-center text-green-700 font-bold text-lg">
                        $<InlineEditable value={data.featurePriceLow.toString()} onSave={(v) => updateGlobal('featurePriceLow', Number(v))} />
                    </div>
                </div>
                <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">Feature Price (High)</span>
                    <div className="flex items-center text-green-700 font-bold text-lg">
                        $<InlineEditable value={(data.featurePriceHigh || 1500).toString()} onSave={(v) => updateGlobal('featurePriceHigh', Number(v))} />
                    </div>
                </div>
                <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">Hourly Rate</span>
                    <div className="flex items-center text-blue-700 font-bold text-lg">
                        $<InlineEditable value={data.hourlyRate.toString()} onSave={(v) => updateGlobal('hourlyRate', Number(v))} />
                        <span className="text-xs ml-1 font-normal text-gray-400">/hr</span>
                    </div>
                </div>
                <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">Dev Capacity (Clients/Dev)</span>
                    <div className="flex items-center text-purple-700 font-bold text-lg">
                        <InlineEditable value={(data.clientsPerDev || 30).toString()} onSave={(v) => updateGlobal('clientsPerDev', Number(v))} />
                    </div>
                </div>
                <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">Dev Salary (Monthly)</span>
                    <div className="flex items-center text-red-700 font-bold text-lg">
                        $<InlineEditable value={(data.devMonthlyCost || 6000).toString()} onSave={(v) => updateGlobal('devMonthlyCost', Number(v))} />
                    </div>
                </div>
                <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">Split (Amir/David)</span>
                    <div className="text-gray-800 font-bold text-lg">
                        {data.shareAmir}% / {data.shareDavid}%
                    </div>
                </div>
            </div>

            {/* Growth Simulator Controls */}
            <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📈</span>
                    <div>
                        <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-wide">Growth Simulator</h4>
                        <p className="text-xs text-indigo-700">Adjust the 5-Year Target (Current: <span className="font-bold">{projections[59]?.clientCount || 0} Clients</span>)</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => simulateGrowth(-5)}
                        className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold transition-colors shadow-sm"
                        title="Reduce Year 5 Target by 5"
                    >
                        - Slower
                    </button>
                    <button
                        onClick={() => simulateGrowth(5)}
                        className="px-4 py-2 bg-indigo-600 border border-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-colors shadow-md flex items-center gap-2"
                        title="Increase Year 5 Target by 5"
                    >
                        <span>Faster Growth</span>
                        <span className="text-indigo-200 text-xs">(+5)</span>
                    </button>
                </div>
            </div>

            <div className="relative">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2">Month</th>
                            <th className="px-4 py-2">Clients</th>
                            {/* <th className="px-4 py-2">Upgrade %</th> */}
                            <th className="px-4 py-2">Revenue</th>
                            <th className="px-4 py-2 text-red-600">Dev Team</th>
                            <th className="px-4 py-2">Expenses</th>
                            <th className="px-4 py-2 bg-green-50">Net Profit</th>
                            <th className="px-4 py-2 bg-blue-50">Amir ({data.shareAmir}%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y relative">
                        {visibleProjections.map((p, i) => {
                            const calcs = calculateRow(p);
                            const isYearMarker = p.month % 12 === 0;
                            return (
                                <tr key={p.month} className={`hover:bg-gray-50 ${isYearMarker ? 'border-b-2 border-gray-300 bg-gray-50/50' : ''}`}>
                                    <td className="px-4 py-2 font-medium break-keep whitespace-nowrap">
                                        Month {p.month} {isYearMarker && <span className="text-xs font-bold text-gray-400 ml-1">(Yr {p.month / 12})</span>}
                                    </td>
                                    <td className="px-4 py-2">
                                        <InlineEditable
                                            value={p.clientCount.toString()}
                                            onSave={(v) => updateProjection(i, 'clientCount', Number(v))}
                                            className="font-bold text-blue-600"
                                        />
                                    </td>
                                    {/* <td className="px-4 py-2">
                                        <InlineEditable
                                            value={p.upgradeAdoption.toString()}
                                            onSave={(v) => updateProjection(i, 'upgradeAdoption', Number(v))}
                                        />%
                                    </td> */}
                                    <td className="px-4 py-2 text-gray-600">${calcs.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                    <td className="px-4 py-2 text-red-500 text-xs">
                                        {calcs.hiredDevs > 0 ? (
                                            <>
                                                <span className="font-bold">-{calcs.hiredDevs.toFixed(1)} FTE</span>
                                                <div className="text-[10px] text-red-300">-${calcs.devExpense.toLocaleString()}</div>
                                            </>
                                        ) : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="px-4 py-2 text-red-400">-${calcs.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                    <td className="px-4 py-2 font-bold text-green-700 bg-green-50/30">${calcs.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                    <td className="px-4 py-2 font-medium text-blue-700 bg-blue-50/30">${calcs.amirShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
                        <tr>
                            <td className="px-4 py-3" colSpan={3}>5-Year Total (Including Dev Exp)</td>
                            <td className="px-4 py-3 text-red-600">-${grandTotal.devCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-green-800">${grandTotal.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td className="px-4 py-3 text-blue-800">${grandTotal.amir.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        </tr>
                    </tfoot>
                </table>

                {!expanded && (
                    <div className="absolute bottom-[60px] left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-4">
                        {/* Gradient overlay */}
                    </div>
                )}
            </div>

            <div className="mt-4 text-center">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full font-semibold transition-colors shadow-sm"
                >
                    {expanded ? "Show Less (First 6 Months)" : "Expand Full 5-Year Projection (60 Months)"}
                </button>
            </div>
        </div>
    );
}
