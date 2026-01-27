'use server';

// STUBBED FOR VERCEL DEPLOYMENT
// Direct DB access removed.

import { revalidatePath } from 'next/cache';

export async function getEquipment(): Promise<any[]> {
    return [];
}

export async function addEquipment(data: {
    name: string;
    type: 'owned' | 'rental';
    defaultRentalCost?: number;
    replacementCost?: number;
}) {
    // No-op
}

export async function deleteEquipment(id: number) {
    // No-op
}

export async function updateEquipment(id: number, data: any) {
    // No-op
}
