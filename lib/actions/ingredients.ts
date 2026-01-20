'use server'

import { db } from '@/lib/db';
import { ingredients } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getIngredients() {
    return await db.select().from(ingredients).orderBy(desc(ingredients.lastUpdated));
}

export async function addIngredient(formData: FormData) {
    const name = formData.get('name') as string;
    const unit = formData.get('unit') as string;
    const price = parseFloat(formData.get('price') as string);
    const supplierUrl = formData.get('supplierUrl') as string;

    await db.insert(ingredients).values({
        name,
        unit,
        pricePerUnit: price,
        supplierUrl,
    });

    revalidatePath('/dashboard/ingredients');
}

export async function updateIngredientPrice(id: number, newPrice: number) {
    await db.update(ingredients)
        .set({ pricePerUnit: newPrice, lastUpdated: new Date().toISOString() })
        .where(eq(ingredients.id, id));

    revalidatePath('/dashboard/ingredients');
}

// AI Feature Mock
export async function checkSupplierPrice(url: string) {
    'use server';
    // Simulate AI Scraping delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return a mock fluctuating price
    return {
        price: +(Math.random() * 10 + 5).toFixed(2), // Random price between 5 and 15
        found: true
    };
}
