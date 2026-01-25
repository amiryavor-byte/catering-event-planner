'use client';

import { Calendar, Users, FileText } from 'lucide-react';

interface MobileBottomNavProps {
    activeTab: 'schedule' | 'staff' | 'menu';
    onTabChange: (tab: 'schedule' | 'staff' | 'menu') => void;
}

export default function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--heavy-glass-bg)] border-t border-[var(--glass-border)] pb-safe backdrop-blur-xl z-50">
            <div className="flex justify-around items-center h-full pb-2">
                <button
                    onClick={() => onTabChange('schedule')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${activeTab === 'schedule' ? 'text-[var(--primary)] drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'text-slate-400'
                        }`}
                >
                    <Calendar className="w-6 h-6" />
                    <span className="text-xs font-medium tracking-wide">Schedule</span>
                </button>
                <button
                    onClick={() => onTabChange('staff')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${activeTab === 'staff' ? 'text-[var(--secondary)] drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-slate-400'
                        }`}
                >
                    <Users className="w-6 h-6" />
                    <span className="text-xs font-medium tracking-wide">Staff</span>
                </button>
                <button
                    onClick={() => onTabChange('menu')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${activeTab === 'menu' ? 'text-[var(--accent)] drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]' : 'text-slate-400'
                        }`}
                >
                    <FileText className="w-6 h-6" />
                    <span className="text-xs font-medium tracking-wide">Menu</span>
                </button>
            </div>
        </div>
    );
}
