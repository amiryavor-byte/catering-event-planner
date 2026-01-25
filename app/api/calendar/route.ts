import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/actions/events';
import { generateEventIcsString } from '@/lib/services/calendar';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const eventIdParam = searchParams.get('eventId');

    if (!eventIdParam) {
        return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const eventId = parseInt(eventIdParam);
    if (isNaN(eventId)) {
        return NextResponse.json({ error: 'Invalid Event ID' }, { status: 400 });
    }

    try {
        // Use the action to fetch event, which goes through the Data Factory (Hybrid Service)
        const event = await getEventById(eventId);

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const icsContent = await generateEventIcsString(event);

        if (!icsContent) {
            return NextResponse.json({ error: 'Could not generate ICS content (possibly missing dates)' }, { status: 500 });
        }

        const filename = `${event.name.replace(/\s+/g, "_")}.ics`;

        return new NextResponse(icsContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('Error generating ICS:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
