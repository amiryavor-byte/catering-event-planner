"use client";

import { usePresence } from "@/hooks/usePresence";
import { useSession } from "next-auth/react";

export function OnlineUsers() {
    const { data: session } = useSession();
    const userId = session?.user && (session.user as any).id ? parseInt((session.user as any).id) : 0;
    const { onlineUsers } = usePresence(userId);

    if (onlineUsers.length <= 1) return null; // Don't show if just me

    const otherUsers = onlineUsers.filter((u: any) => u.id !== userId);

    return (
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <div className="flex -space-x-2">
                {otherUsers.slice(0, 3).map((u: any) => (
                    <div
                        key={u.id}
                        className="h-6 w-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-800"
                        title={u.name}
                    >
                        {u.name.charAt(0)}
                    </div>
                ))}
                {otherUsers.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                        +{otherUsers.length - 3}
                    </div>
                )}
            </div>
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap hidden sm:inline">
                {otherUsers.length} online
            </span>
        </div>
    );
}
