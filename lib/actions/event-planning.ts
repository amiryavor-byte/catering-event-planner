'use server';

import { db } from '@/lib/db';
import { eventEquipment, eventStaff, users, equipment, eventMenuItems, menuItems, menus, tasks, events } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { eq, and, desc } from 'drizzle-orm';

// --- Event Staff ---
export async function getEventStaff(eventId: number) {
    return await db
        .select({
            id: eventStaff.id,
            eventId: eventStaff.eventId,
            userId: eventStaff.userId,
            role: eventStaff.role,
            user: {
                name: users.name,
                email: users.email,
                jobTitle: users.jobTitle,
                hourlyRate: users.hourlyRate,
            },
        })
        .from(eventStaff)
        .leftJoin(users, eq(eventStaff.userId, users.id))
        .where(eq(eventStaff.eventId, eventId));
}

export async function assignStaffToEvent(data: {
    eventId: number;
    userId: number;
    role?: string;
}) {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/auth');
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (session?.user?.role === 'staff') {
        throw new Error('Unauthorized');
    }

    await db.insert(eventStaff).values(data);
    revalidatePath(`/dashboard/events/${data.eventId}`);
}

export async function removeStaffFromEvent(id: number, eventId: number) {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/auth');
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (session?.user?.role === 'staff') {
        throw new Error('Unauthorized');
    }

    await db.delete(eventStaff).where(eq(eventStaff.id, id));
    revalidatePath(`/dashboard/events/${eventId}`);
}



export async function getMyAssignments() {
    // We need session to get current user
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/auth');
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) return [];

    const user = await db.select().from(users).where(eq(users.email, session.user.email)).get();
    if (!user) return [];

    const { events } = await import('@/lib/db/schema');

    return await db
        .select({
            id: eventStaff.id,
            eventId: eventStaff.eventId,
            role: eventStaff.role,
            event: {
                name: events.name,
                startDate: events.startDate,
                endDate: events.endDate,
                location: events.location,
            },
        })
        .from(eventStaff)
        .innerJoin(events, eq(eventStaff.eventId, events.id))
        .where(eq(eventStaff.userId, user.id));
}

// --- Event Equipment ---
export async function getEventEquipment(eventId: number) {
    return await db
        .select({
            id: eventEquipment.id,
            eventId: eventEquipment.eventId,
            equipmentId: eventEquipment.equipmentId,
            quantity: eventEquipment.quantity,
            rentalCostOverride: eventEquipment.rentalCostOverride,
            item: {
                name: equipment.name,
                type: equipment.type,
                defaultRentalCost: equipment.defaultRentalCost,
                replacementCost: equipment.replacementCost,
            },
        })
        .from(eventEquipment)
        .leftJoin(equipment, eq(eventEquipment.equipmentId, equipment.id))
        .where(eq(eventEquipment.eventId, eventId));
}

export async function addEquipmentToEvent(data: {
    eventId: number;
    equipmentId: number;
    quantity: number;
    rentalCostOverride?: number;
}) {
    await db.insert(eventEquipment).values(data);
    revalidatePath(`/dashboard/events/${data.eventId}`);
}

export async function removeEquipmentFromEvent(id: number, eventId: number) {
    await db.delete(eventEquipment).where(eq(eventEquipment.id, id));
    revalidatePath(`/dashboard/events/${eventId}`);
}

// --- Event Menu Items ---


export async function getEventMenuItems(eventId: number) {
    return await db
        .select({
            id: eventMenuItems.id,
            eventId: eventMenuItems.eventId,
            menuItemId: eventMenuItems.menuItemId,
            quantity: eventMenuItems.quantity,
            priceOverride: eventMenuItems.priceOverride,
            notes: eventMenuItems.notes,
            item: {
                name: menuItems.name,
                description: menuItems.description,
                basePrice: menuItems.basePrice,
                category: menuItems.category,
                servingSize: menuItems.servingSize,
            }
        })
        .from(eventMenuItems)
        .leftJoin(menuItems, eq(eventMenuItems.menuItemId, menuItems.id))
        .where(eq(eventMenuItems.eventId, eventId));
}

export async function getAllMenuItems() {
    return await db.select().from(menuItems).orderBy(desc(menuItems.category));
}

export async function addMenuItemToEvent(data: {
    eventId: number;
    menuItemId: number;
    quantity: number;
    priceOverride?: number;
    notes?: string;
}) {
    await db.insert(eventMenuItems).values(data);
    revalidatePath(`/dashboard/events/${data.eventId}`);
}

export async function removeMenuItemFromEvent(id: number, eventId: number) {
    await db.delete(eventMenuItems).where(eq(eventMenuItems.id, id));
    revalidatePath(`/dashboard/events/${eventId}`);
}

// --- Tasks ---


export async function getEventTasks(eventId: number) {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/auth');
    const session = await getServerSession(authOptions);

    let query = db.select().from(tasks).where(eq(tasks.eventId, eventId));

    // @ts-ignore
    if (session?.user?.role === 'staff' && session?.user?.email) {
        // Find user by email to get numeric ID if id is 'dev-user' or string
        const user = await db.select().from(users).where(eq(users.email, session.user.email)).get();
        if (user) {
            return await db.select().from(tasks).where(
                and(
                    eq(tasks.eventId, eventId),
                    eq(tasks.assignedTo, user.id)
                )
            );
        }
    }

    return await query;
}

// --- Updates (moved from root or ensures availability) ---

export async function updateEvent(id: number, data: Partial<typeof events.$inferSelect>) {
    await db.update(events).set(data).where(eq(events.id, id));
    revalidatePath(`/dashboard/events/${id}`);
}
