import { getEventById } from '@/lib/actions/events';
import { getUsers } from '@/lib/actions/users';
import { getEventStaff, getEventEquipment, getEventMenuItems, getAllMenuItems, getEventTasks } from '@/lib/actions/event-planning';
import { getEquipment } from '@/lib/actions/equipment';
import { getEventShiftsWithBids, getStaffAvailability, getBlackoutDates } from '@/lib/actions/availability';
import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import ExportCalendarButton from '@/components/ExportCalendarButton';
import EventWorkspace from '@/components/event-planner/EventWorkspace';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: any = {
    inquiry: { label: 'Inquiry', color: 'var(--slate-400)', bg: 'rgba(148, 163, 184, 0.1)' },
    quote: { label: 'Quote Sent', color: 'var(--warning)', bg: 'rgba(251, 191, 36, 0.1)' },
    approved: { label: 'Approved', color: 'var(--primary)', bg: 'rgba(59, 130, 246, 0.1)' },
    active: { label: 'Active', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
    completed: { label: 'Completed', color: 'var(--slate-500)', bg: 'rgba(100, 116, 139, 0.1)' }
};

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const eventId = parseInt(id);
    const event = await getEventById(eventId);
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role || 'staff';

    if (!event) {
        notFound();
    }

    const [
        assignedStaff,
        allStaff,
        assignedEquipment,
        allEquipment,
        assignedMenu,
        allMenuItems,
        tasks,
        openShifts,
        allAvailability,
        blackoutDates
    ] = await Promise.all([
        getEventStaff(eventId),
        getUsers('active'), // Assuming only active users for assignment
        getEventEquipment(eventId),
        getEquipment(),
        getEventMenuItems(eventId),
        getAllMenuItems(),
        getEventTasks(eventId),
        getEventShiftsWithBids(eventId),
        getStaffAvailability(),
        getBlackoutDates()
    ]);

    const statusConfig = STATUS_CONFIG[event.status || 'inquiry'] || STATUS_CONFIG.inquiry;

    return (
        <div className="max-w-7xl mx-auto">
            <Link href="/dashboard/events" className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Events
            </Link>

            {/* Header */}
            <div className="glass-panel p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-3xl font-bold text-white">{event.name}</h1>
                            <span
                                className="badge px-3 py-1"
                                style={{
                                    color: statusConfig.color,
                                    backgroundColor: statusConfig.bg
                                }}
                            >
                                {statusConfig.label}
                            </span>
                        </div>
                        {event.eventType && (
                            <span className="badge bg-white/5 text-slate-400">
                                {event.eventType.replace('_', ' ')}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {role !== 'staff' && (
                            <Link href={`/dashboard/events/${eventId}/quote`} className="btn-secondary flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-500/30">
                                <FileText size={16} /> Quote Builder
                            </Link>
                        )}
                        <ExportCalendarButton event={event} />
                        {role !== 'staff' && (
                            <button className="btn-secondary flex items-center gap-2">
                                <Edit size={16} /> Edit
                            </button>
                        )}
                        {role === 'admin' && (
                            <button className="btn-secondary text-error flex items-center gap-2">
                                <Trash2 size={16} /> Delete
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Progress Bar */}
                <div className={styles.progressBar}>
                    <div className={`${styles.progressStep} ${['inquiry', 'quote', 'approved', 'active', 'completed'].indexOf(event.status || 'inquiry') >= 0 ? styles.active : ''}`}>
                        Inquiry
                    </div>
                    <div className={`${styles.progressStep} ${['quote', 'approved', 'active', 'completed'].indexOf(event.status || 'inquiry') >= 0 ? styles.active : ''}`}>
                        Quote
                    </div>
                    <div className={`${styles.progressStep} ${['approved', 'active', 'completed'].indexOf(event.status || 'inquiry') >= 0 ? styles.active : ''}`}>
                        Approved
                    </div>
                    <div className={`${styles.progressStep} ${['active', 'completed'].indexOf(event.status || 'inquiry') >= 0 ? styles.active : ''}`}>
                        Active
                    </div>
                    <div className={`${styles.progressStep} ${event.status === 'completed' ? styles.active : ''}`}>
                        Completed
                    </div>
                </div>
            </div>

            {/* Event Workspace (Tabs) */}
            <EventWorkspace
                event={event}
                assignedStaff={assignedStaff}
                allStaff={allStaff}
                assignedEquipment={assignedEquipment}
                allEquipment={allEquipment}
                assignedMenu={assignedMenu}
                allMenuItems={allMenuItems}
                tasks={tasks}
                openShifts={openShifts}
                allAvailability={allAvailability}
                blackoutDates={blackoutDates}
            />
        </div>
    );
}


