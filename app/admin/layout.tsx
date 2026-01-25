'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileCode, Database, Rocket, Settings, AlertTriangle } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: 'Overview', icon: Settings },
        { href: '/admin/deploy', label: 'Deploy', icon: Rocket },
        { href: '/admin/files', label: 'File Manager', icon: FileCode },
        { href: '/admin/database', label: 'Database', icon: Database },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Warning Banner */}
            <div className="bg-warning/20 border-b border-warning/30 px-6 py-3">
                <div className="flex items-center gap-2 text-warning text-sm">
                    <AlertTriangle size={16} />
                    <span className="font-medium">Admin Mode</span>
                    <span className="text-slate-400">·</span>
                    <span>Direct access to backend systems</span>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 min-h-screen bg-slate-900/50 border-r border-white/10 p-6">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-1">Admin Panel</h2>
                        <p className="text-sm text-slate-400">Backend Management</p>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-white/10">
                        <div className="text-xs text-slate-500 mb-1">Environment</div>
                        <div className="text-sm font-mono text-success">Production</div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
