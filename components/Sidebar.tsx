import Link from 'next/link';
import {
    LayoutDashboard,
    CalendarDays,
    UtensilsCrossed,
    Users,
    ClipboardList,
    Settings,
    LogOut
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <div className={styles.logoIcon}>
                    <UtensilsCrossed size={24} />
                </div>
                <span className={styles.logoText}>CaterPlan</span>
            </div>

            <nav className={styles.nav}>
                <div className={styles.navSection}>
                    <span className={styles.sectionTitle}>Main</span>
                    <Link href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/calendar" className={styles.navItem}>
                        <CalendarDays size={20} />
                        <span>Calendar</span>
                    </Link>
                    <Link href="/dashboard/events" className={styles.navItem}>
                        <ClipboardList size={20} />
                        <span>Events</span>
                    </Link>
                </div>

                <div className={styles.navSection}>
                    <span className={styles.sectionTitle}>Management</span>
                    <Link href="/dashboard/menu" className={styles.navItem}>
                        <UtensilsCrossed size={20} />
                        <span>Menu & Recipes</span>
                    </Link>
                    <Link href="/dashboard/users" className={styles.navItem}>
                        <Users size={20} />
                        <span>Users & Access</span>
                    </Link>
                    <Link href="/dashboard/staff" className={styles.navItem}>
                        <Users size={20} />
                        <span>Staff</span>
                    </Link>
                    <Link href="/dashboard/clients" className={styles.navItem}>
                        <Users size={20} />
                        <span>Clients</span>
                    </Link>
                </div>

                <div className={styles.navSection}>
                    <span className={styles.sectionTitle}>System</span>
                    <Link href="/settings" className={styles.navItem}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                </div>
            </nav>

            <div className={styles.footer}>
                <button className={styles.logoutBtn}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
