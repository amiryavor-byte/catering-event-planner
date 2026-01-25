"use client";

import { useKitchenOrders } from "@/hooks/useKitchenOrders";
import { KitchenOrderCard } from "@/components/KitchenOrderCard";
import { EventFilter } from "@/components/EventFilter";
import { useState, useMemo, useRef } from "react";

export default function KitchenPage() {
    const { orders, isLoading, isError, errorMessage } = useKitchenOrders();
    const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);

    // Extract unique active events from orders
    const activeEvents = useMemo(() => {
        const eventsMap = new Map();
        orders.forEach((order: any) => {
            if (order.event && !eventsMap.has(order.event.id)) {
                eventsMap.set(order.event.id, {
                    id: order.event.id,
                    name: order.event.name
                });
            }
        });
        return Array.from(eventsMap.values());
    }, [orders]);

    // Initialize selection when orders load (select all by default if none selected yet)
    // We use a ref to track if we've initialized to avoid resetting user selection on poll
    const hasInitialized = useRef(false);

    if (orders.length > 0 && !hasInitialized.current) {
        // Default to all selected
        const allIds = orders.map((o: any) => o.event.id);
        // De-duplicate
        const uniqueIds = Array.from(new Set(allIds)) as number[];

        // Only set if we haven't set it yet
        if (selectedEventIds.length === 0) {
            setSelectedEventIds(uniqueIds);
            hasInitialized.current = true;
        }
    }

    // Update selection if new events appear that weren't there before (e.g. new order comes in)
    // This part is tricky UX - usually better to let user manually select new ones or auto-select?
    // Let's stick to simple "select all on first load" for now.

    const filteredOrders = useMemo(() => {
        if (selectedEventIds.length === 0) return [];
        return orders.filter((order: any) => selectedEventIds.includes(order.event.id));
    }, [orders, selectedEventIds]);


    if (isLoading) {
        return (
            <div className="p-8 min-h-screen bg-neutral-900 text-white">
                <h1 className="text-4xl font-bold tracking-tight text-white/90 uppercase mb-6">Kitchen Display System</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-neutral-800 rounded-lg animate-pulse border border-neutral-700"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 min-h-screen bg-neutral-900 text-red-500">
                <h1 className="text-4xl font-bold mb-6">System Error</h1>
                <p className="text-xl">Failed to load kitchen orders. Please check connection to main server.</p>
                {errorMessage && (
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded text-red-300 font-mono text-sm overflow-auto">
                        {errorMessage}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-neutral-900 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-4xl font-bold tracking-tight text-white/90 uppercase">Kitchen Display</h1>

                <div className="flex items-center gap-4">
                    <EventFilter
                        events={activeEvents}
                        selectedEventIds={selectedEventIds}
                        onSelectionChange={setSelectedEventIds}
                    />

                    <div className="hidden md:flex items-center space-x-3 bg-neutral-800 px-4 py-2 rounded-full border border-neutral-700">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-mono text-gray-300">LIVE SYNC</span>
                    </div>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="p-20 text-center bg-neutral-800 rounded-lg border border-dashed border-neutral-700 animate-in fade-in zoom-in duration-300">
                    <p className="text-neutral-400 text-2xl font-light">No active prep tickets.</p>
                    <p className="text-sm text-neutral-600 mt-4 uppercase tracking-widest">Standing by for new orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="p-20 text-center bg-neutral-800 rounded-lg border border-dashed border-neutral-700 animate-in fade-in zoom-in duration-300">
                    <p className="text-neutral-400 text-2xl font-light">All events hidden.</p>
                    <p className="text-sm text-neutral-600 mt-4 uppercase tracking-widest">Adjust filter to view orders.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                    {filteredOrders.map((order: any) => (
                        <KitchenOrderCard key={order.event.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
