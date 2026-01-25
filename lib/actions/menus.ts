'use server'

import { getDataService } from '@/lib/data/factory';
import { revalidatePath } from 'next/cache';

export async function getMenus() {
    const service = getDataService();
    try {
        return await service.getMenus();
    } catch (err) {
        console.error("Failed to fetch menus:", err);
        return [];
    }
}

export async function getMenuItems(menuId?: number) {
    const service = getDataService();
    return await service.getMenuItems(menuId);
}

export async function getMenuItemById(id: number) {
    const service = getDataService();
    // Optimization: If the service supports getMenuItemById directly, use it.
    // Otherwise filter from all items (or filtered list if we had context, but here we don't).
    // For now, fetching all is okay for small datasets, but ideally we'd add getMenuItem(id) to service.
    // Let's stick to existing pattern but maybe fetch all isn't efficient for one item.
    // However, the service implementation of getMenuItems() fetches all if no ID is passed.
    const items = await service.getMenuItems();
    return items.find(item => item.id === id);
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

export async function getRecipeWithDetails(menuId: number) {
    const service = getDataService();
    const recipeItems = await service.getRecipe(menuId);

    // Recipe items should already have joined ingredient data from the service
    return recipeItems;
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

export async function updateRecipeItem(id: number, amount: number) {
    const service = getDataService();
    await service.updateRecipeItem(id, amount);
    revalidatePath('/dashboard/menus');
}

export async function deleteRecipeItem(id: number) {
    const service = getDataService();
    await service.deleteRecipeItem(id);
    revalidatePath('/dashboard/menus');
}

