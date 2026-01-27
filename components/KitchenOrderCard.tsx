"use client";

import React from 'react';

import { updateItemStatus } from "@/lib/actions/kitchen";
import { useState } from "react";

const STATUS_FLOW = ["prep", "cooking", "ready", "served"];

export function KitchenOrderCard({ order }: { order: any }) {
    const { event, items } = order;

    // We keep local state for instant feedback, though props will update on poll
    const [localItems, setLocalItems] = useState(items);

    const handleStatusClick = async (itemId: number, currentStatus: string) => {
        const currentIndex = STATUS_FLOW.indexOf(currentStatus || "prep");
        // @ts-ignore - status flow typing
        const nextStatus: "prep" | "cooking" | "ready" | "served" = STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length];

        // Optimistic update
        setLocalItems((prev: any[]) => prev.map((item) =>
            item.id === itemId ? { ...item, status: nextStatus } : item
        ));

        await updateItemStatus(itemId, nextStatus);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'cooking': return 'bg-amber-900/40 text-amber-200 border-amber-700/50';
            case 'ready': return 'bg-green-900/40 text-green-200 border-green-700/50';
            case 'served': return 'bg-neutral-800 text-neutral-500 border-neutral-800 decoration-line-through opacity-50';
            default: return 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500'; // Prep
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'cooking': return '🔥 COOKING';
            case 'ready': return '✅ READY';
            case 'served': return '🏁 SERVED';
            default: return '🔪 PREP';
        }
    };

    const isAllReady = localItems.every((i: any) => i.status === 'ready' || i.status === 'served');

    return (
        <div className={`flex flex-col h-full rounded-xl border transition-all duration-300 shadow-2xl ${isAllReady ? 'border-green-500/50 bg-green-950/10' : 'border-neutral-700 bg-neutral-800'}`}>
            <div className={`p-4 border-b flex justify-between items-center ${isAllReady ? 'bg-green-900/20 border-green-800' : 'bg-neutral-800 border-neutral-700'}`}>
                <h3 className="font-bold text-xl text-white truncate w-2/3 tracking-wide" title={event.name}>{event.name}</h3>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-mono text-neutral-400">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div className="p-4 flex-grow overflow-y-auto max-h-[400px] bg-neutral-900/50">
                <div className="space-y-3">
                    {localItems.map((item: any) => (
                        <div
                            key={item.id}
                            onClick={() => handleStatusClick(item.id, item.status)}
                            className={`border rounded-lg p-4 cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all select-none ${getStatusColor(item.status)}`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <span className="font-black text-2xl mr-4 text-white/90">{item.quantity}</span>
                                        <span className="text-xl font-bold leading-tight">{item.name}</span>
                                    </div>
                                    {item.notes && (
                                        <div className="text-base mt-2 text-amber-400 font-medium bg-amber-950/30 p-2 rounded border border-amber-900/50 inline-block">
                                            ⚠️ {item.notes}
                                        </div>
                                    )}
                                    <div className="text-xs mt-2 uppercase tracking-widest font-mono opacity-50">{item.category}</div>

                                    {/* Recipe Display */}
                                    {item.recipe && item.recipe.length > 0 && (
                                        <div className="mt-3 p-3 bg-black/20 rounded text-sm text-neutral-300 border border-neutral-700/50">
                                            <div className="text-xs font-bold uppercase tracking-wider mb-1 text-neutral-500">Recipe:</div>
                                            <ul className="space-y-1">
                                                {item.recipe.map((r: any, idx: number) => (
                                                    <li key={idx} className="flex justify-between">
                                                        <span>{r.ingredient}</span>
                                                        <span className="font-mono text-neutral-400">{r.amount} {r.unit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4 min-w-[90px] text-right">
                                    <span className={`inline-block px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider backdrop-blur-sm shadow-sm ${item.status === 'served' ? 'bg-neutral-800' : 'bg-black/20'}`}>
                                        {getStatusBadge(item.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-3 bg-neutral-800 border-t border-neutral-700 text-center text-xs font-mono text-neutral-500 uppercase tracking-widest">
                Tap items to advance
            </div>
        </div>
    );
}
