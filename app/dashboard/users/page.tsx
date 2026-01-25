import { getUsers } from '@/lib/actions/users';
import { UsersView } from './client-view';

export default async function UsersPage() {
    // Get users and filter for active management
    const allUsers = await getUsers();
    const users = allUsers.filter(u => u.status !== 'inactive');

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
            </div>

            <UsersView users={users} />
        </div>
    );
}
