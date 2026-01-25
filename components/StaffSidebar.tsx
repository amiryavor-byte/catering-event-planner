'use client';

import Link from 'next/link';
import {
    CalendarDays,
    ClipboardList,
    Clock,
    LogOut,
    UserCheck
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import styles from '@/components/Sidebar.module.css'; // Re-use styles

export default function StaffSidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <div className={styles.logoIcon} style={{ background: 'var(--secondary)' }}>
                    <UserCheck size={24} />
                </div>
                <span className={styles.logoText}>Staff Portal</span>
            </div>

            <nav className={styles.nav}>
                <div className={styles.navSection}>
                    <span className={styles.sectionTitle}>My Work</span>
                    <Link href="/dashboard/staff" className={`${styles.navItem} ${styles.active}`}>
                        <CalendarDays size={20} />
                        <span>My Calendar</span>
                    </Link>
                    <Link href="/dashboard/staff/tasks" className={styles.navItem}>
                        <ClipboardList size={20} />
                        <span>My Tasks</span>
                    </Link>
                    <Link href="/dashboard/staff/timeclock" className={styles.navItem}>
                        <Clock size={20} />
                        <span>Time Clock</span>
                    </Link>
                </div>
            </nav>

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
