'use client';

import { useState } from 'react';
import { runMigration } from '@/lib/actions/db';
import { Loader2, Database, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; results?: any[]; error?: string } | null>(null);

    async function handleMigration() {
        if (!confirm('WARNING: This will execute SQL schema updates on the live database. Are you sure?')) {
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await runMigration();
            setResult(res);
        } catch (error) {
            setResult({ success: false, error: 'Unknown error occurred' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-white">System Settings</h1>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-warning">
                    <Database size={24} />
                    <h2 className="text-xl font-semibold text-white">Database Management</h2>
                </div>

                <p className="text-slate-400">
                    Manage the underlying database schema. Use this tool to apply new table definitions without accessing phpMyAdmin.
                </p>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="text-warning shrink-0 mt-1" size={20} />
                        <div>
                            <h3 className="text-white font-medium">Schema Update</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Reads <code>update_schema.sql</code> from the server and executes it. Safe to run multiple times (idempotent).
                            </p>

                            <button
                                onClick={handleMigration}
                                disabled={loading}
                                className="btn-primary bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={16} />
                                        Running Migration...
                                    </span>
                                ) : (
                                    'Update Database Schema'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {result && (
                    <div className={`mt-4 p-4 rounded-lg border ${result.success ? 'bg-success/10 border-success/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {result.success ? <CheckCircle className="text-success" size={20} /> : <XCircle className="text-red-500" size={20} />}
                            <h4 className={`font-medium ${result.success ? 'text-success' : 'text-red-500'}`}>
                                {result.success ? 'Migration Completed' : 'Migration Failed'}
                            </h4>
                        </div>

                        {result.error && (
                            <p className="text-red-400 text-sm font-mono">{result.error}</p>
                        )}

                        {result.results && (
                            <div className="space-y-1 mt-2">
                                {result.results.map((res, i) => (
                                    <div key={i} className="text-xs font-mono flex gap-2">
                                        <span className={res.status === 'success' ? 'text-success' : 'text-red-400'}>
                                            [{res.status.toUpperCase()}]
                                        </span>
                                        <span className="text-slate-400 truncate">{res.query}</span>
                                        {res.error && <span className="text-red-400">- {res.error}</span>}
                                    </div>
                                ))}
                                {result.results.length === 0 && (
                                    <p className="text-slate-500 text-xs italic">No statements executed (file might be empty or invalid).</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
