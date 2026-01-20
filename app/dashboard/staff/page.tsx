import styles from '@/app/dashboard/page.module.css';

export default function StaffDashboardPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
                    <p className="text-slate-400">Next Shift: Tomorrow @ 2:00 PM (Smith Wedding)</p>
                </div>
                <button className="btn-primary" style={{ background: 'var(--success)' }}>
                    Punch In
                </button>
            </header>

            <div className={styles.statsGrid}>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium">Hours This Week</h3>
                    <p className="text-4xl font-bold text-white mt-2">18.5</p>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium">Pending Tasks</h3>
                    <p className="text-4xl font-bold text-white mt-2">3</p>
                    <span className="text-warning text-sm">Due Today</span>
                </div>
                <div className="card">
                    <h3 className="text-slate-400 text-sm font-medium">Est. Pay</h3>
                    <p className="text-4xl font-bold text-white mt-2">$420</p>
                </div>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold mb-4 text-white">My Schedule</h2>
                <div className="glass-panel p-10 text-center text-slate-500">
                    [Calendar Component Will Go Here]
                </div>
            </div>
        </div>
    );
}
