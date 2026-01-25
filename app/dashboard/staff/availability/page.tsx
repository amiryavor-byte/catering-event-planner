import { getMyAvailability } from '@/lib/actions/availability';
import AvailabilityCalendar from '@/components/staff/AvailabilityCalendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import { getDataService } from '@/lib/data/factory';
import ExportScheduleButton from '@/components/staff/ExportScheduleButton';

export const metadata = {
    title: 'My Availability | Catering Planner',
};

export default async function StaffAvailabilityPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/login');
    }

    const service = getDataService();
    const user = await service.getUserByEmail(session.user.email);

    if (!user) {
        return <div className="p-8 text-center text-red-400">User account not found via email match.</div>;
    }

    // Fetch initial data (e.g. for current month range + buffer, or just all future?)
    // For simplicity, let's fetch a broad range or default.
    // The getMyAvailability action handles fetching for the user. 
    // We can pass empty dates to get "all relevant" or defaults.
    const availability = await getMyAvailability();

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">My Availability</h1>
                    <p className="text-slate-400">Manage your working hours and time-off requests.</p>
                </div>
                <ExportScheduleButton />
            </div>

            <AvailabilityCalendar initialData={availability} userId={user.id} />
        </div>
    );
}
