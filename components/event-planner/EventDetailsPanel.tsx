'use client';

import { Event } from '@/lib/data/types';
import GuestListGrid from '@/components/event-planner/GuestListGrid';
import { useState } from 'react';
import { Calendar, Users, MapPin, DollarSign, FileText } from 'lucide-react';

export function EventDetailsPanel({ event }: { event: Event }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'guests' | 'menu' | 'staff'>('overview');

    return (
        <div className="space-y-6 pb-12">
            {/* Tabs */}
            <div className="border-b border-white/10">
                <nav className="-mb-px flex space-x-6">
                    {['Overview', 'Guests', 'Menu', 'Staff'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase() as any)}
                            className={`
                                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.toLowerCase()
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-slate-400 text-xs uppercase mb-1">Date</div>
                            <div className="flex items-center gap-2 text-white">
                                <Calendar size={16} className="text-primary" />
                                {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-slate-400 text-xs uppercase mb-1">Guests</div>
                            <div className="flex items-center gap-2 text-white">
                                <Users size={16} className="text-primary" />
                                {event.guestCount || '-'}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-slate-400 text-xs uppercase mb-1">Location</div>
                            <div className="flex items-center gap-2 text-white">
                                <MapPin size={16} className="text-primary" />
                                {event.location || 'TBD'}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-slate-400 text-xs uppercase mb-1">Budget</div>
                            <div className="flex items-center gap-2 text-white">
                                <DollarSign size={16} className="text-primary" />
                                {event.estimatedBudget ? `$${event.estimatedBudget.toLocaleString()}` : '-'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-300">Notes</h3>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 whitespace-pre-wrap">
                            {event.notes || 'No notes available.'}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'guests' && (
                <div className="animate-in fade-in duration-300 h-full">
                    <GuestListGrid eventId={event.id} />
                </div>
            )}

            {activeTab === 'menu' && (
                <div className="animate-in fade-in duration-300">
                    <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-lg text-slate-500">
                        Menu management coming soon.
                        <br />
                        <span className="text-xs">Use the full event page for menu details.</span>
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className="animate-in fade-in duration-300">
                    <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-lg text-slate-500">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="mb-2">Manage staff assignments and open shifts.</p>
                        <a
                            href={`/dashboard/events/${event.id}`}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            Open Event Workspace
                        </a>
                    </div>
                </div>
            )}

            <div className="pt-6 border-t border-white/10">
                <a
                    href={`/dashboard/events/${event.id}`}
                    className="w-full btn-secondary text-center block"
                >
                    View Full Event Details
                </a>
            </div>
        </div>
    );
}
