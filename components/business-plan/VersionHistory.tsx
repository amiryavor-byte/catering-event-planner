
"use client";

import { BusinessPlanVersion, BusinessPlanData } from '@/lib/data/business-plan-service';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
    versions: BusinessPlanVersion[];
    currentVersion: BusinessPlanData;
    onRestore?: (version: BusinessPlanData) => void;
    onClose: () => void;
}

export function VersionHistory({ versions, currentVersion, onRestore, onClose }: VersionHistoryProps) {
    const [selectedVersion, setSelectedVersion] = useState<BusinessPlanVersion | null>(null);

    // Helper to render diffs (Simplified for now - just showing selected content)
    const renderContent = (data: BusinessPlanData) => (
        <div className="space-y-4 text-sm text-gray-700 h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded">
            <div><strong>Mission:</strong> {data.missionStatement}</div>
            <div><strong>Amir's Role:</strong> {data.amirRole}</div>
            <div><strong>David's Role:</strong> {data.davidRole}</div>
            <div><strong>Base Price:</strong> ${data.basePriceLow} - ${data.basePriceHigh}</div>
            <div className="mt-4 border-t pt-2">
                <strong>Projections (Year 1):</strong><br />
                Clients: {data.projections[0].clientCount} | Share: 51/49
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl h-[80vh] flex overflow-hidden shadow-2xl">

                {/* Sidebar List */}
                <div className="w-1/4 border-r bg-gray-50 overflow-y-auto">
                    <div className="p-4 border-b">
                        <h3 className="font-bold text-gray-900">Version History</h3>
                        <button onClick={onClose} className="text-xs text-red-500 mt-2 underline">Close</button>
                    </div>
                    <ul>
                        {versions.map((v) => (
                            <li
                                key={v.id}
                                onClick={() => setSelectedVersion(v)}
                                className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${selectedVersion?.id === v.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="font-bold text-gray-800">{v.user}</div>
                                <div className="text-xs text-gray-500">{new Date(v.created_at).toLocaleString()}</div>
                                <div className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(v.created_at))} ago</div>
                            </li>
                        ))}
                        {versions.length === 0 && <li className="p-4 text-gray-500 text-sm">No history yet.</li>}
                    </ul>
                </div>

                {/* Diff View */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-white">
                        <h3 className="font-bold">
                            {selectedVersion ? `Comparing Version #${selectedVersion.id}` : 'Select a version to compare'}
                        </h3>
                        {selectedVersion && onRestore && (
                            <button
                                onClick={() => {
                                    // In a real app we'd fetch the full content first if it wasn't loaded
                                    const content = typeof selectedVersion.content === 'string'
                                        ? JSON.parse(selectedVersion.content as any)
                                        : selectedVersion.content;
                                    onRestore(content);
                                    onClose();
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                                Restore This Version
                            </button>
                        )}
                    </div>

                    <div className="flex-1 flex p-4 gap-4 overflow-hidden">
                        <div className="flex-1 flex flex-col">
                            <h4 className="font-semibold mb-2 text-green-700">Current Version</h4>
                            {renderContent(currentVersion)}
                        </div>

                        {selectedVersion && (
                            <div className="flex-1 flex flex-col">
                                <h4 className="font-semibold mb-2 text-amber-700">
                                    Version from {new Date(selectedVersion.created_at).toLocaleTimeString()}
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

            </div>
        </div>
    );
}
