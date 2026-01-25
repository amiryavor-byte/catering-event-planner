"use client";

import useSWR from 'swr';
import { getUnreadNotifications, markNotificationAsRead } from '@/lib/actions/notifications';

export function useNotifications(userId: number) {
    const { data: notifications, mutate } = useSWR(
        userId ? `notifications-${userId}` : null,
        () => getUnreadNotifications(userId),
        {
            refreshInterval: 10000,
        }
    );

    const markAsRead = async (id: number) => {
        await markNotificationAsRead(id);
        mutate(); // Revalidate immediately
    };

    return {
        notifications: notifications || [],
        markAsRead,
    };
}
