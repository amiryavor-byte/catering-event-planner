
"use client";

import { useState, useEffect, useRef } from 'react';

interface InlineEditableProps {
    value: string;
    onSave: (newValue: string) => void;
    label?: string;
    multiline?: boolean;
    className?: string;
    user?: string; // Who is editing
}

export function InlineEditable({ value, onSave, label, multiline = false, className = "", user }: InlineEditableProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        if (currentValue !== value) {
            onSave(currentValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            handleSave();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setCurrentValue(value);
        }
    };

    if (isEditing) {
        return (
            <div className={`relative group ${className}`}>
                {label && <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>}
                {multiline ? (
                    <textarea
                        ref={inputRef as any}
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown} // Typically textarea handles Enter, but Escape is good
                        className="w-full p-2 border-2 border-blue-500 rounded bg-white text-gray-900 focus:outline-none min-h-[100px]"
                    />
                ) : (
                    <input
                        ref={inputRef as any}
                        type="text"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="w-full p-1 border-2 border-blue-500 rounded bg-white text-gray-900 focus:outline-none"
                    />
                )}
                <div className="absolute right-2 top-2 text-xs text-blue-500 font-bold opacity-0 group-hover:opacity-100 pointer-events-none">
                    Enter to Save
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={`cursor-pointer hover:bg-blue-50/50 p-1 rounded -m-1 transition-colors border border-transparent hover:border-blue-200 group ${className}`}
            title="Click to edit"
        >
            {label && <label className="block text-xs font-semibold text-gray-400 mb-1 pointer-events-none">{label}</label>}
            {multiline ? (
                <div className="whitespace-pre-wrap">{currentValue}</div>
            ) : (
                <span>{currentValue}</span>
            )}
            <span className="hidden group-hover:inline-block ml-2 text-blue-400 text-xs">✏️</span>
        </div>
    );
}
