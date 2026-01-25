'use client';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/Popover';
import { Filter, Check, ChevronDown } from 'lucide-react';

interface EventFilterProps {
    events: Array<{ id: number; name: string }>;
    selectedEventIds: number[];
    onSelectionChange: (selectedIds: number[]) => void;
}

export function EventFilter({ events, selectedEventIds, onSelectionChange }: EventFilterProps) {
    const handleToggle = (eventId: number) => {
        if (selectedEventIds.includes(eventId)) {
            onSelectionChange(selectedEventIds.filter(id => id !== eventId));
        } else {
            onSelectionChange([...selectedEventIds, eventId]);
        }
    };

    const handleSelectAll = () => {
        onSelectionChange(events.map(e => e.id));
    };

    const handleClearAll = () => {
        onSelectionChange([]);
    };

    const isAllSelected = events.length > 0 && selectedEventIds.length === events.length;

    return (
        <Popover>
            <PopoverTrigger className="group">
                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-all text-sm font-medium text-neutral-200">
                    <Filter size={16} className="text-neutral-400 group-hover:text-white" />
                    <span>Filter Events</span>
                    {selectedEventIds.length < events.length && selectedEventIds.length > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                            {selectedEventIds.length}
                        </span>
                    )}
                    <ChevronDown size={14} className="text-neutral-500 group-hover:text-neutral-300" />
                </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-72 p-0 overflow-hidden bg-neutral-900 border-neutral-700">
                <div className="p-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Active Events
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSelectAll}
                            disabled={isAllSelected}
                            className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            All
                        </button>
                        <span className="text-neutral-700">|</span>
                        <button
                            onClick={handleClearAll}
                            disabled={selectedEventIds.length === 0}
                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            None
                        </button>
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto py-1">
                    {events.length === 0 ? (
                        <div className="p-4 text-center text-neutral-500 italic text-sm">
                            No active events found.
                        </div>
                    ) : (
                        events.map(event => {
                            const isSelected = selectedEventIds.includes(event.id);
                            return (
                                <div
                                    key={event.id}
                                    onClick={() => handleToggle(event.id)}
                                    className="px-4 py-3 hover:bg-neutral-800 cursor-pointer flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-blue-500/50"
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-neutral-600 hover:border-neutral-500'
                                        }`}>
                                        {isSelected && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-sm ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                                        {event.name}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
