'use client';

import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BlackoutDate } from '@/lib/data/types';
import { addBlackoutDate, deleteBlackoutDate } from '@/lib/actions/availability';
import { GlassModal } from '@/components/ui/GlassModal';
import { Loader2, Trash2 } from 'lucide-react';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface BlackoutCalendarProps {
    initialData: BlackoutDate[];
    currentUserId: number;
}

export default function BlackoutCalendar({ initialData, currentUserId }: BlackoutCalendarProps) {
    const [events, setEvents] = useState(initialData.map(transformToEvent));
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [formData, setFormData] = useState({
        description: '',
        isGlobal: true,
    });

    function transformToEvent(bd: BlackoutDate) {
        // Blackouts are full day
        const start = new Date(bd.date);
        const end = new Date(bd.date);
        end.setHours(23, 59, 59);

        return {
            id: bd.id,
            title: bd.description || (bd.isGlobal ? 'Global Blackout' : 'Personal Blackout'),
            start,
            end,
            allDay: true,
            resource: bd,
        };
    }

    const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
        setSelectedSlot({ start, end });
        setFormData({
            description: '',
            isGlobal: true,
        });
        setIsDialogOpen(true);
    }, []);

    const handleSave = async () => {
        if (!selectedSlot) return;
        setIsLoading(true);

        try {
            const dateStr = format(selectedSlot.start, 'yyyy-MM-dd');
            await addBlackoutDate(dateStr, formData.description, formData.isGlobal);

            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Failed to save blackout date.");
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    const handleSelectEvent = useCallback(async (event: any) => {
        if (!confirm(`Delete blackout date "${event.title}"?`)) return;

        try {
            await deleteBlackoutDate(event.id);
            window.location.reload();
        } catch (e) {
            alert("Failed to delete.");
        }
    }, []);

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '#1f2937'; // Slate 800
        if (event.resource.isGlobal) backgroundColor = '#000000'; // Black for global

        return {
            style: {
                backgroundColor,
                opacity: 0.9,
                color: 'white',
                border: '1px solid #374151',
                display: 'block'
            }
        };
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow p-4 text-slate-900 dark:text-slate-100 overflow-hidden">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    views={[Views.MONTH]}
                    view={view}
                    date={date}
                    onView={setView}
                    onNavigate={setDate}
                    eventPropGetter={eventStyleGetter}
                />
            </div>

            <GlassModal
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Add Blackout Date"
            >
                <div className="space-y-4">
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-200">
                        Blackout dates prevent events from being scheduled and warn when assigning staff.
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <input
                            type="text"
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white placeholder-slate-500"
                            placeholder="e.g. National Holiday, Closed for Renovations"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isGlobal"
                            className="w-5 h-5 rounded border-gray-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                            checked={formData.isGlobal}
                            onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                        />
                        <label htmlFor="isGlobal" className="text-sm text-slate-300">
                            Global Blackout (Applies to all staff & events)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setIsDialogOpen(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="animate-spin" size={16} />}
                            Add Blackout Date
                        </button>
                    </div>
                </div>
            </GlassModal>
        </div>
    );
}
