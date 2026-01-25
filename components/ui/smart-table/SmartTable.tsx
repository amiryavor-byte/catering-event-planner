'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Filter, AlertTriangle } from 'lucide-react';
import { InlineCell } from './InlineCell';
import { GlassModal } from '@/components/ui/GlassModal';

export interface ColumnDef<T> {
    key: keyof T | string; // keyof T or a virtual key
    header: string;
    render?: (item: T) => React.ReactNode;
    editable?: boolean;
    inputType?: 'text' | 'email' | 'number' | 'select';
    selectOptions?: { label: string; value: string }[];
    sortable?: boolean;
}

interface SmartTableProps<T extends { id: number | string }> {
    data: T[];
    columns: ColumnDef<T>[];
    onUpdate?: (id: number | string, field: string, value: any) => Promise<void>;
    onDelete?: (id: number | string) => Promise<void>;
    onAdd?: () => void; // Trigger for add modal or inline add row (TBD)
    searchPlaceholder?: string;
    onRowClick?: (row: T) => void;
    selectable?: boolean;
    onBulkDelete?: (ids: (number | string)[]) => Promise<void>;
}

export type Column<T> = ColumnDef<T>;

export function SmartTable<T extends { id: number | string }>({
    data,
    columns,
    onUpdate,
    onDelete,
    onAdd,
    searchPlaceholder = 'Search...',
    onRowClick,
    selectable = false,
    onBulkDelete
}: SmartTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

    // Deletion State
    const [deleteState, setDeleteState] = useState<{
        isOpen: boolean;
        type: 'single' | 'bulk';
        ids: (number | string)[];
    }>({ isOpen: false, type: 'single', ids: [] });
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter Logic
    const filteredData = useMemo(() => {
        let result = data;

        // Global Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter((item) =>
                Object.values(item).some((val) =>
                    val?.toString().toLowerCase().includes(lowerQuery)
                )
            );
        }

        // Column Filters
        if (showFilters && Object.keys(columnFilters).length > 0) {
            result = result.filter((item) => {
                return Object.entries(columnFilters).every(([key, value]) => {
                    if (!value) return true;
                    // @ts-ignore
                    const itemValue = item[key]?.toString().toLowerCase() ?? '';
                    return itemValue.includes(value.toLowerCase());
                });
            });
        }

        return result;
    }, [data, searchQuery, columnFilters, showFilters]);

    // Sort Logic
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;
        return [...filteredData].sort((a, b) => {
            // @ts-ignore
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            // @ts-ignore
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredData, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig((current) => {
            if (current?.key === key) {
                return current.direction === 'asc'
                    ? { key, direction: 'desc' }
                    : null;
            }
            return { key, direction: 'asc' };
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === sortedData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedData.map(item => item.id)));
        }
    };

    const toggleSelectOne = (id: number | string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const initiateBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setDeleteState({
            isOpen: true,
            type: 'bulk',
            ids: Array.from(selectedIds)
        });
    };

    const initiateSingleDelete = (id: number | string) => {
        setDeleteState({
            isOpen: true,
            type: 'single',
            ids: [id]
        });
    };

    const confirmDelete = async () => {
        if (!deleteState.ids.length) return;
        setIsDeleting(true);
        try {
            if (deleteState.type === 'bulk' && onBulkDelete) {
                await onBulkDelete(deleteState.ids);
                setSelectedIds(new Set());
            } else if (deleteState.type === 'single' && onDelete) {
                await onDelete(deleteState.ids[0]);
            }
            setDeleteState(prev => ({ ...prev, isOpen: false }));
        } catch (error: any) {
            alert(error.message || 'Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    {selectable && selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                            <span className="text-xs font-medium text-red-400">{selectedIds.size} selected</span>
                            <button
                                onClick={initiateBulkDelete}
                                className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-md transition-colors"
                                title="Deactivate Selected"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border transition-colors ${showFilters ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'}`}
                        title="Toggle Filters"
                    >
                        <Filter size={18} />
                    </button>
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            <Plus size={16} />
                            Add New
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                {selectable && (
                                    <th className="py-3 px-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={sortedData.length > 0 && selectedIds.size === sortedData.length}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 transition-colors cursor-pointer"
                                        />
                                    </th>
                                )}
                                {columns.map((col) => (
                                    <th
                                        key={col.key.toString()}
                                        className={`py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-white' : ''}`}
                                    >
                                        <div
                                            className="flex items-center gap-1"
                                            onClick={() => col.sortable && handleSort(col.key.toString())}
                                        >
                                            {col.header}
                                            {sortConfig?.key === col.key && (
                                                <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                        {showFilters && (
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    placeholder={`Filter ${col.header}...`}
                                                    value={columnFilters[col.key.toString()] || ''}
                                                    onChange={(e) => setColumnFilters(prev => ({
                                                        ...prev,
                                                        [col.key.toString()]: e.target.value
                                                    }))}
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        )}
                                    </th>
                                ))}
                                {onDelete && <th className="py-3 px-4 w-12"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedData.length > 0 ? (
                                sortedData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`group hover:bg-white/5 transition-colors border-b border-white/5 ${onRowClick ? 'cursor-pointer' : ''} ${selectedIds.has(item.id) ? 'bg-primary/5' : ''}`}
                                        onClick={() => onRowClick && onRowClick(item)}
                                    >
                                        {selectable && (
                                            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(item.id)}
                                                    onChange={() => toggleSelectOne(item.id)}
                                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 transition-colors cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col) => (
                                            <td key={`${item.id}-${col.key.toString()}`} className="py-3 px-4 text-sm text-slate-300">
                                                {col.render ? (
                                                    col.render(item)
                                                ) : col.editable && onUpdate ? (
                                                    <InlineCell
                                                        // @ts-ignore
                                                        value={item[col.key]}
                                                        // @ts-ignore
                                                        type={col.inputType}
                                                        options={col.selectOptions}
                                                        onSave={async (val) => {
                                                            await onUpdate(item.id, col.key.toString(), val);
                                                        }}
                                                    />
                                                ) : (
                                                    // @ts-ignore
                                                    <span>{item[col.key]}</span>
                                                )}
                                            </td>
                                        ))}
                                        {onDelete && (
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        initiateSingleDelete(item.id);
                                                    }}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + (onDelete ? 1 : 0) + (selectable ? 1 : 0)} className="py-8 text-center text-slate-500">
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-white/10 bg-white/5 text-xs text-slate-500 flex justify-between items-center">
                    <span>Showing {sortedData.length} records</span>
                    {filteredData.length !== data.length && (
                        <span>Filtered from {data.length} total</span>
                    )}
                </div>
            </div>

            {/* Deletion Confirmation Modal */}
            <GlassModal
                isOpen={deleteState.isOpen}
                onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
                title={deleteState.type === 'bulk' ? 'Confirm Deactivation' : 'Confirm Deletion'}
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="p-2 bg-red-500/20 rounded-full text-red-400">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="text-sm text-slate-300">
                            <p className="font-medium text-white mb-1">
                                {deleteState.type === 'bulk'
                                    ? `Are you sure you want to deactivate ${deleteState.ids.length} selected items?`
                                    : 'Are you sure you want to delete this item?'}
                            </p>
                            <p>This action cannot be undone.</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="btn-primary bg-red-500 hover:bg-red-600 border-red-400/20"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </GlassModal>
        </div>
    );
}
