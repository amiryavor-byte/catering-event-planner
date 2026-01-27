"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// STUBBED FOR PRODUCTION TO PREVENT VERCEL 500 ERROR
// TODO: Implement API endpoints for KDS

export async function getKitchenOrders() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, message: "Unauthorized", error: "Unauthorized" };
        }

        // Return empty array for now to prevent crash
        return { success: true, data: [] };
    } catch (error) {
        console.error("Error fetching kitchen orders:", error);
        return { success: false, message: "Failed to fetch orders", error: String(error) };
    }
}

export async function updateItemStatus(itemId: number, status: "prep" | "cooking" | "ready" | "served") {
    // No-op
    return { success: true };
}
