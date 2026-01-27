import styles from './page.module.css';
import SampleDataPopover from '@/components/SampleDataPopover';
import Link from 'next/link';
import { getDashboardActivities } from '@/lib/actions/notifications';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getEvents } from '@/lib/actions/events';
import { getUsers } from '@/lib/actions/users';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import { BarChart3, Users, CalendarDays, DollarSign } from 'lucide-react';

function timeAgo(dateString: string | null) {
    if (!dateString) return '';
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

    // Calculate Metrics
    const activeEvents = allEvents.filter(e => e.status === 'active').length;
    const pendingQuotes = allEvents.filter(e => e.status === 'quote' || e.status === 'inquiry').length;

    // Mock Revenue Data for Sparkline
    const revenueData = [
        { value: 4000 }, { value: 3000 }, { value: 2000 }, { value: 2780 },
        { value: 1890 }, { value: 2390 }, { value: 3490 }, { value: 5000 },
        { value: 4500 }, { value: 6000 }, { value: 5500 }, { value: 7000 }
    ];

    // Transform events for Calendar
    const calendarEvents = allEvents
        .filter(e => e.startDate) // Ensure startDate exists
        .map(e => ({
            id: String(e.id),
            title: e.name,
            start: new Date(e.startDate!),
            end: new Date(e.endDate || e.startDate!),
            status: e.status
        }));

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
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, <span className="text-gradient">{userName.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-400">Here is your daily briefing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <SampleDataPopover />
                    {role !== 'staff' && (
                        <Link href="/dashboard/events/new" className="btn-primary flex items-center gap-2">
                            <span>+ New Event</span>
                        </Link>
                    )}
                </div>
            </header>

            <div className={styles.statsGrid}>
                <MetricCard
                    title="Revenue"
                    value="$45,231.89"
                    trend="+20.1%"
                    trendLabel="vs last month"
                    chartData={revenueData}
                    color="#818cf8"
                    icon={<DollarSign className="w-5 h-5" />}
                />
                <MetricCard
                    title="Active Events"
                    value={activeEvents}
                    trend="+3"
                    trendLabel="new this week"
                    icon={<CalendarDays className="w-5 h-5" />}
                    color="#34d399"
                    chartData={[{ value: 10 }, { value: 12 }, { value: 15 }, { value: 14 }, { value: 18 }, { value: 20 }]}
                />
                <MetricCard
                    title="Pending Quotes"
                    value={pendingQuotes}
                    trend="-2"
                    trendLabel="action required"
                    icon={<BarChart3 className="w-5 h-5" />}
                    color="#fbbf24"
                />

                {role !== 'staff' && (
                    <MetricCard
                        title="Staff Active"
                        value="24"
                        trend="+100%"
                        trendLabel="Full Team"
                        icon={<Users className="w-5 h-5" />}
                    />
                )}
            </div>

            <div className={styles.contentGrid}>
                {/* Main Content Area: Calendar */}
                <div className={`glass-card-3d ${styles.mainChart} relative flex flex-col`}>
                    <div className="flex-1 min-h-[500px]">
                        <DashboardCalendar events={calendarEvents} />
                    </div>
                </div>

                {/* Sidebar: Recent Activity */}
                <div className={`glass-card-3d ${styles.sideList} flex flex-col`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                        <button className="text-xs text-primary hover:text-primary-hover">View All</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {activities.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-10">No recent activities.</p>
                        ) : (
                            <ul className="space-y-0">
                                {activities.map((activity) => (
                                    <li key={activity.id} className={styles.activityItem}>
                                        <div className={styles.statusDot} style={{ background: getColor(activity.type), boxShadow: `0 0 10px ${getColor(activity.type)}40` }} />
                                        <div className="flex-1">
                                            <p className="text-slate-200 text-sm font-medium leading-snug">{activity.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">{timeAgo(activity.createdAt)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
