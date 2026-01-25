"use server";

import { sendEmail } from "@/lib/services/email";
import { tasks, users, events, notifications } from "@/lib/db/schema";
import { db } from "@/lib/db"; // Direct DB access for now, assuming SQLite for MVP
import { eq, and, desc } from "drizzle-orm";

export async function getUnreadNotifications(userId: number) {
    return db.select().from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
        .orderBy(desc(notifications.createdAt))
        .all();
}

export async function markNotificationAsRead(notificationId: number) {
    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId))
        .run();
    return { success: true };
}

export async function createNotification(userId: number, title: string, message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info', link?: string) {
    await db.insert(notifications).values({
        userId,
        title,
        message,
        type,
        link,
    }).run();
    return { success: true };
}


export async function sendEventSchedule(eventId: number) {
    console.log(`Sending schedule for event ${eventId}`);

    // Fetch Event
    const event = await db.select().from(events).where(eq(events.id, eventId)).get();
    if (!event) return { success: false, message: "Event not found" };

    // Fetch Tasks for Event with Assignees
    const eventTasks = await db.select({
        task: tasks,
        assignee: users
    })
        .from(tasks)
        .leftJoin(users, eq(tasks.assignedTo, users.id))
        .where(eq(tasks.eventId, eventId))
        .all();

    if (eventTasks.length === 0) {
        return { success: false, message: "No tasks found for this event" };
    }

    // Group tasks by assignee
    const staffTasks = new Map<string, { email: string; name: string; tasks: typeof eventTasks }>();

    for (const item of eventTasks) {
        if (item.assignee && item.assignee.email) {
            const email = item.assignee.email;
            if (!staffTasks.has(email)) {
                staffTasks.set(email, {
                    email,
                    name: item.assignee.name,
                    tasks: []
                });
            }
            staffTasks.get(email)?.tasks.push(item);
        }
    }

    let sentCount = 0;

    // Send Emails
    for (const [email, data] of staffTasks.entries()) {
        const taskListHtml = data.tasks.map(({ task }) => `
            <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                <strong>${task.startTime || 'TBD'} - ${task.dueTime || 'TBD'}</strong>: ${task.title}
                <br/>
                <span style="color: #666;">${task.description || ''}</span>
                <br/>
                <small>Location: ${task.location || 'See Event Details'}</small>
            </div>
        `).join('');

        const html = `
            <h2>Event Schedule: ${event.name}</h2>
            <p>Hi ${data.name},</p>
            <p>Here is your schedule for the upcoming event:</p>
            <h3>Tasks</h3>
            ${taskListHtml}
            <p>Please check the dashboard for any updates.</p>
        `;

        await sendEmail({
            to: email,
            subject: `Schedule for ${event.name}`,
            html
        });
        sentCount++;
    }

    return { success: true, message: `Sent schedules to ${sentCount} staff members` };
}

export async function getDashboardActivities(limit = 5) {
    // Get recent notifications for display on dashboard
    // We fetch all recent ones to show "system activity"
    // In a real app we might filter by the current user's role or visibility
    return db.select({
        id: notifications.id,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        createdAt: notifications.createdAt,
        link: notifications.link,
    })
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .all();
}
