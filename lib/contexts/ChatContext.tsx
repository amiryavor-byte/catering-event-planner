'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useSWR from 'swr';
import { ApiDataService } from '@/lib/data/api-service';
import { Message, User } from '@/lib/data/types';
import { useSession } from 'next-auth/react';

interface ChatContextType {
    messages: Message[];
    isLoading: boolean;
    sendMessage: (content: string, type?: 'text' | 'image' | 'audio', file?: File, transcription?: string) => Promise<void>;
    activeChannel: { type: 'global' | 'event' | 'dm'; id?: number } | null;
    setActiveChannel: (channel: { type: 'global' | 'event' | 'dm'; id?: number } | null) => void;
    refresh: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const api = new ApiDataService();

export function ChatProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [activeChannel, setActiveChannel] = useState<{ type: 'global' | 'event' | 'dm'; id?: number } | null>(null);

    // Fetch Key for SWR
    const getKey = () => {
        if (!session?.user?.email) return null; // No user, no chat

        // Define params based on channel
        let params: any = {};
        if (activeChannel?.type === 'event') {
            params.eventId = activeChannel.id;
        } else if (activeChannel?.type === 'dm') {
            params.recipientId = activeChannel.id;
            // param `senderId` is automatically handled by session in `api-service` logic 
            // BUT api-service helper `getMessages` takes explicit senderId if needed 
            // actually API service uses GET params. 
            // We need to pass current user ID as senderId to see DMs *between* us.
            // But we don't have ID easily sync without session.user.id (custom field).
            // For now, let's assume global chat works without ID, DMs might need ID.
            // We'll rely on the API to return relevant messages. 
            // We will pass senderId = currentUserId if we can extract it.
            // @ts-ignore
            if (session.user.id) params.senderId = session.user.id;
        } else {
            // Global
            // No specific params
        }

        // Make stable key
        return ['/messages', JSON.stringify(params)];
    };

    const fetcher = async ([, paramsStr]: [string, string]) => {
        const params = JSON.parse(paramsStr);
        return await api.getMessages(params);
    };

    // SWR Polling (Interval 2000ms)
    const { data: messages, mutate, isLoading } = useSWR(getKey, fetcher, {
        refreshInterval: 2000,
        dedupingInterval: 1000,
        fallbackData: []
    });

    const sendMessage = async (content: string, type: 'text' | 'image' | 'audio' = 'text', file?: File, transcription?: string) => {
        if (!session?.user?.email) return;

        // @ts-ignore
        const senderId = session.user.id as number;

        try {
            await api.sendMessage({
                senderId,
                recipientId: activeChannel?.type === 'dm' ? activeChannel.id : undefined,
                eventId: activeChannel?.type === 'event' ? activeChannel.id : undefined,
                content,
                type,
                file,
                transcription
            });
            // Immediate re-fetch (optimistic UI could be added here)
            mutate();
        } catch (error) {
            console.error('Failed to send message', error);
            throw error;
        }
    };

    return (
        <ChatContext.Provider value={{
            messages: messages || [],
            isLoading,
            sendMessage,
            activeChannel,
            setActiveChannel,
            refresh: mutate
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
