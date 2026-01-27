'use client';

import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-overrides.css'; // We'll create this next
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

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

interface Event {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource?: any;
    status?: string;
}

interface DashboardCalendarProps {
    events: Event[];
}

// Custom Toolbar
const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };

    const label = () => {
        const date = toolbar.date;
        return (
            <span className="text-lg font-bold text-white capitalize">
                {format(date, 'MMMM yyyy')}
            </span>
        );
    };

    return (
        <div className="flex items-center justify-between mb-4 p-2">
            <div className="flex items-center gap-4">
                {label()}
                <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                    <button onClick={goToBack} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={goToCurrent} className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                        Today
                    </button>
                    <button onClick={goToNext} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="hidden sm:flex gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Confimed</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Quote</div>
            </div>
        </div>
    );
};

export function DashboardCalendar({ events }: DashboardCalendarProps) {
    const [view, setView] = useState<View>(Views.MONTH);
    const router = useRouter();

    const eventStyleGetter = (event: Event) => {
        let backgroundColor = '#6366f1'; // Default Indigo
        if (event.status === 'confirmed') backgroundColor = '#10b981'; // Emerald
        if (event.status === 'quote') backgroundColor = '#f59e0b'; // Amber
        if (event.status === 'inquiry') backgroundColor = '#8b5cf6'; // Violet

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '0.75rem',
            },
        };
    };

    const handleSelectEvent = (event: Event) => {
        // Navigate to the event planner/details page
        router.push(`/dashboard/events/${event.id}`);
    };

    return (
        <div className="h-full min-h-[600px] text-slate-300 font-sans p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', minHeight: '500px' }}
                views={['month', 'week', 'day', 'agenda']}
                view={view}
                onView={setView}
                onSelectEvent={handleSelectEvent}
                tooltipAccessor={(e) => `${e.title} (${e.status})`}
                popup={true}
                components={{
                    toolbar: CustomToolbar,
                }}
                eventPropGetter={eventStyleGetter}
            />
        </div>
    );
}
