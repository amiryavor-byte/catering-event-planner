'use server';

import { getDataService } from '@/lib/data/factory';
import { Event } from '@/lib/data/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

// Remove global service instance to ensure fresh factory call per request if needed, 
// or keep usage within functions.

export async function updateEventDates(id: number, start: Date, end: Date) {
    const service = getDataService();
    if (service.updateEvent) {
        await service.updateEvent(id, {
            startDate: start.toISOString(),
            endDate: end.toISOString()
        });
        revalidatePath('/dashboard/calendar');
        return { success: true };
    }
    throw new Error("Update not supported by current data service");
}

export async function getEvents(): Promise<Event[]> {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/auth');
    const session = await getServerSession(authOptions);

    const service = getDataService();
    const allEvents = await service.getEvents();

    // @ts-ignore
    if (session?.user?.role === 'staff') {
        // Only return events where this user is assigned
        // In a real DB we'd do a join, but here we can fetch assignments
        const { getMyAssignments } = await import('@/lib/actions/event-planning');
        const assignments = await getMyAssignments();
        const assignedEventIds = new Set(assignments.map(a => a.eventId));
        return allEvents.filter(e => assignedEventIds.has(e.id));
    }

    return allEvents;
}

export async function getEventById(id: number): Promise<Event | null> {
    const service = getDataService();
    const events = await service.getEvents();
    // Optimized service method might need to be added later, but filtering works for now
    return events.find(e => e.id === id) || null;
}

export async function createEvent(formData: FormData) {
    const name = formData.get('name') as string;
    const clientId = formData.get('clientId') as string;
    const eventType = formData.get('eventType') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const location = formData.get('location') as string;
    const guestCount = formData.get('guestCount') as string;
    const estimatedBudget = formData.get('estimatedBudget') as string;
    const dietaryRequirements = formData.get('dietaryRequirements') as string;
    const isOutdoors = formData.get('isOutdoors') === 'on';
    const notes = formData.get('notes') as string;

    const eventData: Omit<Event, 'id' | 'createdAt'> = {
        name,
        clientId: clientId ? parseInt(clientId) : null,
        status: 'inquiry',
        eventType: eventType || null,
        startDate: startDate || null,
        endDate: endDate || null,
        location: location || null,
        guestCount: guestCount ? parseInt(guestCount) : null,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
        dietaryRequirements: dietaryRequirements || null,
        isOutdoors,
        depositPaid: null,
        notes: notes || null,
    };

    const service = getDataService();
    const newEvent = await service.addEvent(eventData);

    // Create notification for admin
    try {
        const users = await service.getUsers();
        // Find an admin or defaulting to the first user to receive the notification
        const admin = users.find(u => u.role === 'admin') || users[0];

        if (admin) {
            // Dynamically import to avoid circular dependency if any (though likely fine here)
            const { createNotification } = await import('@/lib/actions/notifications');
            await createNotification(
                admin.id,
                'New Event Created',
                `Event "${name}" has been created.`,
                'success',
                `/dashboard/events/${newEvent.id}` // Use the returned ID
            );
        }
    } catch (e) {
        console.error('Failed to create notification:', e);
    }

    revalidatePath('/dashboard/events');
    redirect('/dashboard/events');
}

export async function updateEvent(id: number, formData: FormData) {
    // For now, we'll implement this later with proper update endpoint
    // Just redirect back for now
    revalidatePath('/dashboard/events');
    revalidatePath(`/dashboard/events/${id}`);
}

export async function patchEvent(id: number, data: Partial<Event>) {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/auth');
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (session?.user?.role === 'staff') {
        throw new Error("Staff members cannot edit events");
    }

    const service = getDataService();
    if (service.updateEvent) {
        await service.updateEvent(id, data);
        revalidatePath('/dashboard/events');
        revalidatePath(`/dashboard/events/${id}`);
        return { success: true };
    }
    throw new Error("Update not supported");
}

// Retrieve events for the current day
export async function getTodayEvents(): Promise<Event[]> {
    const service = getDataService();
    const allEvents = await service.getEvents();

    // Get start and end of today in local time (server time)
    // Note: In a real app, we'd handle timezones more carefully (e.g., user timezone)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return allEvents.filter(event => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        return eventDate >= startOfDay && eventDate < endOfDay;
    });
}

export async function updateEventStatus(id: number, status: Event['status']) {
    const service = getDataService();
    if (service.updateEvent) {
        await service.updateEvent(id, { status });
    }

    revalidatePath('/dashboard/events');
    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath('/dashboard/mobile');
}

/**
 * AI-Powered Event Parser
 * Extracts structured event data from natural language descriptions or client emails
 */
export async function parseEventDescription(description: string): Promise<{
    name: string;
    eventType: string | null;
    startDate: string | null;
    guestCount: number | null;
    location: string | null;
    dietaryRequirements: string | null;
    estimatedBudget: number | null;
    notes: string | null;
    suggestedMenuItems: Array<{ name: string; category: string; reasoning: string }>;
}> {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
        throw new Error('AI service not configured');
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert event planner analyzing event inquiries for a kosher catering company.

Extract structured event details from the user's description. Return ONLY valid JSON with these fields:

- name (string): A concise event name (e.g., "Smith Wedding", "Corporate Lunch")
- eventType (string): One of: wedding, corporate, bar_mitzvah, bat_mitzvah, bris, baby_naming, shiva, shabbat, holiday_party, fundraiser, other
- startDate (ISO datetime string): Extracted date/time, null if not mentioned
- guestCount (number): Number of expected guests, null if not mentioned
- location (string): Event location/venue, null if not mentioned
- dietaryRequirements (string): Comma-separated list of dietary needs (e.g., "Kosher, Gluten-free, Vegan")
- estimatedBudget (number): Budget amount if mentioned, null otherwise
- notes (string): Any special requests, preferences, or important details
- suggestedMenuItems (array): Based on event type and context, suggest 5-8 appropriate dishes with:
  - name (string): Dish name
  - category (string): appetizer, main, side, dessert, beverage
  - reasoning (string): Why this dish fits the event

For Jewish events (bar/bat mitzvah, bris, shiva, shabbat), prioritize traditional kosher dishes.
For corporate events, suggest elegant but practical options.
For weddings, suggest upscale menu items.

Return ONLY the JSON object, no markdown formatting.`
                },
                {
                    role: 'user',
                    content: `Extract event details from this:\n\n${description}`
                }
            ],
            temperature: 0.4,
            max_tokens: 1500
        });

        const result = completion.choices[0]?.message?.content || '{}';
        const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedResult);

        return {
            name: parsed.name || 'New Event',
            eventType: parsed.eventType || null,
            startDate: parsed.startDate || null,
            guestCount: parsed.guestCount || null,
            location: parsed.location || null,
            dietaryRequirements: parsed.dietaryRequirements || null,
            estimatedBudget: parsed.estimatedBudget || null,
            notes: parsed.notes || null,
            suggestedMenuItems: parsed.suggestedMenuItems || []
        };
    } catch (error) {
        console.error('Failed to parse event description:', error);
        throw new Error('Failed to parse event description. Please try again or fill out the form manually.');
    }
}

/**
 * Suggest menu items based on event type and guest count
 */
export async function suggestMenuItems(eventType: string, guestCount: number | null): Promise<Array<{ name: string; category: string; description: string }>> {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
        return [];
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Suggest appropriate menu items for a kosher catering event.
Return JSON array with: name, category (appetizer/main/side/dessert/beverage), description.
Return ONLY valid JSON array, no markdown.`
                },
                {
                    role: 'user',
                    content: `Event Type: ${eventType}\nGuest Count: ${guestCount || 'Not specified'}\n\nSuggest 6-8 diverse menu items that would be appropriate for this event.`
                }
            ],
            temperature: 0.5,
            max_tokens: 800
        });

        const result = completion.choices[0]?.message?.content || '[]';
        const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanedResult);
    } catch (error) {
        console.error('Failed to suggest menu items:', error);
        return [];
    }
}
