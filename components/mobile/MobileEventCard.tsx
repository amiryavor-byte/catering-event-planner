'use client';

import { Event } from '@/lib/data/types';
import { updateEventStatus } from '@/lib/actions/events';
import { MapPin, Users, Clock, CheckCircle } from 'lucide-react';
import { useTransition } from 'react';

interface MobileEventCardProps {
    event: Event;
}

export default function MobileEventCard({ event }: MobileEventCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleStatusUpdate = (status: Event['status']) => {
        startTransition(async () => {
            await updateEventStatus(event.id, status);
        });
    };

    const statusConfig = {
        active: { label: 'Setup', next: 'active' }, // Assuming 'active' is the first phase for captains? Or 'setup'?
        // The Prompt says: "Setup, Service, Cleanup"
        // The Event type has: 'inquiry' | 'quote' | 'approved' | 'active' | 'completed'
        // This mapping is imperfect. Let's assume:
        // 'approved' -> Ready for Setup
        // 'active' -> In Progress (Service)
        // 'completed' -> Done
        // But the prompt wants explicit toggles for "Setup, Service, Cleanup".
        // Use local state or maybe mapping to 'active' implies ongoing service?
        // Let's stick to the Event type for now.
        // If the user wants specific sub-statuses, we might need a richer model.
        // For now, I'll toggle between 'approved' (Needs Setup), 'active' (Service), 'completed' (Cleanup/Done).
    };

    // Helper to determine active phase visuals
    const isActive = event.status === 'active';
    const isCompleted = event.status === 'completed';
    const isApproved = event.status === 'approved';

    const formatTime = (dateStr?: string | null) => {
        if (!dateStr) return 'TBD';
        return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="glass-card-3d mb-6 relative overflow-hidden group">
            {/* Neon Border Glow based on status */}
            <div className={`absolute top-0 left-0 w-1 h-full
                ${isActive ? 'bg-[var(--success)] shadow-[0_0_15px_var(--success)]' :
                    isCompleted ? 'bg-slate-600' :
                        'bg-[var(--primary)] shadow-[0_0_15px_var(--primary)]'}
            `}></div>

            <div className="pl-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {event.eventType || 'Event'}
                    </span>
                    <span className={`text-sm font-bold tracking-wider ${isActive ? 'text-[var(--success)] animate-pulse' : 'text-slate-400'}`}>
                        {isActive ? 'LIVE NOW' : isCompleted ? 'COMPLETED' : formatTime(event.startDate)}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>

                <div className="flex items-center text-slate-400 text-sm mb-4 space-x-4">
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-[var(--secondary)]" />
                        {event.location || 'No Location'}
                    </div>
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-[var(--accent)]" />
                        {event.guestCount || 0} Guests
                    </div>
                </div>

                {/* Status Toggles */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                    <button
                        disabled={isPending} // Always clickable to revert?
                        onClick={() => handleStatusUpdate('approved')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                            ${event.status === 'approved'
                                ? 'bg-[rgba(99,102,241,0.2)] border-[var(--primary)] text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                                : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'}
                        `}
                    >
                        <div className="w-full h-1 bg-slate-600 rounded-full mb-2 overflow-hidden">
                            <div className={`h-full bg-[var(--primary)] transition-all duration-500 ${event.status === 'approved' ? 'w-full' : 'w-0'}`}></div>
                        </div>
                        <span className="text-xs font-bold uppercase">Setup</span>
                    </button>

                    <button
                        disabled={isPending}
                        onClick={() => handleStatusUpdate('active')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                            ${event.status === 'active'
                                ? 'bg-[rgba(52,211,153,0.2)] border-[var(--success)] text-white shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                                : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'}
                        `}
                    >
                        <div className="w-full h-1 bg-slate-600 rounded-full mb-2 overflow-hidden">
                            <div className={`h-full bg-[var(--success)] transition-all duration-500 ${event.status === 'active' ? 'w-full' : 'w-0'}`}></div>
                        </div>
                        <span className="text-xs font-bold uppercase">Service</span>
                    </button>

                    <button
                        disabled={isPending}
                        onClick={() => handleStatusUpdate('completed')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                            ${event.status === 'completed'
                                ? 'bg-[rgba(148,163,184,0.2)] border-slate-400 text-white shadow-[0_0_10px_rgba(148,163,184,0.3)]'
                                : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'}
                        `}
                    >
                        <div className="w-full h-1 bg-slate-600 rounded-full mb-2 overflow-hidden">
                            <div className={`h-full bg-slate-400 transition-all duration-500 ${event.status === 'completed' ? 'w-full' : 'w-0'}`}></div>
                        </div>
                        <span className="text-xs font-bold uppercase">Cleanup</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
