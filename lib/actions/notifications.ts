"use server";

import { sendEmail } from "@/lib/services/email";

// STUBBED FOR PRODUCTION TO PREVENT VERCEL 500 ERROR (SQLite dependency)
// TODO: Implement API endpoints for notifications

export interface NotificationActivity {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    createdAt: string;
    link?: string | null;
}

export async function getUnreadNotifications(userId: number) {
    return [] as NotificationActivity[];
}

export async function markNotificationAsRead(notificationId: number) {
    return { success: true };
}

export async function createNotification(userId: number, title: string, message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info', link?: string) {
    // No-op in production until API is ready
    return { success: true };
}


export async function sendEventSchedule(eventId: number) {
    console.log(`Sending schedule for event ${eventId} (STUBBED)`);
    return { success: true, message: "Schedule sending not active in production yet" };
}

export async function getDashboardActivities(limit = 5) {
    // Return empty array to prevent dashboard crash
    return [] as NotificationActivity[];
}

