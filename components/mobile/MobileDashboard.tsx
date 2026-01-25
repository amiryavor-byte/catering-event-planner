'use client';

import { useState } from 'react';
import { Event } from '@/lib/data/types';
import MobileBottomNav from './MobileBottomNav';
import MobileEventCard from './MobileEventCard';

interface MobileDashboardProps {
    todayEvents: Event[];
}

export default function MobileDashboard({ todayEvents }: MobileDashboardProps) {
    const [activeTab, setActiveTab] = useState<'schedule' | 'staff' | 'menu'>('schedule');

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24 text-white">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[var(--heavy-glass-bg)] backdrop-blur-md border-b border-[var(--glass-border)] px-6 py-4">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Catering Captain</p>
                        <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
                            {activeTab === 'schedule' && "Today's Events"}
                            {activeTab === 'staff' && "Staff Roster"}
                            {activeTab === 'menu' && "Menu & Prep"}
                        </h1>
                    </div>
                    {/* User Avatar / Status Indicator */}
                    <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] shadow-[0_0_15px_rgba(99,102,241,0.5)] border-2 border-[var(--background)] flex items-center justify-center text-sm font-bold">
                            CC
                        </div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[var(--background)]"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 safe-area-inset-top">
                {activeTab === 'schedule' && (
                    <div className="space-y-4 animate-fade-in">
                        {todayEvents.length === 0 ? (
                            <div className="glass-card flex flex-col items-center justify-center p-8 text-center mt-12">
                                <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-3xl">📅</span>
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No Events Today</h3>
                                <p className="text-slate-400 text-sm">Stay tuned for upcoming assignments.</p>
                            </div>
                        ) : (
                            todayEvents.map(event => (
                                <MobileEventCard key={event.id} event={event} />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div className="glass-card p-8 flex flex-col items-center justify-center mt-12 text-center animate-fade-in">
                        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                            <span className="text-xl">🚧</span>
                        </div>
                        <h3 className="text-lg font-medium text-white">Coming Soon</h3>
                        <p className="text-slate-400 text-sm mt-2">Staff interactions will be available in the next update.</p>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="glass-card p-8 flex flex-col items-center justify-center mt-12 text-center animate-fade-in">
                        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                            <span className="text-xl">🍳</span>
                        </div>
                        <h3 className="text-lg font-medium text-white">Coming Soon</h3>
                        <p className="text-slate-400 text-sm mt-2">Menu details will be available in the next update.</p>
                    </div>
                )}
            </div>

            <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
