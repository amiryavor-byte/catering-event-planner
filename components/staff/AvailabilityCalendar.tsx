'use client';

import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { StaffAvailability } from '@/lib/data/types';
import { addAvailability, deleteAvailability, requestTimeOff } from '@/lib/actions/availability';
import { GlassModal } from '@/components/ui/GlassModal';
import { Loader2, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';

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

interface AvailabilityCalendarProps {
    initialData: StaffAvailability[];
    userId: number;
}

export default function AvailabilityCalendar({ initialData, userId }: AvailabilityCalendarProps) {
    const [events, setEvents] = useState(initialData.map(transformToEvent));
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [formData, setFormData] = useState({
        type: 'available',
        startTime: '09:00',
        endTime: '17:00',
        isAllDay: true,
        reason: '',
        isRecurring: false,
    });

    function transformToEvent(av: StaffAvailability) {
        let start = new Date(av.date);
        let end = new Date(av.date);

        if (av.startTime && av.endTime) {
            const [startH, startM] = av.startTime.split(':').map(Number);
            const [endH, endM] = av.endTime.split(':').map(Number);
            start.setHours(startH, startM);
            end.setHours(endH, endM);
        } else {
            end.setHours(23, 59, 59);
        }

        let title = 'Available';
        if (av.type === 'is_unavailable' || av.type === 'unavailable') title = 'Unavailable';
        if (av.type === 'preferred_off') title = 'Preferred Off';

        return {
            id: av.id,
            title,
            start,
            end,
            allDay: !av.startTime,
            resource: av,
        };
    }

    const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
        setSelectedSlot({ start, end });
        setFormData({
            ...formData,
            isAllDay: true,
            startTime: '09:00',
            endTime: '17:00'
        });
        setIsDialogOpen(true);
    }, [formData]);

    const handleSave = async () => {
        if (!selectedSlot) return;
        setIsLoading(true);

        try {
            const dateStr = format(selectedSlot.start, 'yyyy-MM-dd');
            const entriesToCreate = [];

            if (formData.isRecurring) {
                // Create for next 8 weeks
                for (let i = 0; i < 8; i++) {
                    const nextDate = new Date(selectedSlot.start);
                    nextDate.setDate(nextDate.getDate() + (i * 7));
                    entriesToCreate.push(format(nextDate, 'yyyy-MM-dd'));
                }
            } else {
                entriesToCreate.push(dateStr);
            }

            for (const d of entriesToCreate) {
                if (formData.type === 'unavailable' && formData.reason) {
                    await requestTimeOff(d, formData.reason);
                } else {
                    await addAvailability({
                        date: d,
                        startTime: formData.isAllDay ? undefined : formData.startTime,
                        endTime: formData.isAllDay ? undefined : formData.endTime,
                        type: formData.type as 'available' | 'unavailable' | 'preferred_off',
                        reason: formData.reason
                    });
                }
            }

            // Reload to fetch fresh data
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Failed to save availability.");
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    const handleSelectEvent = useCallback(async (event: any) => {
        if (!confirm('Delete this availability entry?')) return;

        try {
            await deleteAvailability(event.id);
            window.location.reload();
        } catch (e) {
            alert("Failed to delete.");
        }
    }, []);

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '#3174ad';
        const type = event.resource.type;
        if (type === 'available') backgroundColor = '#10b981'; // Green
        if (type === 'unavailable' || type === 'is_unavailable') backgroundColor = '#ef4444'; // Red
        if (type === 'preferred_off') backgroundColor = '#f59e0b'; // Amber

        if (event.resource.status === 'pending') backgroundColor = '#6b7280'; // Gray

        return {
            style: {
                backgroundColor,
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
            <div className="flex justify-between items-center mb-4">

            </div>

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
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
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
                title="Set Availability"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Type</label>
                        <select
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="available">Available to Work</option>
                            <option value="preferred_off">Prefer Off</option>
                            <option value="unavailable">Unavailable / Time Off</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-300">All Day</label>
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                            checked={formData.isAllDay}
                            onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                        />
                    </div>

                    {!formData.isAllDay && (
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
                    )}

                    {formData.type !== 'available' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Reason (Optional)</label>
                            <textarea
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white min-h-[80px]"
                                placeholder="E.g., Doctor appointment"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <input
                            type="checkbox"
                            id="recurring"
                            className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                            checked={formData.isRecurring}
                            onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        />
                        <label htmlFor="recurring" className="text-sm text-slate-300">
                            Repeat this availability for the next 8 weeks
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
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="animate-spin" size={16} />}
                            Save Availability
                        </button>
                    </div>
                </div>
            </GlassModal>
        </div>
    );
}
