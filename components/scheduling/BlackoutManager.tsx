'use client';

import { useState } from 'react';
import { BlackoutDate } from '@/lib/data/types';
import { addBlackoutDate, deleteBlackoutDate } from '@/lib/actions/availability';
import { Trash2, AlertTriangle, Globe, User, Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BlackoutManagerProps {
    blackoutDates: BlackoutDate[];
    userRole?: string;
    userId?: number;
}

export default function BlackoutManager({ blackoutDates, userRole = 'staff', userId }: BlackoutManagerProps) {
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [isGlobal, setIsGlobal] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!date || !description) return;
        setLoading(true);
        try {
            await addBlackoutDate(date, description, isGlobal);
            setDate('');
            setDescription('');
            if (userRole !== 'admin') setIsGlobal(false);
        } catch (error) {
            console.error(error);
            alert("Failed to add blackout date");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Remove this blackout date?')) return;
        await deleteBlackoutDate(id);
    }

    // Sort: Global first, then by date
    const sortedDates = [...blackoutDates].sort((a, b) => {
        if (a.isGlobal && !b.isGlobal) return -1;
        if (!a.isGlobal && b.isGlobal) return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const isAdmin = userRole === 'admin';

    // Users can see global dates + their own dates
    // If Admin, they see everything potentially, but for now let's show all global + owned?
    // Actually getBlackoutDates usually returns all.
    // We should filter for display if necessary, but "Whole company blackout dates that all users see" implies visibility.
    // Personal dates of OTHERS ideally shouldn't be seen by me unless I'm admin.
    // But for this component (Personal View), I should see Mine + Global.

    const visibleDates = sortedDates.filter(d => d.isGlobal || d.userId === userId || (isAdmin && d.userId));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form */}
                <div className="md:col-span-1">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4 sticky top-4">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Plus size={18} /> Add Time Off
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Reason / Description</label>
                                <textarea
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm"
                                    rows={3}
                                    placeholder="e.g. Vacation, Doctor Appt..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            {isAdmin && (
                                <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isGlobal}
                                        onChange={e => setIsGlobal(e.target.checked)}
                                        className="accent-primary w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-white flex items-center gap-2">
                                        <Globe size={14} className={isGlobal ? "text-primary" : "text-slate-400"} />
                                        Company-wide Blackout
                                    </span>
                                </label>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isGlobal
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'btn-primary'
                                    }`}
                            >
                                {loading && <Loader2 className="animate-spin" size={16} />}
                                {isGlobal ? 'Block Company-wide' : 'Request Time Off'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-3">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                        <CalendarIcon size={18} /> Upcoming Blackout Dates
                    </h3>

                    {visibleDates.length === 0 && (
                        <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                            <p className="text-slate-500">No blackout dates found.</p>
                        </div>
                    )}

                    {visibleDates.map(item => {
                        const isOwner = item.userId === userId || (isAdmin && item.isGlobal); // Admin owns global
                        // Admin can delete any? Yes.
                        const canDelete = isAdmin || item.userId === userId;

                        return (
                            <div
                                key={item.id}
                                className={`p-4 rounded-xl border flex items-center justify-between ${item.isGlobal
                                        ? 'bg-red-950/20 border-red-500/20'
                                        : 'bg-white/5 border-white/5'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${item.isGlobal ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                                        {item.isGlobal ? <Globe size={20} /> : <User size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-white text-lg font-medium">
                                                {format(new Date(item.date), 'MMMM d, yyyy')}
                                            </span>
                                            {item.isGlobal && (
                                                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                                    Global
                                                </span>
                                            )}
                                        </div>
                                        <p className={`${item.isGlobal ? 'text-red-200' : 'text-slate-400'}`}>
                                            {item.description}
                                        </p>
                                        {!item.isGlobal && isAdmin && item.userId && (
                                            <p className="text-xs text-slate-500 mt-1">User ID: {item.userId}</p>
                                        )}
                                    </div>
                                </div>

                                {canDelete && (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
