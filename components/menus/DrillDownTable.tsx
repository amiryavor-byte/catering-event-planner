'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
    header: string;
    accessor: (item: T) => React.ReactNode;
}

interface DrillDownTableProps<T extends { id: number | string }> {
    title: string;
    data: T[];
    columns: Column<T>[];
    onRowClick: (item: T) => void;
    selectedId?: number | string | null;
    searchPlaceholder?: string;
    emptyMessage?: string;
    filterFn?: (item: T, query: string) => boolean;
}

export function DrillDownTable<T extends { id: number | string }>({
    title,
    data,
    columns,
    onRowClick,
    selectedId,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No items found',
    filterFn
}: DrillDownTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;

        if (filterFn) {
            return data.filter(item => filterFn(item, searchQuery));
        }

        // Default simple string search on values
        const query = searchQuery.toLowerCase();
        return data.filter(item => {
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(query)
            );
        });
    }, [data, searchQuery, filterFn]);

    return (
        <div className="flex flex-col h-[600px] bg-white/5 border border-white/10 rounded-xl overflow-hidden glass-panel">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredData.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        {emptyMessage}
                    </div>
                ) : (
                    filteredData.map((item) => {
                        const isSelected = item.id === selectedId;
                        return (
                            <div
                                key={item.id}
                                onClick={() => onRowClick(item)}
                                className={cn(
                                    "p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent group relative",
                                    isSelected
                                        ? "bg-primary/20 border-primary/50 shadow-[0_0_15px_-3px_var(--primary)] text-white"
                                        : "hover:bg-white/5 hover:border-white/10 text-slate-300"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                                            {/* Primary Column (First one usually Name) */}
                                            <div className={cn("font-medium truncate", isSelected ? "text-primary-foreground" : "group-hover:text-white")}>
                                                {columns[0].accessor(item)}
                                            </div>

                                            {/* Secondary Column (Price/Status etc) */}
                                            {columns[1] && (
                                                <div className="text-xs opacity-70 text-right font-mono">
                                                    {columns[1].accessor(item)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tertiary Column (Description/Details) */}
                                        {columns[2] && (
                                            <div className="text-xs opacity-50 truncate mt-1">
                                                {columns[2].accessor(item)}
                                            </div>
                                        )}
                                    </div>

                                    {isSelected && <ChevronRight className="w-4 h-4 text-primary animate-pulse" />}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Summary */}
            <div className="p-2 px-4 bg-black/20 border-t border-white/5 text-xs text-slate-500 text-right">
                {filteredData.length} item{filteredData.length !== 1 && 's'}
            </div>
        </div>
    );
}
