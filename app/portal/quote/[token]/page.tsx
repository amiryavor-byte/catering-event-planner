import { getDataService } from '@/lib/data/factory';
import QuoteViewer from '@/components/client-portal/QuoteViewer';
import { notFound } from 'next/navigation';
import { getEventMenuItems, getEventStaff } from '@/lib/actions/event-planning';

export const metadata = {
    title: 'Review Your Quote',
};

import { EventMenuItem } from '@/lib/data/types';

// Force dynamic since we use tokens
export const dynamic = 'force-dynamic';

export default async function QuotePage({ params }: { params: { token: string } }) {
    const service = getDataService();
    const event = await service.getEventByToken!(params.token);

    if (!event) {
        return notFound();
    }

    // Since we are server-side, we can fetch related data directly
    const menuItems = await getEventMenuItems(event.id) as EventMenuItem[];
    const staff = await getEventStaff(event.id);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12">
            <QuoteViewer event={event} items={menuItems} staff={staff} />
        </div>
    );
}
