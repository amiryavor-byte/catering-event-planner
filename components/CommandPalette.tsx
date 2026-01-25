'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
    Search,
    LayoutDashboard,
    CalendarDays,
    ClipboardList,
    UtensilsCrossed,
    Users,
    Settings,
    X,
    ArrowRight
} from 'lucide-react';

const actions = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', section: 'Navigation' },
    { name: 'Calendar', icon: CalendarDays, href: '/dashboard/calendar', section: 'Navigation' },
    { name: 'Events', icon: ClipboardList, href: '/dashboard/events', section: 'Navigation' },
    { name: 'Create Event', icon: ClipboardList, href: '/dashboard/events/new', section: 'Actions' },
    { name: 'Menu & Recipes', icon: UtensilsCrossed, href: '/dashboard/menus', section: 'Navigation' },
    { name: 'Staff Directory', icon: Users, href: '/dashboard/staff', section: 'Navigation' },
    { name: 'Clients', icon: Users, href: '/dashboard/clients', section: 'Navigation' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings', section: 'System' },
];

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();

    // Toggle open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filter actions
    const filteredActions = useMemo(() => {
        if (!query) return actions;
        const lowerQuery = query.toLowerCase();
        return actions.filter(action =>
            action.name.toLowerCase().includes(lowerQuery)
        );
    }, [query]);

    // Reset selection on query change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Navigation and Selection
    const handleSelect = (href: string) => {
        setIsOpen(false);
        router.push(href);
        setQuery('');
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleNavigation = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredActions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredActions[selectedIndex]) {
                    handleSelect(filteredActions[selectedIndex].href);
                }
            }
        };

        window.addEventListener('keydown', handleNavigation);
        return () => window.removeEventListener('keydown', handleNavigation);
    }, [isOpen, filteredActions, selectedIndex]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            <div className="relative w-full max-w-xl glass-panel shadow-2xl overflow-hidden animate-fade-in mx-4 flex flex-col max-h-[60vh]">
                <div className="flex items-center px-4 py-4 border-b border-white/10">
                    <Search className="w-5 h-5 text-slate-400 mr-3" />
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-500"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <div className="hidden sm:flex gap-2">
                        <kbd className="px-2 py-0.5 text-xs bg-white/10 rounded text-slate-400">Esc</kbd>
                    </div>
                </div>

                <div className="overflow-y-auto p-2 scrollbar-thin">
                    {filteredActions.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">
                            No results found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredActions.map((action, index) => (
                                <button
                                    key={action.href}
                                    onClick={() => handleSelect(action.href)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors group ${index === selectedIndex
                                            ? 'bg-indigo-500/20 text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                        }`}
                                >
                                    <div className={`p-2 rounded-md ${index === selectedIndex ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'
                                        }`}>
                                        <action.icon size={18} />
                                    </div>
                                    <span className="flex-1">{action.name}</span>
                                    {index === selectedIndex && (
                                        <ArrowRight size={16} className="opacity-50" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 border-t border-white/5 bg-black/20 text-xs text-slate-500 flex justify-between">
                    <span>Protip: Use arrows to navigate</span>
                    <span>Catering Event Planner v0.1</span>
                </div>
            </div>
        </div>,
        document.body
    );
}
