"use client";

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function NotificationCenter() {
    const { data: session } = useSession();
    const userId = session?.user && (session.user as any).id ? parseInt((session.user as any).id) : 0;
    const { notifications, markAsRead } = useNotifications(userId);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.length;

    if (!userId) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            <span className="text-xs text-gray-500">{unreadCount} unread</span>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notif: any) => (
                                    <div
                                        key={notif.id}
                                        className="p-4 border-b last:border-0 hover:bg-gray-50 transition-colors group relative"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-sm text-gray-900">{notif.title}</h4>
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{notif.message}</p>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
