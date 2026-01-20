'use client';

import { useState } from 'react';
import { parseStaffList, parseMenuFile } from '@/lib/actions/setup';
import { Upload, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function SetupPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [staffResult, setStaffResult] = useState<{ added: number, tasks: number } | null>(null);

    async function handleStaffUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await parseStaffList(formData);
        setLoading(false);
        if (res.success) {
            setStaffResult({ added: res.added, tasks: res.tasks });
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 p-6">
            <div className="glass-panel w-full max-w-2xl p-10 animate-in fade-in zoom-in duration-500">

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        CaterPlan Setup
                    </h1>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-2 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-slate-700'}`} />
                        ))}
                    </div>
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl text-white font-semibold">Step 1: Company Branding</h2>
                        <div className="grid gap-4">
                            <label className="block">
                                <span className="text-slate-400 text-sm">Company Name</span>
                                <input type="text" className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" placeholder="e.g. Elite Catering Co." />
                            </label>
                            <label className="block">
                                <span className="text-slate-400 text-sm">Primary Brand Color</span>
                                <div className="flex gap-4 mt-2">
                                    <input type="color" className="h-10 w-20 bg-transparent border-none cursor-pointer" defaultValue="#6366f1" />
                                    <span className="text-slate-500 text-sm self-center">Pick a color to theme your dashboard.</span>
                                </div>
                            </label>
                        </div>
                        <button onClick={() => setStep(2)} className="btn-primary w-full">Next: Import Data</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl text-white font-semibold">Step 2: Import Staff</h2>
                        <p className="text-slate-400 text-sm">Upload your existing staff roster (Excel, CSV). Our AI will create accounts for them automatically.</p>

                        {!staffResult ? (
                            <form onSubmit={handleStaffUpload} className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-white/5">
                                <input type="file" name="file" className="hidden" id="staff-file" accept=".csv,.txt,.xlsx" />
                                <label htmlFor="staff-file" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload className="text-slate-400" size={32} />
                                    <span className="text-white font-medium">Click to Upload Roster</span>
                                    <span className="text-slate-500 text-xs">Supports .CSV, .XLSX</span>
                                </label>
                                {loading && <div className="mt-4 text-primary flex justify-center items-center gap-2"><Loader2 className="animate-spin" /> AI Processing...</div>}
                                {!loading && <button type="submit" className="mt-4 text-xs text-primary underline">Simulate Upload</button>}
                            </form>
                        ) : (
                            <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex gap-4 items-start">
                                <Check className="text-success mt-1" />
                                <div>
                                    <p className="text-white font-medium">Success!</p>
                                    <p className="text-slate-300 text-sm">Added {staffResult.added} staff members.</p>
                                    {staffResult.tasks > 0 && (
                                        <p className="text-warning text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> Generated {staffResult.tasks} tasks for missing info.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white px-4">Back</button>
                            <button onClick={() => setStep(3)} className="btn-primary flex-1">Next: Import Menus</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl text-white font-semibold">Step 3: Import Menus</h2>
                        <p className="text-slate-400 text-sm">Upload PDF menus. AI will extract dishes and ingredients.</p>

                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-white/5 opacity-50">
                            <p className="text-slate-500">Menu Parsing Module (Coming Soon)</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white px-4">Back</button>
                            <button onClick={() => window.location.href = '/dashboard'} className="btn-primary flex-1 bg-gradient-to-r from-success to-emerald-600">Finish Setup</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
