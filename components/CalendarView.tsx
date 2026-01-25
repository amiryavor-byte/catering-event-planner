"use client";

import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Event, BlackoutDate } from '@/lib/data/types';
import { updateEventDates } from '@/lib/actions/events';
import { useRouter } from 'next/navigation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Setup localizer
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

const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarViewProps {
    events: Event[];
    blackoutDates?: BlackoutDate[];
}

export default function CalendarView({ events, blackoutDates = [] }: CalendarViewProps) {
    const router = useRouter();
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());

    // Map domain events to big-calendar events
    const calendarEvents = useMemo(() => {
        const eventItems = events.map(e => ({
            id: e.id,
            title: e.name,
            start: e.startDate ? new Date(e.startDate) : new Date(),
            end: e.endDate ? new Date(e.endDate) : (e.startDate ? new Date(new Date(e.startDate).getTime() + 60 * 60 * 1000) : new Date()),
            resource: e,
            type: 'event'
        }));

        const blackoutItems = blackoutDates.map(b => ({
            id: `blackout-${b.id}`,
            title: b.description || 'Blackout',
            start: new Date(b.date),
            end: new Date(b.date),
            allDay: true,
            resource: b,
            type: 'blackout'
        }));

        return [...eventItems, ...blackoutItems];
    }, [events, blackoutDates]);

    const onEventResize = useCallback(
        async ({ event, start, end }: any) => {
            if (event.type === 'blackout') return; // Prevent resizing blackouts
            try {
                // Optimistic update could go here
                await updateEventDates(event.id, start, end);
            } catch (error) {
                console.error("Failed to resize event", error);
            }
        },
        []
    );

    const onEventDrop = useCallback(
        async ({ event, start, end }: any) => {
            if (event.type === 'blackout') return; // Prevent moving blackouts
            try {
                await updateEventDates(event.id, start, end);
            } catch (error) {
                console.error("Failed to drop event", error);
            }
        },
        []
    );

    const onSelectEvent = useCallback((event: any) => {
        if (event.type === 'blackout') return; // Ignore clicks on blackouts
        router.push(`/dashboard/events/${event.id}`);
    }, [router]);

    const eventStyleGetter = (event: any) => {
        if (event.type === 'blackout') {
            return {
                style: {
                    backgroundColor: '#1f2937', // dark slate
                    borderRadius: '4px',
                    opacity: 1,
                    color: '#9ca3af', // gray text
                    border: '1px hatched #374151',
                    display: 'block',
                    backgroundImage: 'repeating-linear-gradient(45deg, #1f2937, #1f2937 10px, #374151 10px, #374151 20px)'
                }
            };
        }

        const status = event.resource.status;
        let backgroundColor = '#3b82f6'; // primary default

        switch (status) {
            case 'approved':
            case 'active':
                backgroundColor = '#10b981'; // emerald
                break;
            case 'completed':
                backgroundColor = '#64748b'; // slate
                break;
            case 'inquiry':
                backgroundColor = '#f59e0b'; // amber
                break;
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div className="h-full w-full text-slate-800">
            {/* Custom Toolbar Styling needs global CSS or deep selectors, 
                 but standard toolbar works well for now. 
                 We wrap in a light container because react-big-calendar defaults are for light bg. */}

            <div className="h-[700px] bg-white rounded-xl shadow-sm p-4 text-sm">
                <DndProvider backend={HTML5Backend}>
                    <DnDCalendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor={(e: any) => e.start}
                        endAccessor={(e: any) => e.end}
                        view={view}
                        onView={setView} // Fixed: setView expects View type
                        date={date}
                        onNavigate={setDate}
                        onEventDrop={onEventDrop}
                        onEventResize={onEventResize}
                        onSelectEvent={onSelectEvent}
                        resizable
                        selectable
                        eventPropGetter={eventStyleGetter}
                        views={['month', 'week', 'day']}
                        className="details-calendar"
                    />
                </DndProvider>
            </div>
        </div>
    );
}
