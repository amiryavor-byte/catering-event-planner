'use client';

import { approveTimeOff } from '@/lib/actions/availability';
import { StaffAvailability, User } from '@/lib/data/types';
import { Check, X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';


type RequestWithUser = StaffAvailability & { user: Partial<User> };

interface RequestApprovalListProps {
    requests: RequestWithUser[];
}

export default function RequestApprovalList({ requests }: RequestApprovalListProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleAction = async (id: number, approved: boolean) => {
        setLoadingId(id);
        try {
            await approveTimeOff(id, approved);
            // Router refresh handled by revalidatePath in server action, but visual feedback helps
        } catch (error) {
            alert('Action failed');
        } finally {
            setLoadingId(null);
        }
    };

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                <Check className="mb-4 h-12 w-12 opacity-20" />
                <p>No pending time-off requests.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800">
                    <div className="flex gap-4 items-start">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 flex items-center justify-center font-bold">
                            {req.user.name?.[0] || '?'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{req.user.name || 'Unknown User'}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {req.date ? format(new Date(req.date), 'MMM d, yyyy') : 'No Date'}
                                </span>
                                {req.startTime ? (
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {req.startTime} - {req.endTime}
                                    </span>
                                ) : (
                                    <span className="badge badge-outline text-xs border border-slate-600 px-1 rounded">All Day</span>
                                )}
                            </div>
                            {req.reason && (
                                <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded flex items-start gap-2">
                                    <AlertCircle size={14} className="mt-0.5" />
                                    {req.reason}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction(req.id, false)}
                            disabled={loadingId === req.id}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50"
                            title="Reject"
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={() => handleAction(req.id, true)}
                            disabled={loadingId === req.id}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors disabled:opacity-50"
                            title="Approve"
                        >
                            <Check size={20} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
