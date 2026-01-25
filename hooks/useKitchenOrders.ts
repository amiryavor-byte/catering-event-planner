"use client";

import useSWR from 'swr';
import { getKitchenOrders } from '@/lib/actions/kitchen';

export function useKitchenOrders() {
    const { data, error, isLoading } = useSWR('kitchen-orders', getKitchenOrders, {
        refreshInterval: 30000, // Poll every 30 seconds
    });

    return {
        orders: data?.data || [],
        isLoading,
        isError: error || (data && !data.success),
        errorMessage: error?.message || (data && !data.success ? (data.error || data.message) : null)
    };
}
