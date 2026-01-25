'use client';

import { Menu, UtensilsCrossed } from 'lucide-react';
import styles from './MobileNav.module.css';
import { NotificationCenter } from './NotificationCenter';

interface MobileNavProps {
    onOpen: () => void;
}

export default function MobileNav({ onOpen }: MobileNavProps) {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoContainer}>
                    <div className={styles.logoIcon}>
                        <UtensilsCrossed size={20} />
                    </div>
                    <span className={styles.logoText}>CaterPlan</span>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationCenter />
                    <button
                        onClick={onOpen}
                        className={styles.menuBtn}
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>
        </div>
    );
}
