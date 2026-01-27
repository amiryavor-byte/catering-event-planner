
"use client";

import { BusinessPlanData } from '@/lib/data/business-plan-service';
import { InlineEditable } from './InlineEditable';

interface FinancialProjectionProps {
    data: BusinessPlanData;
    onChange: (newData: BusinessPlanData) => void;
}

export function FinancialProjection({ data, onChange }: FinancialProjectionProps) {

    const updateProjection = (index: number, field: keyof typeof data.projections[0], value: number) => {
        const newProjections = [...data.projections];
        newProjections[index] = {
            ...newProjections[index],
            [field]: value
        };
        onChange({ ...data, projections: newProjections });
    };

    const updateGlobal = (field: keyof BusinessPlanData, value: number) => {
        onChange({ ...data, [field]: value });
    };

    // Calculations
    const calculateRow = (p: typeof data.projections[0]) => {
        // Simple Average Base Price for estimation
        const avgBasePrice = (data.basePriceLow + data.basePriceHigh) / 2;

        const baseRevenue = p.clientCount * avgBasePrice;
        const upgradeRevenue = (p.clientCount * (p.upgradeAdoption / 100)) * p.upgradePrice;

        const totalRevenue = baseRevenue + upgradeRevenue;

        // Expenses
        const annualHosting = (data.hostingCost * 12); // Assuming monthly input
        // Server cost is one-time usually, but let's amortize or just subtract from year 1?
        // For simplicity: Annual Expenses = Hosting * 12 * Clients (if per client) or just fixed?
        // Let's assume Hosting Cost is global total per month for simplicity of this model, or per client?
        // "Hosting Cost: $200" usually implies total infrastructure.
        // Let's stick to total.
        const totalExpenses = annualHosting + (p.year === 1 ? data.serverCost : 0);

        const netProfit = totalRevenue - totalExpenses;

        const amirShare = netProfit * (data.shareAmir / 100);
        const davidShare = netProfit * (data.shareDavid / 100);

        return { totalRevenue, totalExpenses, netProfit, amirShare, davidShare };
    };

    const grandTotal = data.projections.reduce((acc, p) => {
        const row = calculateRow(p);
        return {
            revenue: acc.revenue + row.totalRevenue,
            profit: acc.profit + row.netProfit,
            amir: acc.amir + row.amirShare,
            david: acc.david + row.davidShare
        };
    }, { revenue: 0, profit: 0, amir: 0, david: 0 });


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
                    <span className="text-xs text-gray-500 font-semibold uppercase">Hourly Rate</span>
                    <div className="flex items-center text-blue-700 font-bold text-lg">
                        $<InlineEditable value={data.hourlyRate.toString()} onSave={(v) => updateGlobal('hourlyRate', Number(v))} />
                        <span className="text-xs ml-1 font-normal text-gray-400">/hr</span>
                    </div>
                </div>
                <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">Split (Amir/David)</span>
                    <div className="text-gray-800 font-bold text-lg">
                        {data.shareAmir}% / {data.shareDavid}%
                    </div>
                </div>
            </div>

            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 font-semibold">
                    <tr>
                        <th className="px-4 py-2">Year</th>
                        <th className="px-4 py-2">Clients</th>
                        <th className="px-4 py-2">Upgrade %</th>
                        <th className="px-4 py-2">Revenue</th>
                        <th className="px-4 py-2">Exp</th>
                        <th className="px-4 py-2 bg-green-50">Net Profit</th>
                        <th className="px-4 py-2 bg-blue-50">Amir ({data.shareAmir}%)</th>
                        <th className="px-4 py-2 bg-green-50">David ({data.shareDavid}%)</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.projections.map((p, i) => {
                        const calcs = calculateRow(p);
                        return (
                            <tr key={p.year} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium">Year {p.year}</td>
                                <td className="px-4 py-2">
                                    <InlineEditable
                                        value={p.clientCount.toString()}
                                        onSave={(v) => updateProjection(i, 'clientCount', Number(v))}
                                        className="font-bold text-blue-600"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <InlineEditable
                                        value={p.upgradeAdoption.toString()}
                                        onSave={(v) => updateProjection(i, 'upgradeAdoption', Number(v))}
                                    />%
                                </td>
                                <td className="px-4 py-2 text-gray-600">${calcs.totalRevenue.toLocaleString()}</td>
                                <td className="px-4 py-2 text-red-400">-${calcs.totalExpenses.toLocaleString()}</td>
                                <td className="px-4 py-2 font-bold text-green-700 bg-green-50/50">${calcs.netProfit.toLocaleString()}</td>
                                <td className="px-4 py-2 font-medium text-blue-700 bg-blue-50/50">${calcs.amirShare.toLocaleString()}</td>
                                <td className="px-4 py-2 font-medium text-green-700 bg-green-50/50">${calcs.davidShare.toLocaleString()}</td>
                            </tr>
                        );
                    })}
                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-200">
                        <td className="px-4 py-3" colSpan={3}>5-Year Total</td>
                        <td className="px-4 py-3">${grandTotal.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-green-800">${grandTotal.profit.toLocaleString()}</td>
                        <td className="px-4 py-3 text-blue-800">${grandTotal.amir.toLocaleString()}</td>
                        <td className="px-4 py-3 text-green-800">${grandTotal.david.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
