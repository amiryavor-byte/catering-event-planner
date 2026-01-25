'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import CalendarView from '@/components/CalendarView';
import AvailabilityManager from './AvailabilityManager';
import ResourceSidebar from '@/components/ResourceSidebar';
import { BlackoutDate, Event } from '@/lib/data/types';

interface CalendarTabsProps {
    events: Event[];
    blackoutDates: BlackoutDate[];
    userRole?: string;
    userId?: number;
}

export default function CalendarTabs({ events, blackoutDates, userRole, userId }: CalendarTabsProps) {
    const [activeTab, setActiveTab] = useState<'calendar' | 'availability'>('calendar');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-1">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'calendar'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        <Calendar size={16} />
                        Event Calendar
                    </button>
                    <button
                        onClick={() => setActiveTab('availability')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'availability'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        <Clock size={16} />
                        Availability & Blackouts
                    </button>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
                        <div className="lg:col-span-3">
                            <CalendarView events={events} blackoutDates={blackoutDates} />
                        </div>
                        <div className="lg:col-span-1">
                            <ResourceSidebar />
                        </div>
                    </div>
                )}

                {activeTab === 'availability' && (
                    <AvailabilityManager
                        blackoutDates={blackoutDates}
                        userRole={userRole}
                        userId={userId}
                    />
                )}
            </div>
        </div>
    );
}
