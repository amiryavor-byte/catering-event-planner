'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';

interface PopoverContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    triggerRef: React.RefObject<HTMLElement | null>;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

export function Popover({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLElement>(null);

    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('.popover-content')
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <PopoverContext.Provider value={{ isOpen, toggle, close, triggerRef }}>
            {children}
        </PopoverContext.Provider>
    );
}

export function PopoverTrigger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const context = useContext(PopoverContext);
    if (!context) throw new Error('PopoverTrigger must be used within Popover');

    return (
        <div
            ref={context.triggerRef as React.RefObject<HTMLDivElement>}
            onClick={context.toggle}
            className={`inline-block cursor-pointer ${className}`}
        >
            {children}
        </div>
    );
}

export function PopoverContent({
    children,
    className = '',
    align = 'center',
    sideOffset = 4
}: {
    children: React.ReactNode;
    className?: string;
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
}) {
    const context = useContext(PopoverContext);
    if (!context) throw new Error('PopoverContent must be used within Popover');

    const [position, setPosition] = useState({ top: 0, left: 0 });
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (context.isOpen && context.triggerRef.current) {
            const triggerRect = context.triggerRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top = triggerRect.bottom + scrollY + sideOffset;
            let left = triggerRect.left + scrollX;

            if (align === 'center') {
                left = triggerRect.left + scrollX + triggerRect.width / 2;
                // We'll adjust for content width in a layout effect or CSS transform
            } else if (align === 'end') {
                left = triggerRect.right + scrollX;
            }

            setPosition({ top, left });
        }
    }, [context.isOpen, align, sideOffset]);

    if (!context.isOpen) return null;

    const style: React.CSSProperties = {
        position: 'absolute',
        top: position.top,
        left: position.left,
        transform: align === 'center' ? 'translateX(-50%)' : align === 'end' ? 'translateX(-100%)' : 'none',
        zIndex: 50,
        minWidth: '200px',
    };

    return createPortal(
        <div
            ref={contentRef}
            className={`popover-content bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 shadow-2xl animate-fade-in text-slate-100 ${className}`}
            style={style}
        >
            {children}
        </div>,
        document.body
    );
}
