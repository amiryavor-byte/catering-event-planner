import { getTodayEvents } from '@/lib/actions/events';
import MobileDashboard from '@/components/mobile/MobileDashboard';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Captain Dashboard',
    description: 'Mobile companion for Event Captains',
};

export default async function MobilePage() {
    const todayEvents = await getTodayEvents();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* 
                Intentionally hiding on desktop if we want to force mobile view only? 
                Or we can let it render. 
                The user asked for "Mobile Layout". 
                Usually we'd want this visible if resized.
                I'll remove the md:hidden wrapper to allow debugging on desktop.
             */}
            <MobileDashboard todayEvents={todayEvents} />
        </div>
    );
}
