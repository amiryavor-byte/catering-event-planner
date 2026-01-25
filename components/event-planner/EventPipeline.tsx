'use client';

import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Event } from '@/lib/data/types';
import { updateEventStatus } from '@/lib/actions/events';
import { Calendar, Users, DollarSign, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EVENT_TYPE = 'EVENT_CARD';

const COLUMNS = [
    { id: 'inquiry', label: 'Inquiry', color: 'bg-slate-500/20 text-slate-400' },
    { id: 'quote', label: 'Quote Sent', color: 'bg-yellow-500/20 text-yellow-500' },
    { id: 'approved', label: 'Approved', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'active', label: 'Active', color: 'bg-green-500/20 text-green-400' },
    { id: 'completed', label: 'Completed', color: 'bg-purple-500/20 text-purple-400' }
];

interface EventPipelineProps {
    events: Event[];
    onEventClick?: (event: Event) => void;
}

export function EventPipeline({ events, onEventClick }: EventPipelineProps) {
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex gap-4 h-full overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                    <PipelineColumn
                        key={col.id}
                        column={col}
                        events={events.filter(e => (e.status || 'inquiry') === col.id)}
                        onEventClick={onEventClick}
                    />
                ))}
            </div>
        </DndProvider>
    );
}

function PipelineColumn({ column, events, onEventClick }: { column: typeof COLUMNS[0], events: Event[], onEventClick?: (e: Event) => void }) {
    const [, drop] = useDrop(() => ({
        accept: EVENT_TYPE,
        drop: (item: { id: number }) => handleDrop(item.id, column.id),
    }));

    const handleDrop = async (id: number, status: string) => {
        await updateEventStatus(id, status as any); // Type cast as actions are loose
    };

    return (
        <div ref={drop as any} className="flex-none w-72 flex flex-col bg-slate-900/50 rounded-xl border border-white/5 h-full">
            <div className={`p-4 border-b border-white/5 flex justify-between items-center ${column.color}`}>
                <h3 className="font-semibold">{column.label}</h3>
                <span className="text-xs bg-black/20 px-2 py-1 rounded-full">{events.length}</span>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]">
                {events.map(event => (
                    <DraggableEventCard key={event.id} event={event} onClick={() => onEventClick && onEventClick(event)} />
                ))}
            </div>
        </div>
    );
}

function DraggableEventCard({ event, onClick }: { event: Event, onClick?: () => void }) {
    const router = useRouter();
    const [{ isDragging }, drag] = useDrag(() => ({
        type: EVENT_TYPE,
        item: { id: event.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag as any}
            onClick={() => onClick ? onClick() : router.push(`/dashboard/events/${event.id}`)}
            className={`
                p-3 rounded-lg border border-white/5 bg-slate-800/80 hover:bg-slate-800 hover:border-white/10 
                cursor-pointer transition-all active:cursor-grabbing group shadow-sm
                ${isDragging ? 'opacity-50' : 'opacity-100'}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-slate-200 text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {event.name}
                </h4>
                <GripVertical size={14} className="text-slate-600 opacity-0 group-hover:opacity-100" />
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={12} />
                    <span>{event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users size={12} />
                    <span>{event.guestCount || '-'} guests</span>
                </div>
                {event.estimatedBudget && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <DollarSign size={12} />
                        <span>${event.estimatedBudget.toLocaleString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
