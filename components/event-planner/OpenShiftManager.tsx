'use client';

import { useState } from 'react';
import { OpenShift, ShiftBid, User } from '@/lib/data/types';
import { postOpenShift, approveShiftBid, deleteOpenShift } from '@/lib/actions/availability';
import { GlassModal } from '@/components/ui/GlassModal';
import { Loader2, Plus, Clock, User as UserIcon, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ShiftWithBids extends OpenShift {
    bids: (ShiftBid & { user: User | Partial<User> })[]; // User might be partial if not fully fetched
}

interface OpenShiftManagerProps {
    eventId: number;
    initialShifts: ShiftWithBids[];
}

export default function OpenShiftManager({ eventId, initialShifts }: OpenShiftManagerProps) {
    const [shifts, setShifts] = useState(initialShifts); // In real app, might just rely on props if parent refreshes
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [approvingId, setApprovingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        role: 'Server',
        description: '',
        startTime: '',
        endTime: ''
    });

    const handlePostShift = async () => {
        setIsLoading(true);
        try {
            await postOpenShift(eventId, formData.role, formData.description, formData.startTime, formData.endTime);
            window.location.reload(); // Simple refresh for prototype
        } catch (error) {
            alert("Failed to post shift");
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    const handleApprove = async (bidId: number) => {
        setApprovingId(bidId);
        try {
            await approveShiftBid(bidId);
            window.location.reload();
        } catch (error) {
            alert("Failed to approve bid");
        } finally {
            setApprovingId(null);
        }
    };

    const handleDelete = async (shiftId: number) => {
        if (!confirm('Are you sure you want to delete this shift?')) return;
        try {
            await deleteOpenShift(shiftId);
            window.location.reload();
        } catch (error) {
            alert("Failed to delete shift");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Open Shifts</h3>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Post Shift
                </button>
            </div>

            <div className="grid gap-4">
                {initialShifts.length === 0 && (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                        No open shifts posted for this event.
                    </div>
                )}

                {initialShifts.map((shift) => (
                    <div key={shift.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                    {shift.role}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${shift.status === 'open' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}`}>
                                        {shift.status.toUpperCase()}
                                    </span>
                                </h4>
                                <div className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                                    <Clock size={14} />
                                    {shift.startTime || 'Start TBD'} - {shift.endTime || 'End TBD'}
                                </div>
                                {shift.description && (
                                    <p className="text-slate-300 mt-2 text-sm">{shift.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(shift.id)}
                                className="text-slate-500 hover:text-red-400 p-1"
                                title="Delete Shift"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Bids Section */}
                        <div className="bg-black/20 rounded-lg p-3">
                            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Applications ({shift.bids.length})
                            </h5>

                            {shift.bids.length === 0 ? (
                                <span className="text-sm text-slate-600 italic">No bids yet</span>
                            ) : (
                                <div className="space-y-2">
                                    {shift.bids.map((bid) => (
                                        <div key={bid.id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                                                    {bid.user.name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-medium">{bid.user.name}</p>
                                                    {bid.notes && <p className="text-xs text-slate-400">"{bid.notes}"</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {bid.status === 'approved' ? (
                                                    <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-900/20 rounded">Approved</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApprove(bid.id)}
                                                        disabled={approvingId === bid.id || shift.status !== 'open'}
                                                        className="p-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded transition-colors disabled:opacity-30"
                                                        title="Approve"
                                                    >
                                                        {approvingId === bid.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <GlassModal
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Post Open Shift"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Role Needed</label>
                        <select
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Server">Server</option>
                            <option value="Bartender">Bartender</option>
                            <option value="Chef">Chef</option>
                            <option value="Cook">Cook</option>
                            <option value="Captain">Event Captain</option>
                            <option value="Dishwasher">Dishwasher</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Start Time</label>
                            <input
                                type="time"
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">End Time</label>
                            <input
                                type="time"
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Description / Requirements</label>
                        <textarea
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white min-h-[80px]"
                            placeholder="e.g. Must experience with cocktail mixing..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setIsDialogOpen(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePostShift}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="animate-spin" size={16} />}
                            Post Shift
                        </button>
                    </div>
                </div>
            </GlassModal>
        </div>
    );
}
