import { Suspense } from 'react';
import { getEvents } from '@/lib/actions/events';
import { getBlackoutDates } from '@/lib/actions/availability';
import CalendarTabs from '@/components/scheduling/CalendarTabs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getDataService } from '@/lib/data/factory';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
    const session = await getServerSession(authOptions);
    const events = await getEvents();
    const blackoutDates = await getBlackoutDates();

    let userId: number | undefined;
    let userRole = 'staff';

    if (session?.user?.email) {
        const service = getDataService();
        const user = await service.getUserByEmail(session.user.email);
        if (user) {
            userId = user.id;
            userRole = user.role;
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Event Calendar</h1>
            <Suspense fallback={<div className="text-white">Loading calendar...</div>}>
                <CalendarTabs
                    events={events}
                    blackoutDates={blackoutDates}
                    userId={userId}
                    userRole={userRole}
                />
            </Suspense>
        </div>
    );
}
