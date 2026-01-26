'use client';

import { useState } from 'react';
import Sidebar, { SidebarMode } from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import WelcomeTour from '@/components/WelcomeTour';
import { NotificationCenter } from '@/components/NotificationCenter';

import { OnlineUsers } from '@/components/OnlineUsers';
import CommandPalette from '@/components/CommandPalette';
import { ChatProvider } from '@/lib/contexts/ChatContext';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Lifted State for Sidebar
    const [sidebarMode, setSidebarMode] = useState<SidebarMode>('vertical-left');
    const [sidebarPos, setSidebarPos] = useState({ x: 100, y: 100 });

    // Calculate content safety margins based on dock state
    const getMainStyle = () => {
        const style: React.CSSProperties = {
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            padding: '1.5rem',
            width: '100%',
            scrollbarGutter: 'stable',
            transition: 'margin 0.3s ease'
        };

        // Approximate dimensions of the docked bars
        const SIDEBAR_WIDTH = 280;
        const TOPBAR_HEIGHT = 80;

        switch (sidebarMode) {
            case 'vertical-left':
                style.marginLeft = `${SIDEBAR_WIDTH}px`;
                break;
            case 'vertical-right':
                style.marginRight = `${SIDEBAR_WIDTH}px`;
                break;
            case 'horizontal-top':
                style.marginTop = `${TOPBAR_HEIGHT}px`;
                break;
            case 'horizontal-bottom':
                style.marginBottom = `${TOPBAR_HEIGHT}px`;
                break;
            case 'floating':
            default:
                // No margins needed, it floats over
                break;
        }

        // Mobile Override (if needed logic here, but usually mobile uses standard layout)
        // We can just trust the CSS media queries to override if we want, 
        // OR we enforce one mode for mobile. 
        // For this task, assuming the floating behavior is desired on desktop.

        return style;
    };

    return (
        <div className="h-screen w-full overflow-hidden flex flex-col bg-slate-900/50">
            {/* Mobile Navigation (Visible < 1024px) */}
            <div className="flex-none lg:hidden">
                <MobileNav onOpen={() => setSidebarOpen(true)} />
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar (Fixed desktop / Overlay mobile) */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    mode={sidebarMode}
                    position={sidebarPos}
                    onModeChange={setSidebarMode}
                    onPositionChange={setSidebarPos}
                />

                {/* Main Content Area */}
                <main
                    className="main-content relative"
                    id="main-content"
                    style={getMainStyle()}
                >
                    <header className="flex justify-end items-center mb-6 gap-4 sticky top-0 z-30 pt-2 pb-4 backdrop-blur-sm">
                        <OnlineUsers />
                        <NotificationCenter />
                    </header>
                    <div className="pb-10">
                        {children}
                    </div>
                </main>
            </div>

            <WelcomeTour />
            <CommandPalette />

            <ChatProvider>
                <ChatWidget />
            </ChatProvider>
        </div>
    );
}
