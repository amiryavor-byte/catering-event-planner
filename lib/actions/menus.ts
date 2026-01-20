'use server'

import { getDataService } from '@/lib/data/factory';
import { revalidatePath } from 'next/cache';

export async function getMenuItems() {
    const service = getDataService();
    return await service.getMenuItems();
}

export async function addMenuItem(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const basePrice = parseFloat(formData.get('basePrice') as string) || 0;

    const service = getDataService();
    await service.addMenuItem({
        name,
        description,
        category,
        basePrice
    });

    revalidatePath('/dashboard/menus');
}

export async function getRecipe(menuId: number) {
    const service = getDataService();
    return await service.getRecipe(menuId);
}

export async function addRecipeItem(formData: FormData) {
    const service = getDataService();
    const menuItemId = parseInt(formData.get('menuItemId') as string);
    const ingredientId = parseInt(formData.get('ingredientId') as string);
    const amount = parseFloat(formData.get('amount') as string);

    await service.addRecipeItem(menuItemId, ingredientId, amount);
    revalidatePath(`/dashboard/menus/${menuItemId}`);
    revalidatePath('/dashboard/menus');
}
