"use server";

import { generateEventIcsString } from '@/lib/services/calendar';
import { getEventById } from '@/lib/actions/events';

export async function downloadEventIcs(eventId: number) {
    const event = await getEventById(eventId);

    if (!event) {
        throw new Error("Event not found");
    }

    const icsContent = await generateEventIcsString(event);

    if (!icsContent) {
        throw new Error("Could not generate ICS (missing dates?)");
    }

    return icsContent;
    return icsContent;
}

import { getMyAssignments } from '@/lib/actions/event-planning';
import { generateScheduleIcsString } from '@/lib/services/calendar';

export async function downloadMyScheduleIcs() {
    const assignments = await getMyAssignments();
    if (!assignments || assignments.length === 0) {
        // Return null or throw? UI can handle empty string
        return null;
    }
    return await generateScheduleIcsString(assignments);
}
