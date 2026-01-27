
"use client";

import { BusinessPlanData } from '@/lib/data/business-plan-service';
import { InlineEditable } from './InlineEditable';
import { SalesCoachChat } from './SalesCoachChat';
import { useState } from 'react';

interface SalesPitchSectionProps {
    data: BusinessPlanData;
    onChange: (newData: BusinessPlanData) => void;
}

export function SalesPitchSection({ data, onChange }: SalesPitchSectionProps) {
    const [showChat, setShowChat] = useState(false);

    const updatePitch = (newPitch: string) => {
        onChange({ ...data, salesPitch: newPitch });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100 relative">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-indigo-100 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">5</span>
                    Sales Strategy & Pitch
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`text-sm font-semibold py-2 px-4 rounded-full transition-all flex items-center gap-2 shadow-sm ${showChat
                                ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                            }`}
                    >
                        <span>✨</span> Brainstorm with AI
                    </button>

                    {showChat && (
                        <SalesCoachChat
                            currentPitch={data.salesPitch || ""}
                            onUpdatePitch={updatePitch}
                            onClose={() => setShowChat(false)}
                        />
                    )}
                </div>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-3">
                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-inner">
                        <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                            Current Pitch Script
                        </label>
                        <div className="text-lg text-gray-800 leading-relaxed font-medium">
                            <InlineEditable
                                value={data.salesPitch || "Pitch pending..."}
                                onSave={updatePitch}
                                multiline
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 italic text-center">
                        Tip: Open the AI Coach to tailor this pitch for specific client types (Restaurant Owners, Renters, etc.)
                    </p>
                </div>
            </div>
        </div>
    );
}
