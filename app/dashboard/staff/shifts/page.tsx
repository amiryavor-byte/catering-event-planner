import { getAllOpenShifts, getMyBids } from '@/lib/actions/availability';
import ShiftMarket from '@/components/staff/ShiftMarket';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import { getDataService } from '@/lib/data/factory';

export const metadata = {
    title: 'Shift Market | Staff | Catering Planner',
};

export default async function StaffShiftsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/login');
    }

    const service = getDataService();
    const user = await service.getUserByEmail(session.user.email);

    if (!user) {
        return <div className="p-8 text-center text-red-400">User account not found via email match.</div>;
    }

    const [openShifts, myBids] = await Promise.all([
        getAllOpenShifts(),
        getMyBids()
    ]);

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Shift Marketplace</h1>
                    <p className="text-slate-400">Browse available shifts and apply for work.</p>
                </div>
            </div>

            <ShiftMarket shifts={openShifts} myBids={myBids} userId={user.id} />
        </div>
    );
}
