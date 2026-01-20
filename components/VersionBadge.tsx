'use client';

import { APP_VERSION } from '@/lib/version';
import { useEffect, useState } from 'react';
import { PartyPopper, CheckCircle } from 'lucide-react';

interface VersionBadgeProps {
    userEmail?: string;
}

export function VersionBadge({ userEmail }: VersionBadgeProps) {
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        // Only run for the specific admin
        if (userEmail === 'amiryavor@gmail.com') {
            const lastSeenVersion = localStorage.getItem('app_version_seen');

            if (lastSeenVersion !== APP_VERSION) {
                setShowOverlay(true);
                localStorage.setItem('app_version_seen', APP_VERSION);

                // Hide after 10 seconds
                const timer = setTimeout(() => {
                    setShowOverlay(false);
                }, 10000);

                return () => clearTimeout(timer);
            }
        }
    }, [userEmail]);

    return (
        <>
            {/* Success Overlay - High Z-Index, Centered */}
            {showOverlay && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-400">
                        <div className="bg-white/20 p-2 rounded-full">
                            <CheckCircle size={32} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Update Successful!</h3>
                            <p className="text-emerald-50 font-mono text-sm opacity-90">Running v{APP_VERSION}</p>
                        </div>
                        <button
                            onClick={() => setShowOverlay(false)}
                            className="ml-4 hover:bg-white/10 p-1 rounded-full text-xs opacity-70 hover:opacity-100"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Sticky Badge - Always Visible */}
            <div className="fixed bottom-2 right-2 z-50 pointer-events-none opacity-30 hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-slate-500 bg-black/20 px-2 py-1 rounded-full border border-white/5">
                    v{APP_VERSION}
                </span>
            </div>
        </>
    );
}
