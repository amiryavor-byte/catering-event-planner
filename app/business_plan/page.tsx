
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { UserSelectionModal } from "@/components/business-plan/UserSelectionModal";
import { InlineEditable } from "@/components/business-plan/InlineEditable";
import { VersionHistory } from "@/components/business-plan/VersionHistory";
import { FinancialProjection } from "@/components/business-plan/FinancialProjection";
import { BusinessPlanService, BusinessPlanData, BusinessPlanVersion, DEFAULT_PLAN_DATA } from "@/lib/data/business-plan-service";
import { debounce } from "lodash";

export default function BusinessPlanPage() {
    const [currentUser, setCurrentUser] = useState<'Amir' | 'David' | null>(null);
    const [planData, setPlanData] = useState<BusinessPlanData>(DEFAULT_PLAN_DATA);
    const [history, setHistory] = useState<BusinessPlanVersion[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Initial Load
    useEffect(() => {
        loadLatestPlan();
    }, []);

    const loadLatestPlan = async () => {
        const { latest, history } = await BusinessPlanService.getLatest();
        if (latest && latest.content) {
            // Merge with default to ensure structural integrity if schema changes
            const merged = { ...DEFAULT_PLAN_DATA, ...latest.content };
            // Ensure projections array exists and has 5 years
            if (!merged.projections || merged.projections.length < 5) {
                merged.projections = DEFAULT_PLAN_DATA.projections;
            }
            setPlanData(merged);
            setLastSaved(new Date(latest.created_at));
        }
        setHistory(history || []);
    };

    // Auto-Save Logic (Debounced)
    const savePlan = useCallback(
        debounce(async (user: string, data: BusinessPlanData) => {
            setIsSaving(true);
            await BusinessPlanService.saveVersion(user, data);
            setLastSaved(new Date());
            setIsSaving(false);
            // Refresh history list silently
            const { history } = await BusinessPlanService.getLatest();
            setHistory(history || []);
        }, 2000),
        []
    );

    const handleDataChange = (newData: BusinessPlanData) => {
        setPlanData(newData);
        if (currentUser) {
            savePlan(currentUser, newData);
        }
    };

    const handleRestore = (versionData: BusinessPlanData) => {
        const merged = { ...DEFAULT_PLAN_DATA, ...versionData };
        handleDataChange(merged); // This will also trigger a save as a new version "Restored by X"
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <UserSelectionModal isOpen={!currentUser} onSelect={setCurrentUser} />

            {showHistory && (
                <VersionHistory
                    versions={history}
                    currentVersion={planData}
                    onRestore={handleRestore}
                    onClose={() => setShowHistory(false)}
                />
            )}

            {/* Top Bar for User & State */}
            {currentUser && (
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b px-6 py-2 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${currentUser === 'Amir' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {currentUser}
                        </span>
                        <span className="text-xs text-gray-400">
                            {isSaving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Unsaved"}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowHistory(true)}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                        >
                            <span>🕒</span> History
                        </button>
                        <button
                            onClick={() => setCurrentUser(null)}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-red-500"
                        >
                            Switch User
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* Header */}
                <header className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4 tracking-tight">
                        Catering Software <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                            Strategic Partnership
                        </span>
                    </h1>
                    <div className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed italic">
                        <InlineEditable
                            value={planData.missionStatement}
                            onSave={(v) => handleDataChange({ ...planData, missionStatement: v })}
                            multiline
                            className="text-center"
                        />
                    </div>
                </header>

                {/* Section 1: Partnership Structure */}
                <section className="mb-16 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-blue-100 flex items-center">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">1</span>
                        Partnership Structure
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-blue-900 mb-3">Amir (51%)</h3>
                            <InlineEditable
                                value={planData.amirRole}
                                onSave={(v) => handleDataChange({ ...planData, amirRole: v })}
                                multiline
                                label="Responsibilities & Role"
                            />
                        </div>

                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-green-900 mb-3">David (49%)</h3>
                            <InlineEditable
                                value={planData.davidRole}
                                onSave={(v) => handleDataChange({ ...planData, davidRole: v })}
                                multiline
                                label="Responsibilities & Role"
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Financial Model */}
                <section className="mb-16 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-5 rounded-bl-full -mr-16 -mt-16"></div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-yellow-100 flex items-center relative z-10">
                        <span className="bg-yellow-100 text-yellow-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">2</span>
                        Financial Projections (5-Year)
                    </h2>

                    <div className="relative z-10">
                        <FinancialProjection data={planData} onChange={handleDataChange} />

                        <div className="mt-8 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-200">
                            <strong>Note:</strong> Projections are dynamic. Adjust "Base Price", "Hourly Rate", or "Clients" to see real-time impact on revenue and profit share.
                        </div>
                    </div>
                </section>

                {/* Section 3: Operational Workflow */}
                <section className="mb-16 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-purple-100 flex items-center">
                        <span className="bg-purple-100 text-purple-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 text-xl">3</span>
                        Operational Workflow
                    </h2>

                    <div className="relative">
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                        <ol className="relative space-y-10 pl-2">
                            <li className="mb-10 ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full -left-3 ring-8 ring-white text-purple-800 text-xs font-bold">1</span>
                                <h3 className="mb-1 text-lg font-semibold text-gray-900">Lead Generation & Sale</h3>
                                <p className="text-base font-normal text-gray-500">David secures client deposit + signed contract.</p>
                            </li>
                            <li className="mb-10 ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full -left-3 ring-8 ring-white text-purple-800 text-xs font-bold">2</span>
                                <h3 className="mb-1 text-lg font-semibold text-gray-900">Hand-off to Technical</h3>
                                <p className="text-base font-normal text-gray-500">David provides domain details & assets to Amir via portal.</p>
                            </li>
                            <li className="mb-10 ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full -left-3 ring-8 ring-white text-purple-800 text-xs font-bold">3</span>
                                <h3 className="mb-1 text-lg font-semibold text-gray-900">Deployment & Customization</h3>
                                <p className="text-base font-normal text-gray-500">Amir deploys code + 10hrs custom styling/config.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full -left-3 ring-8 ring-white text-purple-800 text-xs font-bold">4</span>
                                <h3 className="mb-1 text-lg font-semibold text-gray-900">Training & Launch</h3>
                                <p className="text-base font-normal text-gray-500">David performs final client training and handover.</p>
                            </li>
                        </ol>
                    </div>
                </section>
            </div>
        </div>
    );
}
