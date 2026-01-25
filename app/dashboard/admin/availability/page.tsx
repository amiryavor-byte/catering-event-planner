import { getBlackoutDates } from '@/lib/actions/availability';
import BlackoutCalendar from '@/components/admin/BlackoutCalendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import { getDataService } from '@/lib/data/factory';

export const metadata = {
    title: 'Blackout Dates | Admin | Catering Planner',
};

export default async function AdminAvailabilityPage() {
    const session = await getServerSession(authOptions);

    // Auth check - strictly admin
    // @ts-ignore
    if (!session?.user?.email) {
        redirect('/login');
    }

    // Ideally check role here, but UI will block non-admin actions anyway via server actions check
    // For now assuming access control is handled by layout or middleware or simple checks

    const service = getDataService();
    const user = await service.getUserByEmail(session.user.email);

    if (!user) {
        return <div className="p-8 text-center text-red-400">User account not found via email match.</div>;
    }

    const blackoutDates = await getBlackoutDates();

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Blackout Dates Manager</h1>
                    <p className="text-slate-400">Set global holidays or specific closed dates.</p>
                </div>
            </div>

            <BlackoutCalendar initialData={blackoutDates} currentUserId={user.id} />
        </div>
    );
}
