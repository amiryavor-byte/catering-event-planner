
import { db } from '../lib/db';
import { events } from '../lib/db/schema';

async function main() {
    console.log('Creating test event...');
    try {
        const result = await db.insert(events).values({
            name: 'Test Event for ICS',
            startDate: new Date().toISOString(), // Today
            endDate: new Date(Date.now() + 3600000).toISOString(), // +1 hour
            eventType: 'wedding',
            status: 'active',
            guestCount: 100,
            location: 'Test Location',
            notes: 'This is a test event for ICS generation.',
            dietaryRequirements: 'None',
            createdAt: new Date().toISOString(),

        }).returning({ id: events.id });

        console.log('Created event with ID:', result[0].id);
    } catch (error) {
        console.error('Error creating event:', error);
    }
}

main();
