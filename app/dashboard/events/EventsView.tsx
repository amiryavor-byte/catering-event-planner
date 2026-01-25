'use client';

import { useState } from 'react';
import { Event } from '@/lib/data/types';
import EventList from '@/app/dashboard/events/EventList';
import { EventPipeline } from '@/components/event-planner/EventPipeline';
import { LayoutList, Kanban, Plus, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { SlideOver } from '@/components/ui/DetailSidebar';
import { EventDetailsPanel } from '@/components/event-planner/EventDetailsPanel';

interface EventsViewProps {
    events: Event[];
}

export function EventsView({ events }: EventsViewProps) {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || 'staff';

    const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Calendar Stats Calculation
    const stats = {
        total: events.length,
        active: events.filter(e => e.status === 'active').length,
        pending: events.filter(e => e.status === 'inquiry' || e.status === 'quote').length,
        completed: events.filter(e => e.status === 'completed').length
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <header className="flex justify-between items-end mb-8 flex-none">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
                    <p className="text-slate-400">Manage catering events and track progress.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex p-1 bg-slate-900 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutList size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'pipeline' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Kanban size={20} />
                        </button>
                    </div>
                    {role !== 'staff' && (
                        <Link href="/dashboard/events/new" className="btn-primary flex items-center gap-2">
                            <Plus size={18} /> New Event
                        </Link>
                    )}
                </div>
            </header>

            {/* Stats Overview */}
            < div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 flex-none`
            }>
                <div className="card">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-400 text-sm font-medium">Total Events</h3>
                        <Calendar size={18} className="text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-400 text-sm font-medium">Active Events</h3>
                        <Clock size={18} className="text-success" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.active}</p>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-400 text-sm font-medium">Pending</h3>
                        <Clock size={18} className="text-warning" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.pending}</p>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-400 text-sm font-medium">Completed</h3>
                        <Calendar size={18} className="text-slate-500" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.completed}</p>
                </div>
            </div >

            {/* Content Area */}
            < div className="flex-1 min-h-0 overflow-hidden flex flex-col" >
                {viewMode === 'list' ? (
                    <EventList events={events} onEventClick={setSelectedEvent} />
                ) : (
                    <EventPipeline events={events} onEventClick={setSelectedEvent} />
                )}
            </div >

            <SlideOver
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                title={selectedEvent?.name}
            >
                {selectedEvent && <EventDetailsPanel event={selectedEvent} />}
            </SlideOver>
        </div >
    );
}
