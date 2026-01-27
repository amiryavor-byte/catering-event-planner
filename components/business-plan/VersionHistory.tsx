
"use client";

import { BusinessPlanVersion, BusinessPlanData } from '@/lib/data/business-plan-service';
import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface VersionHistoryProps {
    versions: BusinessPlanVersion[];
    currentVersion: BusinessPlanData;
    onRestore?: (version: BusinessPlanData) => void;
    onClose: () => void;
}

export function VersionHistory({ versions, currentVersion, onRestore, onClose }: VersionHistoryProps) {
    const [selectedVersion, setSelectedVersion] = useState<BusinessPlanVersion | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Helper to render diffs
    const renderContent = (data: BusinessPlanData) => {
        // Safe guard for old data vs new data
        const projectionSummary = data.monthlyProjections
            ? `Months: 1-60 | Clients: ${data.monthlyProjections[0]?.clientCount} -> ${data.monthlyProjections[59]?.clientCount}`
            : data.projections
                ? `Years: 1-5 | Clients: ${data.projections[0]?.clientCount} -> ${data.projections[4]?.clientCount}`
                : "No projections";

        return (
            <div className="space-y-4 text-xs text-gray-700 h-[300px] overflow-y-auto p-3 bg-gray-50 rounded border">
                <div><strong>Mission:</strong> {data.missionStatement.substring(0, 100)}...</div>
                <div><strong>Amir's Role:</strong> {data.amirRole.substring(0, 50)}...</div>
                <div><strong>David's Role:</strong> {data.davidRole.substring(0, 50)}...</div>
                <div><strong>Base Price:</strong> ${data.basePriceLow} - ${data.basePriceHigh}</div>
                <div className="mt-2 border-t pt-2">
                    <strong>Projection Model:</strong><br />
                    {projectionSummary}
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                ref={popoverRef}
                className="absolute top-12 right-0 z-50 w-[800px] bg-white rounded-xl shadow-2xl border border-gray-200 flex overflow-hidden ring-1 ring-black/5"
            >
                {/* Sidebar List */}
                <div className="w-1/3 border-r bg-gray-50 h-[400px] flex flex-col">
                    <div className="p-3 border-b flex justify-between items-center bg-gray-100">
                        <h3 className="font-bold text-gray-800 text-sm">History</h3>
                        <span className="text-xs text-gray-500">{versions.length} versions</span>
                    </div>
                    <ul className="overflow-y-auto flex-1">
                        {versions.map((v) => (
                            <li
                                key={v.id}
                                onClick={() => setSelectedVersion(v)}
                                className={`p-3 border-b cursor-pointer hover:bg-white transition-colors text-xs ${selectedVersion?.id === v.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="font-bold text-gray-800">{v.user}</div>
                                <div className="text-gray-500">{new Date(v.created_at).toLocaleString()}</div>
                                <div className="text-gray-400 mt-0.5">{formatDistanceToNow(new Date(v.created_at))} ago</div>
                            </li>
                        ))}
                        {versions.length === 0 && <li className="p-4 text-gray-500 text-xs">No history yet.</li>}
                    </ul>
                </div>

                {/* Diff View */}
                <div className="flex-1 flex flex-col h-[400px]">
                    <div className="p-3 border-b flex justify-between items-center bg-white h-[45px]">
                        <h3 className="font-bold text-sm truncate">
                            {selectedVersion ? `v${selectedVersion.id} by ${selectedVersion.user}` : 'Select version'}
                        </h3>
                        {selectedVersion && onRestore && (
                            <button
                                onClick={() => {
                                    const content = typeof selectedVersion.content === 'string'
                                        ? JSON.parse(selectedVersion.content as any)
                                        : selectedVersion.content;
                                    onRestore(content);
                                    onClose();
                                }}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 shadow-sm"
                            >
                                Restore
                            </button>
                        )}
                    </div>

                    <div className="flex-1 flex p-3 gap-3 overflow-hidden">
                        <div className="flex-1 flex flex-col">
                            <h4 className="font-semibold mb-1 text-green-700 text-xs uppercase tracking-wider">Current</h4>
                            {renderContent(currentVersion)}
                        </div>

                        {selectedVersion && (
                            <div className="flex-1 flex flex-col">
                                <h4 className="font-semibold mb-1 text-amber-700 text-xs uppercase tracking-wider">
                                    Selected
                                </h4>
                                {renderContent(
                                    typeof selectedVersion.content === 'string'
                                        ? JSON.parse(selectedVersion.content as any)
                                        : selectedVersion.content
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </motion.div>
        </AnimatePresence>
    );
}
