import styles from './page.module.css';
import SampleDataPopover from '@/components/SampleDataPopover';
import Link from 'next/link';
import { getDashboardActivities } from '@/lib/actions/notifications';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getEvents } from '@/lib/actions/events';
import { getUsers } from '@/lib/actions/users';

function timeAgo(dateString: string | null) {
    if (!dateString) return '';
    const date = new Date(dateString + 'Z'); // Ensure UTC parsing if needed, but SQLite usually stores as string.
    // If dateString identifies as local time, this might be off, but for "Z" suffix it's UTC.
    // Drizzle default(sql`CURRENT_TIMESTAMP`) in SQLite is usually UTC string "YYYY-MM-DD HH:MM:SS" without Z.
    // So let's handle "YYYY-MM-DD HH:MM:SS" (UTC) -> Local Date.
    // Actually, safe bet is just new Date(dateString) and hope JS runtime parses it locally or as UTC.
    // Ideally, we append 'Z' if it's missing to force UTC treatment if DB stores UTC.

    const d = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 60) return "Just now";

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role || 'staff';
    const userName = session?.user?.name || 'User';

    const activities = await getDashboardActivities();
    const allEvents = await getEvents();
    const activeEvents = allEvents.filter(e => e.status === 'active').length;
    const pendingQuotes = allEvents.filter(e => e.status === 'quote' || e.status === 'inquiry').length;

    const getColor = (type: string | null) => {
        switch (type) {
            case 'success': return 'var(--success)';
            case 'warning': return 'var(--warning)';
            case 'error': return '#ef4444'; // red-500
            default: return 'var(--primary)';
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {userName.split(' ')[0]}</h1>
                    <p className="text-slate-400">Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <SampleDataPopover />
                    {role !== 'staff' && (
                        <Link href="/dashboard/events/new" className="btn-primary">+ New Event</Link>
                    )}
                </div>
            </header>

            <div className={styles.statsGrid}>
                <div className="glass-card-3d">
                    <h3 className="text-slate-400 text-sm font-medium">Active Events</h3>
                    <p className="text-4xl font-bold text-white mt-2 text-glow">{activeEvents}</p>
                    <span className="text-success text-sm">Target: assigned only</span>
                </div>
                <div className="glass-card-3d">
                    <h3 className="text-slate-400 text-sm font-medium">Pending Quotes</h3>
                    <p className="text-4xl font-bold text-white mt-2 text-glow">{pendingQuotes}</p>
                    <span className="text-warning text-sm">Action required</span>
                </div>
                {role !== 'staff' && (
                    <div className="glass-card-3d">
                        <h3 className="text-slate-400 text-sm font-medium">Total Revenue (Month)</h3>
                        <p className="text-4xl font-bold text-white mt-2 text-glow">$45.2k</p>
                        <span className="text-success text-sm">+12% vs last month</span>
                    </div>
                )}
                {role !== 'staff' && (
                    <div className="glass-card-3d">
                        <h3 className="text-slate-400 text-sm font-medium">Staff Active</h3>
                        <p className="text-4xl font-bold text-white mt-2 text-glow">24</p>
                        <span className="text-slate-500 text-sm">Full team availability</span>
                    </div>
                )}
            </div>

            <div className={styles.contentGrid}>
                <div className={`glass-card-3d ${styles.mainChart}`}>
                    <h2 className="text-xl font-semibold mb-4 text-white">Upcoming Events</h2>
                    <div className="glass-panel p-4 h-64 flex items-center justify-center text-slate-500">
                        [Calendar / Timeline Placeholder]
                    </div>
                </div>

                <div className={`glass-card-3d ${styles.sideList}`}>
                    <h2 className="text-xl font-semibold mb-4 text-white">Recent Activities</h2>
                    {activities.length === 0 ? (
                        <p className="text-slate-500 text-sm">No recent activities.</p>
                    ) : (
                        <ul className="space-y-4">
                            {activities.map((activity) => (
                                <li key={activity.id} className={styles.activityItem}>
                                    <div className={styles.statusDot} style={{ background: getColor(activity.type) }} />
                                    <div>
                                        <p className="text-white text-sm">{activity.title}</p>
                                        <p className="text-xs text-slate-500">{timeAgo(activity.createdAt)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
