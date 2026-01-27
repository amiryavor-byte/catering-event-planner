
"use client";

import { BusinessPlanData } from '@/lib/data/business-plan-service';
import { InlineEditable } from './InlineEditable';

interface ExitStrategySectionProps {
    data: BusinessPlanData;
    onChange: (newData: BusinessPlanData) => void;
}

export function ExitStrategySection({ data, onChange }: ExitStrategySectionProps) {

    const updateSchedule = (index: number, field: keyof typeof data.exitSchedule[0], value: any) => {
        // Guard for missing schedule (migration)
        if (!data.exitSchedule) return;

        const newSchedule = [...data.exitSchedule];
        newSchedule[index] = {
            ...newSchedule[index],
            [field]: value
        };
        onChange({ ...data, exitSchedule: newSchedule });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-red-100 flex items-center">
                <span className="bg-red-100 text-red-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">4</span>
                Strategic Vision & Exit Plan
            </h2>

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
                                <th className="px-6 py-3 rounded-tl-lg">Timeline</th>
                                <th className="px-6 py-3">Amir's Share</th>
                                <th className="px-6 py-3">David's Share</th>
                                <th className="px-6 py-3 rounded-tr-lg">Amir's Role Context</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-x border-b border-gray-200">
                            {data.exitSchedule?.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 group">
                                    <td className="px-6 py-4 font-bold text-gray-900">{row.year}</td>
                                    <td className="px-6 py-4 font-medium text-blue-700">
                                        <div className="flex items-center gap-1">
                                            <InlineEditable
                                                value={row.amir.toString()}
                                                onSave={(v) => updateSchedule(i, 'amir', Number(v))}
                                            />%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-green-700">
                                        <div className="flex items-center gap-1">
                                            <InlineEditable
                                                value={row.david.toString()}
                                                onSave={(v) => updateSchedule(i, 'david', Number(v))}
                                            />%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 italic">
                                        <InlineEditable
                                            value={row.role}
                                            onSave={(v) => updateSchedule(i, 'role', v)}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {!data.exitSchedule && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-500">
                                        No exit schedule data found. This will appear on new save.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
