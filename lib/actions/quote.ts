'use server';

import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function acceptQuote(token: string) {
    const event = await db.query.events.findFirst({
        where: eq(events.quoteToken, token),
    });

    if (!event) {
        throw new Error('Invalid quote token');
    }

    if (event.status === 'approved' || event.status === 'active') {
        throw new Error('Quote is already approved');
    }

    // Update status to approved and set viewed/signed timestamps if needed
    // For now we just mark as approved.
    await db.update(events)
        .set({
            status: 'approved',
            quoteViewedAt: new Date().toISOString() // Or separate 'signedAt'
        })
        .where(eq(events.id, event.id));

    revalidatePath(`/portal/quote/${token}`);
    revalidatePath(`/dashboard/events/${event.id}`);
}
