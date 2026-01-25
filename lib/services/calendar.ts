import { createEvent, DateArray, EventAttributes } from 'ics';
import { Event } from '@/lib/data/types';

export async function generateEventIcsString(event: Event): Promise<string | null> {
    if (!event.startDate) return null;

    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default to 1 hour

    const start: DateArray = [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes()
    ];

    const end: DateArray = [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes()
    ];

    const description = (event.notes || '') +
        (event.guestCount ? `\nGuest Count: ${event.guestCount}` : '') +
        (event.dietaryRequirements ? `\nDietary Specs: ${event.dietaryRequirements}` : '');

    const eventAttributes: EventAttributes = {
        start,
        end,
        title: event.name,
        description: description.trim(),
        location: event.location || undefined,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        productId: 'catering-event-planner/ics',
    };

    return new Promise((resolve, reject) => {
        createEvent(eventAttributes, (error, value) => {
            if (error) {
                console.error('Error generating ICS:', error);
                reject(error);
                return;
            }
            resolve(value);
        });
    });
}

import { createEvents } from 'ics';

export async function generateScheduleIcsString(assignments: any[]): Promise<string> {
    const events: EventAttributes[] = assignments.map(a => {
        const startDate = new Date(a.event.startDate);
        const endDate = a.event.endDate ? new Date(a.event.endDate) : new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // Default 4 hours if missing

        const start: DateArray = [
            startDate.getFullYear(),
            startDate.getMonth() + 1,
            startDate.getDate(),
            startDate.getHours(),
            startDate.getMinutes()
        ];

        const end: DateArray = [
            endDate.getFullYear(),
            endDate.getMonth() + 1,
            endDate.getDate(),
            endDate.getHours(),
            endDate.getMinutes()
        ];

        return {
            start,
            end,
            title: `Work: ${a.event.name}`,
            description: `Role: ${a.role || 'Staff'}\nLocation: ${a.event.location || 'TBD'}`,
            location: a.event.location || undefined,
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
            productId: 'catering-event-planner/schedule',
        };
    });

    return new Promise((resolve, reject) => {
        createEvents(events, (error, value) => {
            if (error) {
                console.error('Error generating Schedule ICS:', error);
                reject(error);
                return;
            }
            resolve(value!);
        });
    });
}
