'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    CalendarDays,
    UtensilsCrossed,
    Users,
    ClipboardList,
    Settings,
    LogOut,
    X,
    BarChart3,
    ChefHat,
    Package,
    GripVertical,
    GripHorizontal,
    ArrowRightToLine,
    ArrowLeftToLine,
    ArrowUpToLine,
    ArrowDownToLine,
    UserCircle
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import styles from './Sidebar.module.css';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export type SidebarMode = 'vertical-left' | 'vertical-right' | 'horizontal-top' | 'horizontal-bottom' | 'floating';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    mode: SidebarMode;
    position: { x: number; y: number };
    onModeChange: (mode: SidebarMode) => void;
    onPositionChange: (pos: { x: number; y: number }) => void;
}

export default function Sidebar({
    isOpen = false,
    onClose,
    mode,
    position,
    onModeChange,
    onPositionChange
}: SidebarProps) {
    const pathname = usePathname();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // State for Popovers
    const [mainOpen, setMainOpen] = useState(false);
    const [managementOpen, setManagementOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    const mainBtnRef = useRef<HTMLButtonElement>(null);
    const managementBtnRef = useRef<HTMLButtonElement>(null);
    const accountBtnRef = useRef<HTMLButtonElement>(null);

    // Snap State
    const [snapCandidate, setSnapCandidate] = useState<SidebarMode | null>(null);
    const [showDockPrompt, setShowDockPrompt] = useState(false);

    // Helper to determine if we are currently horizontal
    const isHorizontal = mode === 'horizontal-top' || mode === 'horizontal-bottom';

    // Dragging State
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hasMoved, setHasMoved] = useState(false);

    // --- Drag Logic ---

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;

        setIsDragging(true);
        setHasMoved(false);

        const rect = sidebarRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
        e.preventDefault();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        // Threshold for immediate mode switch
        if (!hasMoved && (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2)) {
            setHasMoved(true);
            if (mode !== 'floating') {
                onModeChange('floating');
            }
        }

        // Bounding logic
        const width = sidebarRef.current?.offsetWidth || 280;
        const height = sidebarRef.current?.offsetHeight || 600;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + width > screenW) newX = screenW - width;
        if (newY + height > screenH) newY = screenH - height;

        const SNAP_THRESHOLD = 50;
        let candidate: SidebarMode | null = null;

        if (e.clientX < SNAP_THRESHOLD) candidate = 'vertical-left';
        else if (e.clientX > screenW - SNAP_THRESHOLD) candidate = 'vertical-right';
        else if (e.clientY < SNAP_THRESHOLD) candidate = 'horizontal-top';
        else if (e.clientY > screenH - SNAP_THRESHOLD) candidate = 'horizontal-bottom';

        onPositionChange({ x: newX, y: newY });
        setSnapCandidate(candidate);

    }, [isDragging, dragOffset, onPositionChange, hasMoved, mode, onModeChange]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        if (snapCandidate && snapCandidate !== mode) {
            // Check if we should prompt
            setShowDockPrompt(true);
        } else {
            // Just drop here (Floating)
            if (mode !== 'floating') {
                onModeChange('floating');
            }
        }
    }, [isDragging, snapCandidate, mode, onModeChange]);

    // Attach global listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // --- Docking Handlers ---
    const confirmDock = () => {
        if (snapCandidate) {
            onModeChange(snapCandidate);
        }
        setShowDockPrompt(false);
        setSnapCandidate(null);
    };

    const cancelDock = () => {
        setShowDockPrompt(false);
        setSnapCandidate(null);
        onModeChange('floating'); // Revert to floating at the dropped position
    };

    // --- Dynamic Styles ---
    const getStyle = () => {
        const style: React.CSSProperties = {
            transition: isDragging ? 'none' : undefined
        };

        if (mode === 'floating' || isDragging) {
            style.position = 'fixed';
            style.left = position.x;
            style.top = position.y;
            style.transform = 'none';
            style.right = 'auto';
            style.bottom = 'auto';
        } else {
            // If docked, CSS classes handle position mostly, but we might need explicit resets
            if (mode === 'vertical-left') {
                style.left = 0;
                style.top = 0;
                style.bottom = 0;
            }
            if (mode === 'vertical-right') {
                style.right = 0;
                style.top = 0;
                style.bottom = 0;
                style.left = 'auto';
            }
            if (mode === 'horizontal-top') {
                style.top = 0;
                style.left = 0;
                style.right = 0;
                style.width = '100%';
            }
            if (mode === 'horizontal-bottom') {
                style.bottom = 0;
                style.left = 0;
                style.right = 0;
                style.width = '100%';
                style.top = 'auto';
            }
        }

        return style;
    };

    const getClassNames = () => {
        const classes = [styles.sidebar];
        if (isOpen) classes.push(styles.sidebarOpen);
        if (mode === 'floating') classes.push(styles.floating);
        if (isDragging) classes.push(styles.dragging);
        if (mode.startsWith('horizontal')) classes.push(styles.horizontal);
        if (mode === 'horizontal-bottom') classes.push(styles.bottom);
        return classes.join(' ');
    };

    return (
        <>
            {/* Mobile Backdrop - Only active if strictly in mobile overlay mode logic */}
            {isOpen && mode === 'vertical-left' && (
                <div
                    className={`${styles.backdrop} ${styles.backdropVisible}`}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Ghost Indicator for Snap */}
            {isDragging && snapCandidate && (
                <div
                    className={styles.snapGhost}
                    style={{
                        top: snapCandidate.includes('bottom') ? 'auto' : 0,
                        bottom: snapCandidate.includes('bottom') ? 0 : 'auto',
                        left: snapCandidate.includes('right') ? 'auto' : 0,
                        right: snapCandidate.includes('right') ? 0 : 'auto',
                        width: snapCandidate.startsWith('horizontal') ? '100%' : '280px',
                        height: snapCandidate.startsWith('horizontal') ? '80px' : '100%',
                    }}
                />
            )}

            {/* Prompt Dialog */}
            {showDockPrompt && (
                <div className={styles.dockPrompt}>
                    <h4>Dock to {snapCandidate?.split('-')[1]}?</h4>
                    <div className={styles.dockButtons}>
                        <button className={styles.confirmBtn} onClick={confirmDock}>Yes, Lock it</button>
                        <button className={styles.cancelBtn} onClick={cancelDock}>No, stick here</button>
                    </div>
                </div>
            )}

            <aside
                ref={sidebarRef}
                className={getClassNames()}
                style={getStyle()}
            >
                {/* Drag Handle Area (Logo) */}
                <div
                    className={`${styles.logoContainer} ${styles.dragHandle}`}
                    onMouseDown={handleMouseDown}
                    title="Drag to move"
                >
                    <div className={styles.logoIcon}>
                        <UtensilsCrossed size={24} />
                    </div>
                    {/* Only show text if not condensed or check layout */}
                    <span className={styles.logoText}>CaterPlan</span>

                    {/* Visual Grip Indicator */}
                    <div className="ml-auto opacity-50">
                        <GripVertical size={16} />
                    </div>
                </div>

                {/* Close Button (Mobile) */}
                <button
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="Close sidebar"
                >
                    <X size={20} />
                </button>

                <nav className={styles.nav}>
                    {/* Main Section */}
                    <div className={styles.navSection}>
                        <button
                            ref={mainBtnRef}
                            className={`${styles.sectionToggle} ${mainOpen ? styles.sectionToggleActive : ''}`}
                            onClick={() => {
                                const newState = !mainOpen;
                                setMainOpen(newState);
                                if (newState) {
                                    setManagementOpen(false);
                                    setAccountOpen(false);
                                }
                            }}
                        >
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                            <div className={`${styles.chevron} ${mainOpen ? styles.chevronOpen : ''}`}>
                                <ArrowDownToLine size={14} />
                            </div>
                        </button>

                        {mainOpen && (
                            <div className={`${styles.sectionLinks} ${isHorizontal ? styles.popover : ''}`}>
                                <NavLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" current={pathname} />
                                <NavLink href="/dashboard/calendar" icon={<CalendarDays size={18} />} label="Calendar" current={pathname} />
                                <NavLink href="/dashboard/kitchen" icon={<ChefHat size={18} />} label="Kitchen" current={pathname} />
                                <NavLink href="/dashboard/events" icon={<ClipboardList size={18} />} label="Events" current={pathname} partial />
                                <NavLink href="/dashboard/analytics" icon={<BarChart3 size={18} />} label="Analytics" current={pathname} />
                            </div>
                        )}
                    </div>

                    {/* Management Section */}
                    <div className={styles.navSection}>
                        <button
                            ref={managementBtnRef}
                            className={`${styles.sectionToggle} ${managementOpen ? styles.sectionToggleActive : ''}`}
                            onClick={() => {
                                const newState = !managementOpen;
                                setManagementOpen(newState);
                                if (newState) {
                                    setMainOpen(false);
                                    setAccountOpen(false);
                                }
                            }}
                        >
                            <Settings size={18} />
                            <span>Management</span>
                            <div className={`${styles.chevron} ${managementOpen ? styles.chevronOpen : ''}`}>
                                <ArrowDownToLine size={14} />
                            </div>
                        </button>

                        {managementOpen && (
                            <div className={`${styles.sectionLinks} ${isHorizontal ? styles.popover : ''}`}>
                                <NavLink href="/dashboard/menus" icon={<UtensilsCrossed size={18} />} label="Menus" current={pathname} partial />
                                <NavLink href="/dashboard/users" icon={<Users size={18} />} label="Users" current={pathname} partial />
                                <NavLink href="/dashboard/inventory" icon={<Package size={18} />} label="Equipment" current={pathname} partial />
                                <NavLink href="/dashboard/staff" icon={<Users size={18} />} label="Staff" current={pathname} partial />
                                <NavLink href="/dashboard/clients" icon={<Users size={18} />} label="Clients" current={pathname} partial />
                            </div>
                        )}
                    </div>

                    {/* Account/Settings Section */}
                    <div className={styles.navSection}>
                        <button
                            ref={accountBtnRef}
                            className={`${styles.sectionToggle} ${accountOpen ? styles.sectionToggleActive : ''}`}
                            onClick={() => {
                                const newState = !accountOpen;
                                setAccountOpen(newState);
                                if (newState) {
                                    setMainOpen(false);
                                    setManagementOpen(false);
                                }
                            }}
                        >
                            <UserCircle size={18} />
                            <span>Account</span>
                            <div className={`${styles.chevron} ${accountOpen ? styles.chevronOpen : ''}`}>
                                <ArrowDownToLine size={14} />
                            </div>
                        </button>

                        {accountOpen && (
                            <div className={`${styles.sectionLinks} ${isHorizontal ? styles.popover : ''} ${isHorizontal ? styles.popoverRight : ''}`}>
                                <NavLink href="/dashboard/settings" icon={<Settings size={18} />} label="Settings" current={pathname} />
                                <button className={styles.navItem} onClick={() => signOut({ callbackUrl: '/login' })}>
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </aside>
        </>
    );
}

// Helper Component for cleaner JSX
function NavLink({ href, icon, label, current, partial = false }: { href: string; icon: React.ReactNode; label: string; current: string; partial?: boolean }) {
    const isActive = partial ? current.startsWith(href) : current === href;
    return (
        <Link href={href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}
