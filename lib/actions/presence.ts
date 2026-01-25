"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, gt } from "drizzle-orm";

export async function updateHeartbeat(userId: number) {
    try {
        await db.update(users)
            .set({ lastActiveAt: new Date().toISOString() })
            .where(eq(users.id, userId))
            .run();
        return { success: true };
    } catch (error) {
        console.error("Error updating heartbeat:", error);
        return { success: false };
    }
}

export async function getOnlineUsers() {
    try {
        // Users active in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const onlineUsers = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            lastActiveAt: users.lastActiveAt
        })
            .from(users)
            .where(gt(users.lastActiveAt, fiveMinutesAgo))
            .all();

        return { success: true, data: onlineUsers };
    } catch (error) {
        console.error("Error fetching online users:", error);
        return { success: false, data: [] };
    }
}
