'use client';

import { useState } from 'react';
import { assignStaffToEvent, removeStaffFromEvent } from '@/lib/actions/event-planning';
import { Trash2, UserPlus, Users, AlertTriangle } from 'lucide-react';
import { StaffAvailability, BlackoutDate } from '@/lib/data/types';
import { format } from 'date-fns';

interface StaffMember {
    id: number;
    name: string;
    jobTitle?: string | null;
    hourlyRate?: number | null;
}

interface AssignedStaff {
    id: number; // assignment id
    userId: number;
    role: string | null;
    user: {
        name: string;
        jobTitle?: string | null;
        hourlyRate?: number | null;
    }
}

export default function StaffManager({
    eventId,
    assignedStaff,
    allStaff,
    allAvailability = [],
    blackoutDates = [],
    eventDate
}: {
    eventId: number;
    assignedStaff: AssignedStaff[];
    allStaff: StaffMember[];
    allAvailability?: StaffAvailability[];
    blackoutDates?: BlackoutDate[];
    eventDate?: string | Date | null;
}) {
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [role, setRole] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Calculate costs
    const totalHourlyCost = assignedStaff.reduce((sum, s) => sum + (s.user.hourlyRate || 0), 0);
    const estimatedShiftLength = 5; // Default assumption for display, maybe configurable later
    const estimatedTotalLabor = totalHourlyCost * estimatedShiftLength;

    const eventDateStr = eventDate ? format(new Date(eventDate), 'yyyy-MM-dd') : null;

    const checkConflict = (userId: number) => {
        if (!eventDateStr) return null;

        // Check Global Blackout
        const globalBlackout = blackoutDates.find(b => b.isGlobal && b.date === eventDateStr);
        if (globalBlackout) return { type: 'error', message: `Global Blackout: ${globalBlackout.description}` };

        // Check Personal Blackout
        const personalBlackout = blackoutDates.find(b => !b.isGlobal && b.userId === userId && b.date === eventDateStr);
        if (personalBlackout) return { type: 'error', message: `Blackout: ${personalBlackout.description}` };

        // Check Availability
        const availability = allAvailability.find(a => a.userId === userId && a.date === eventDateStr);
        if (availability) {
            if (availability.type === 'unavailable') {
                return { type: 'error', message: availability.reason ? `Unavailable: ${availability.reason}` : 'Unavailable' };
            }
            if (availability.type === 'preferred_off') {
                return { type: 'warning', message: 'Prefers Off' };
            }
        }

        return null;
    };

    const handleAssign = async () => {
        if (!selectedStaffId) return;

        // Confirmation if conflict
        const conflict = checkConflict(parseInt(selectedStaffId));
        if (conflict && conflict.type === 'error') {
            if (!confirm(`Warning: This staff member has a conflict: ${conflict.message}. Assign anyway?`)) {
                return;
            }
        }

        await assignStaffToEvent({
            eventId,
            userId: parseInt(selectedStaffId),
            role: role || undefined
        });
        setIsAdding(false);
        setSelectedStaffId('');
        setRole('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Staffing
                    </h3>
                    <p className="text-slate-400 text-sm">Assign team members to this event.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <UserPlus size={16} /> Add Staff
                </button>
            </div>

            {/* Add Staff Form */}
            {isAdding && (
                <div className="card bg-white/5 border border-primary/20 p-4 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Staff Member</label>
                            <select
                                className="input-field w-full"
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                            >
                                <option value="">Select Staff...</option>
                                {allStaff
                                    .filter(s => !assignedStaff.some(as => as.userId === s.id))
                                    .map(s => {
                                        const conflict = checkConflict(s.id);
                                        return (
                                            <option key={s.id} value={s.id} className={conflict?.type === 'error' ? 'text-red-400' : ''}>
                                                {s.name} {conflict ? `(${conflict.message})` : ''} - ${s.hourlyRate || 0}/hr
                                            </option>
                                        );
                                    })}
                            </select>
                            {selectedStaffId && (() => {
                                const conflict = checkConflict(parseInt(selectedStaffId));
                                if (conflict) return (
                                    <div className={`text-xs mt-1 flex items-center gap-1 ${conflict.type === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                                        <AlertTriangle size={12} /> {conflict.message}
                                    </div>
                                );
                            })()}
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Role Override (Optional)</label>
                            <input
                                type="text"
                                className="input-field w-full"
                                placeholder="e.g. Lead Server"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAssign} disabled={!selectedStaffId} className="btn-primary flex-1">
                                Confirm
                            </button>
                            <button onClick={() => setIsAdding(false)} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff List */}
            <div className="space-y-2">
                {assignedStaff.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-slate-500">No staff assigned yet.</p>
                    </div>
                ) : (
                    assignedStaff.map((staff) => {
                        const conflict = checkConflict(staff.userId);
                        return (
                            <div key={staff.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                        {staff.user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium">{staff.user.name}</p>
                                            {conflict && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${conflict.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                    <AlertTriangle size={10} /> {conflict.message}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {staff.role || staff.user.jobTitle || 'Staff'} • ${staff.user.hourlyRate || 0}/hr
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeStaffFromEvent(staff.id, eventId)}
                                    className="p-2 text-slate-500 hover:text-error hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary Footer */}
            {assignedStaff.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                        <p className="text-xs text-slate-500">Team Size</p>
                        <p className="text-xl font-bold text-white">{assignedStaff.length} People</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Est. Labor Cost ({estimatedShiftLength}hrs)</p>
                        <p className="text-xl font-bold text-success">${estimatedTotalLabor.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-600">Based on ${totalHourlyCost}/hr total rate</p>
                    </div>
                </div>
            )}
        </div>
    );
}
