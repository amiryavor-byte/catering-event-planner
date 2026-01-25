import { getAccessUsers } from '@/lib/actions/access';
import { AccessView } from './client-view';

export default async function AccessPage() {
    const users = await getAccessUsers();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Access & Roles</h1>
                    <p className="text-slate-400">Manage user roles and system permissions.</p>
                </div>
            </div>

            <AccessView users={users} />
        </div>
    );
}
