import { getEvents } from '@/lib/actions/events';
import { EventsView } from './EventsView';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
    const events = await getEvents();

    return <EventsView events={events} />;
}
