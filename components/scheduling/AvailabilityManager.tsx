'use client';

import BlackoutManager from './BlackoutManager';
import { BlackoutDate } from '@/lib/data/types';

interface AvailabilityManagerProps {
    blackoutDates: BlackoutDate[];
    userRole?: string;
    userId?: number;
}

export default function AvailabilityManager({ blackoutDates, userRole, userId }: AvailabilityManagerProps) {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Availability Manager</h2>
                <p className="text-slate-400">Manage your time off and view company-wide blackout dates.</p>
            </div>

            <div className="space-y-8">
                {/* Section 1: Blackout Dates (Personal & Company) */}
                <section>
                    <BlackoutManager
                        blackoutDates={blackoutDates}
                        userRole={userRole}
                        userId={userId}
                    />
                </section>

                {/* Section 2: Recurring Availability (Can be added later) */}
                {/* 
                <section className="pt-8 border-t border-white/10 opacity-50 pointer-events-none">
                    <h3 className="font-bold text-white mb-4">Weekly Schedule (Coming Soon)</h3>
                    <p className="text-slate-500">Set your standard working hours for each day of the week.</p>
                </section> 
                */}
            </div>
        </div>
    );
}
