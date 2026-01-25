import { CheckCircle, XCircle, Rocket, FileCode, Database } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-slate-400">Manage your backend infrastructure</p>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link href="/admin/deploy" className="card hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <Rocket size={20} />
                        </div>
                        <h3 className="font-bold text-white">Deploy Backend</h3>
                    </div>
                    <p className="text-sm text-slate-400">Upload PHP files to HostGator</p>
                </Link>

                <Link href="/admin/files" className="card hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center text-success">
                            <FileCode size={20} />
                        </div>
                        <h3 className="font-bold text-white">File Manager</h3>
                    </div>
                    <p className="text-sm text-slate-400">Browse and edit backend files</p>
                </Link>

                <Link href="/admin/database" className="card hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center text-warning">
                            <Database size={20} />
                        </div>
                        <h3 className="font-bold text-white">Database</h3>
                    </div>
                    <p className="text-slim text-slate-400">View and manage database tables</p>
                </Link>
            </div>

            {/* System Status */}
            <div className="card">
                <h2 className="text-xl font-bold text-white mb-6">Backend Status</h2>

                <div className="space-y-4">
                    <StatusRow label="HostGator FTP" status="unknown" />
                    <StatusRow label="MySQL Database" status="unknown" />
                    <StatusRow label="API Endpoints" status="unknown" />
                </div>

                <div className="mt-6 text-sm text-slate-500">
                    Status checks will be added in future updates
                </div>
            </div>
        </div>
    );
}

function StatusRow({ label, status }: { label: string; status: 'ok' | 'error' | 'unknown' }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <span className="text-white font-medium">{label}</span>
            <div className="flex items-center gap-2">
                {status === 'ok' && (
                    <>
                        <CheckCircle size={18} className="text-success" />
                        <span className="text-success text-sm">Connected</span>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle size={18} className="text-error" />
                        <span className="text-error text-sm">Error</span>
                    </>
                )}
                {status === 'unknown' && (
                    <span className="text-slate-500 text-sm">Not checked</span>
                )}
            </div>
        </div>
    );
}
