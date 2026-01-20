import { getUsers, approveUser, inviteUser } from '@/lib/actions/users';
import { User } from '@/lib/data/types';
import { Check, Mail, ShieldAlert, UserPlus, Clock } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function UsersPage() {
    const pendingUsers = await getUsers('pending');
    const activeUsers = await getUsers('active');

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>

            {/* Invite Section */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <UserPlus className="text-primary" />
                    Invite New User
                </h2>
                <p className="text-slate-400 mb-6 text-sm">
                    Invited users bypass the approval queue and get immediate access.
                </p>
                <form action={async (formData) => {
                    'use server';
                    await inviteUser({
                        name: formData.get('name') as string,
                        email: formData.get('email') as string,
                        role: formData.get('role') as any
                    });
                }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                        <input name="name" required placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Email (Google/Apple ID)</label>
                        <input name="email" type="email" required placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                        <select name="role" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white">
                            <option value="staff">Staff</option>
                            <option value="client">Client</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary h-[42px]">
                        Send Invite
                    </button>
                </form>
            </div>

            {/* Pending Approvals */}
            {pendingUsers.length > 0 && (
                <div className="glass-panel p-6 border-l-4 border-l-yellow-500">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="text-yellow-500" />
                        Pending Approvals ({pendingUsers.length})
                    </h2>
                    <div className="space-y-3">
                        {pendingUsers.map((user: User) => (
                            <div key={user.email} className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                                <div>
                                    <h3 className="text-white font-medium">{user.name}</h3>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                        Role Request: {user.role}
                                    </span>
                                </div>
                                <form action={async () => {
                                    'use server';
                                    await approveUser(user.email);
                                }}>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors">
                                        <Check size={16} />
                                        Approve
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Users */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Active Users</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 border-b border-white/10">
                                <th className="pb-3 px-4">Name</th>
                                <th className="pb-3 px-4">Email</th>
                                <th className="pb-3 px-4">Role</th>
                                <th className="pb-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeUsers.map((user: User) => (
                                <tr key={user.email} className="text-sm text-slate-300 hover:bg-white/5">
                                    <td className="py-3 px-4">{user.name}</td>
                                    <td className="py-3 px-4">{user.email}</td>
                                    <td className="py-3 px-4 capitalize">{user.role}</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
