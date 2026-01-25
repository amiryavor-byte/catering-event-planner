'use server';

import { db } from '@/lib/db';
import { equipment } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function getEquipment() {
    return await db.select().from(equipment).all();
}

export async function addEquipment(data: {
    name: string;
    type: 'owned' | 'rental';
    defaultRentalCost?: number;
    replacementCost?: number;
}) {
    await db.insert(equipment).values(data);
    revalidatePath('/dashboard/events');
    revalidatePath('/dashboard/settings'); // Assuming equipment might be managed there too
}

export async function deleteEquipment(id: number) {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/auth');
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized: Only administrators can delete equipment');
    }

    await db.delete(equipment).where(eq(equipment.id, id));
    revalidatePath('/dashboard/events');
    revalidatePath('/dashboard/inventory');
}

export async function updateEquipment(id: number, data: {
    name?: string;
    type?: 'owned' | 'rental';
    defaultRentalCost?: number;
    replacementCost?: number;
}) {
    await db.update(equipment).set(data).where(eq(equipment.id, id));
    revalidatePath('/dashboard/events');
    revalidatePath('/dashboard/inventory'); // Ensure inventory page updates
}
