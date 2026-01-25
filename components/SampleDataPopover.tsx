'use client'

import { useState, useEffect } from 'react';
import { generateSampleData, clearSampleData, getDataStatistics } from '@/lib/actions/sampleData';
import { Database, Loader2, RefreshCw, Trash2, Wand2, X } from 'lucide-react';

interface DataStats {
    events: number;
    users: number;
    menus: number;
    menuItems: number;
    ingredients: number;
    recipes: number;
    tasks: number;
}

export default function SampleDataPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState<DataStats | null>(null);
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    const loadStats = async () => {
        const result = await getDataStatistics();
        if (result.success && result.stats) {
            setStats(result.stats);
        }
    };

    // Load stats on mount and when opening
    useEffect(() => {
        if (isOpen) {
            loadStats();
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const result = await generateSampleData();

            if (result.success) {
                setMessage(result.message || 'Sample data generated successfully!');
                await loadStats();
            } else {
                setMessage(`Error: ${result.error}`);
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = async () => {
        setIsLoading(true);
        setMessage('');
        setShowConfirmClear(false);

        try {
            const result = await clearSampleData();

            if (result.success) {
                setMessage('All data cleared successfully!');
                await loadStats();
            } else {
                setMessage(`Error: ${result.error}`);
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-white/10 rounded-xl text-slate-300 transition-colors cursor-pointer"
            >
                <Database size={16} />
                <span>Sample Data</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-panel w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200 shadow-2xl border border-white/10">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setShowConfirmClear(false);
                                setMessage('');
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
                        >
                            <X size={20} />
                        </button>

                        {showConfirmClear ? (
                            <div className="text-center py-4">
                                <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                    <Trash2 size={32} className="text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Confirm Removal</h3>
                                <p className="text-slate-300 mb-6 max-w-xs mx-auto">
                                    This will remove only the generated sample data. Your manually created events will be preserved.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setShowConfirmClear(false)}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors flex items-center gap-2"
                                    >
                                        {isLoading && <Loader2 className="animate-spin" size={16} />}
                                        Yes, Remove Data
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Manage Sample Data</h3>
                                    <button
                                        onClick={loadStats}
                                        disabled={isLoading}
                                        className="text-slate-400 hover:text-white transition-colors mr-8 p-1 rounded hover:bg-white/5"
                                        title="Refresh Stats"
                                    >
                                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                    </button>
                                </div>

                                {/* Stats Grid */}
                                {stats ? (
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                                            <div className="text-2xl font-bold text-white">{stats.events}</div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Events</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                                            <div className="text-2xl font-bold text-white">{stats.users}</div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Users</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                                            <div className="text-2xl font-bold text-white">{stats.menus}</div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Menus</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                                            <div className="text-2xl font-bold text-white">{stats.recipes}</div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Recipes</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">Loading statistics...</div>
                                )}

                                {/* Info Box */}
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                                    <div className="mt-1"><Wand2 size={16} className="text-blue-400" /></div>
                                    <div className="text-sm text-blue-200">
                                        <p className="font-semibold mb-1">Generate Realistic Test Data</p>
                                        <p className="opacity-80">Creates a complete dataset including 20 staff members, 8 clients, 5 menus, ~150 menu items, and recipes. Perfect for testing layouts.</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isLoading}
                                        className="btn-primary flex items-center justify-center gap-2 py-3"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                                        Generate Data
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmClear(true)}
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors font-medium"
                                    >
                                        <Trash2 size={18} />
                                        Clear Data
                                    </button>
                                </div>

                                {/* Status Message */}
                                {message && (
                                    <div className={`p-3 rounded-lg text-sm text-center ${message.includes('Error') ? 'bg-red-500/20 text-red-200 border border-red-500/20' : 'bg-green-500/20 text-green-200 border border-green-500/20'}`}>
                                        {message}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
