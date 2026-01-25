'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface InlineCellProps {
    value: string | number | null | undefined;
    onSave: (newValue: string) => Promise<void>;
    type?: 'text' | 'email' | 'number' | 'select';
    options?: { label: string; value: string }[]; // For select type
    isEditable?: boolean;
}

export function InlineCell({ value, onSave, type = 'text', options = [], isEditable = true }: InlineCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value?.toString() || '');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

    useEffect(() => {
        setCurrentValue(value?.toString() || '');
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (currentValue === (value?.toString() || '')) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            await onSave(currentValue);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save cell', error);
            // Optionally revert or show error toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentValue(value?.toString() || '');
            setIsEditing(false);
        }
    };

    if (!isEditable) {
        return <span className="text-slate-300">{value}</span>;
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 min-w-[120px]">
                {type === 'select' ? (
                    <select
                        ref={inputRef as React.RefObject<HTMLSelectElement>}
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onBlur={handleSave}
                        disabled={isLoading}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type={type}
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        // We use a small timeout onBlur to allow clicking functionality buttons if needed,
                        // but generally auto-save on blur is expected.
                        onBlur={handleSave}
                        disabled={isLoading}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                    />
                )}
                {isLoading && <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />}
            </div>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:bg-white/5 rounded px-2 py-1 -ml-2 min-h-[28px] flex items-center group transition-colors"
            title="Click to edit"
        >
            <span className={!currentValue ? 'text-slate-500 italic' : 'text-slate-300'}>
                {currentValue || 'Empty'}
            </span>
            <span className="ml-2 opacity-0 group-hover:opacity-100 text-slate-500 text-xs">
                ✎
            </span>
        </div>
    );
}
