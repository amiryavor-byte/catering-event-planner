'use server';

// STUBBED FOR VERCEL DEPLOYMENT
// Direct DB access removed.

export async function getGuests(eventId: number) {
    return [];
}

export async function createGuest(data: { eventId: number; name: string; rsvpStatus?: string }) {
    return {
        id: 0,
        ...data,
        rsvpStatus: (data.rsvpStatus || 'pending') as 'pending' | 'attending' | 'declined', // Explicit cast
        email: '',
        dietaryRequirements: '',
        tableNumber: '',
        notes: ''
    };
}

export async function updateGuest(id: number, data: any) {
    // No-op
}

export async function deleteGuest(id: number) {
    // No-op
}
