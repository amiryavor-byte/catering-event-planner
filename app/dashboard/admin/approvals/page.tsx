import { getAllPendingRequests } from '@/lib/actions/availability';
import RequestApprovalList from '@/components/admin/RequestApprovalList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Approvals | Admin | Catering Planner',
};

export default async function AdminApprovalsPage() {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (!session?.user?.email) {
        redirect('/login');
    }

    const pendingRequests = await getAllPendingRequests();

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Time-Off Requests</h1>
                    <p className="text-slate-400">Review and approve staff unavailability requests.</p>
                </div>
            </div>

            <RequestApprovalList requests={pendingRequests} />
        </div>
    );
}
