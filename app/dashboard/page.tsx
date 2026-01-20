import styles from './page.module.css';

export default function DashboardPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Admin</h1>
                    <p className="text-slate-400">Here's what's happening today.</p>
                </div>
                <button className="btn-primary">+ New Event</button>
            </header>

            <div className={styles.statsGrid}>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium">Active Events</h3>
                    <p className="text-4xl font-bold text-white mt-2">12</p>
                    <span className="text-success text-sm">+2 this week</span>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium">Pending Quotes</h3>
                    <p className="text-4xl font-bold text-white mt-2">5</p>
                    <span className="text-warning text-sm">Requires action</span>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium">Total Revenue (Feb)</h3>
                    <p className="text-4xl font-bold text-white mt-2">$45.2k</p>
                    <span className="text-success text-sm">+12% vs last month</span>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium">Staff Active</h3>
                    <p className="text-4xl font-bold text-white mt-2">24</p>
                    <span className="text-slate-500 text-sm">Across 3 events</span>
                </div>
            </div>

            <div className={styles.contentGrid}>
                <div className={`card ${styles.mainChart}`}>
                    <h2 className="text-xl font-semibold mb-4 text-white">Upcoming Events</h2>
                    <div className="glass-panel p-4 h-64 flex items-center justify-center text-slate-500">
                        [Calendar / Timeline Placeholder]
                    </div>
                </div>

                <div className={`card ${styles.sideList}`}>
                    <h2 className="text-xl font-semibold mb-4 text-white">Recent Activities</h2>
                    <ul className="space-y-4">
                        <li className={styles.activityItem}>
                            <div className={styles.statusDot} style={{ background: 'var(--success)' }} />
                            <div>
                                <p className="text-white text-sm">Quote Approved: Smith Wedding</p>
                                <p className="text-xs text-slate-500">2 mins ago</p>
                            </div>
                        </li>
                        <li className={styles.activityItem}>
                            <div className={styles.statusDot} style={{ background: 'var(--warning)' }} />
                            <div>
                                <p className="text-white text-sm">New Inquiry: Corp Lunch</p>
                                <p className="text-xs text-slate-500">15 mins ago</p>
                            </div>
                        </li>
                        <li className={styles.activityItem}>
                            <div className={styles.statusDot} style={{ background: 'var(--primary)' }} />
                            <div>
                                <p className="text-white text-sm">Staff Schedule Updated</p>
                                <p className="text-xs text-slate-500">1 hour ago</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
