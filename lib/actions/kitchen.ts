"use server";

import { db } from "@/lib/db";
import { events, eventMenuItems, menuItems, recipes, ingredients, tasks, eventStaff } from "@/lib/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function getKitchenOrders() {
    try {
        const session = await getServerSession(authOptions);
        console.log("KDS Session Check:", JSON.stringify(session, null, 2));

        if (!session?.user?.email) {
            return { success: false, message: "Unauthorized: No session or email found" };
        }

        const userEmail = session.user.email;
        // @ts-ignore
        const userId = session.user.id;
        // @ts-ignore
        const userRole = session.user.role;

        // Get today's date (simple YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];

        // Base query for active events today
        let activeEventsQuery = db.select()
            .from(events)
            .where(
                and(
                    inArray(events.status, ["approved", "active"]),
                    eq(events.startDate, today)
                )
            )
            .orderBy(desc(events.startDate));

        let activeEvents = await activeEventsQuery.all();

        // If not admin, filter by assignment
        if (userRole !== "admin") {
            // Get event IDs assigned to this staff member
            const assignments = await db.select({ eventId: eventStaff.eventId })
                .from(eventStaff)
                .where(eq(eventStaff.userId, userId))
                .all();

            const assignedEventIds = assignments.map(a => a.eventId);

            // Filter events
            activeEvents = activeEvents.filter(event => assignedEventIds.includes(event.id));
        }

        const orders = [];

        for (const event of activeEvents) {
            // Fetch menu items for each event
            const items = await db.select({
                id: eventMenuItems.id,
                menuItemId: menuItems.id,
                name: menuItems.name,
                quantity: eventMenuItems.quantity,
                notes: eventMenuItems.notes,
                status: eventMenuItems.status,
                category: menuItems.category,
            })
                .from(eventMenuItems)
                .leftJoin(menuItems, eq(eventMenuItems.menuItemId, menuItems.id))
                .where(eq(eventMenuItems.eventId, event.id))
                .all();

            // Fetch recipes for these items
            const itemsWithRecipes = await Promise.all(items.map(async (item) => {
                if (!item.menuItemId) return { ...item, recipe: [] };

                const recipeDetails = await db.select({
                    ingredient: ingredients.name,
                    unit: ingredients.unit,
                    amount: recipes.amountRequired,
                })
                    .from(recipes)
                    .leftJoin(ingredients, eq(recipes.ingredientId, ingredients.id))
                    .where(eq(recipes.menuItemId, item.menuItemId))
                    .all();

                return {
                    ...item,
                    recipe: recipeDetails
                };
            }));

            if (itemsWithRecipes.length > 0) {
                orders.push({
                    event,
                    items: itemsWithRecipes
                });
            }
        }

        return { success: true, data: orders };
    } catch (error) {
        console.error("Error fetching kitchen orders:", error);
        return {
            success: false,
            message: "Failed to fetch kitchen orders",
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function updateItemStatus(itemId: number, status: "prep" | "cooking" | "ready" | "served") {
    try {
        await db.update(eventMenuItems)
            .set({ status })
            .where(eq(eventMenuItems.id, itemId));

        // Revalidate the path if possible, but since we use SWR, just returning success is enough
        return { success: true };
    } catch (error) {
        console.error("Error updating order item status:", error);
        return { success: false, message: "Failed to update status" };
    }
}
