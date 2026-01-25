"use client";

import useSWR from 'swr';
import { useEffect } from 'react';
import { getOnlineUsers, updateHeartbeat } from '@/lib/actions/presence';

export function usePresence(currentUserId: number) {
    // Poll online users
    const { data } = useSWR('online-users', getOnlineUsers, {
        refreshInterval: 10000,
    });

    // Send heartbeat
    useEffect(() => {
        if (!currentUserId) return;

        // Initial heartbeat
        updateHeartbeat(currentUserId);

        const interval = setInterval(() => {
            updateHeartbeat(currentUserId);
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [currentUserId]);

    return {
        onlineUsers: data?.data || [],
    };
}
