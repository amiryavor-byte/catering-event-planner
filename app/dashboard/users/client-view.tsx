'use client';

import { SmartTable, Column } from '@/components/ui/smart-table/SmartTable';
import { User } from '@/lib/data/types';
import { inviteUser, updateUser, deleteUser, bulkDeleteUsers, resetPassword } from '@/lib/actions/users';
import { useState } from 'react';
import { GlassModal } from '@/components/ui/GlassModal';
import { RotateCcw, Trash2 } from 'lucide-react';

export function UsersView({ users }: { users: User[] }) {
    const columns: Column<User>[] = [
        { key: 'name', header: 'Name', sortable: true, editable: true },
        { key: 'email', header: 'Email', sortable: true, editable: true },
        { key: 'phoneNumber', header: 'Phone' },
        {
            key: 'role',
            header: 'Role',
            editable: true,
            inputType: 'select',
            selectOptions: [
                { label: 'Staff', value: 'staff' },
                { label: 'Admin', value: 'admin' },
                { label: 'Client', value: 'client' }
            ],
            render: (user) => (
                <span className="capitalize">{user.role}</span>
            )
        },
        { key: 'jobTitle', header: 'Job Title', sortable: true, editable: true },
        {
            key: 'hourlyRate',
            header: 'Rate ($)',
            editable: true,
            inputType: 'number',
            render: (user) => user.hourlyRate ? `$${user.hourlyRate}` : '-'
        },
        {
            key: 'status',
            header: 'Status',
            render: (user) => (
                <span className={`px-2 py-0.5 rounded-full text-xs border ${user.status === 'active'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : user.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                    {user.status?.toUpperCase()}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (user) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Reset password for ${user.name}?`)) {
                                try {
                                    await resetPassword(user.id);
                                    alert('Password reset link sent (stub)');
                                } catch (error) {
                                    alert('Failed to reset password');
                                }
                            }
                        }}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Reset Password"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            )
        }
    ];

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleAddUser(formData: FormData) {
        setIsLoading(true);
        try {
            await inviteUser({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as 'admin' | 'staff' | 'client'
            });
            setIsAddModalOpen(false);
        } catch (error) {
            alert('Failed to invite user');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary"
                >
                    Invite User
                </button>
            </div>

            <SmartTable
                data={users}
                columns={columns}
                onRowClick={(user) => {
                    console.log('Clicked user:', user);
                }}
                onUpdate={async (id, field, value) => {
                    await updateUser(Number(id), { [field]: field === 'hourlyRate' ? Number(value) : value });
                }}
                selectable={true}
                onBulkDelete={async (ids) => {
                    await bulkDeleteUsers(ids.map(id => Number(id)));
                }}
                onDelete={async (id) => {
                    await deleteUser(Number(id));
                }}
            />

            <GlassModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Invite New User"
            >
                <form action={handleAddUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                        <input name="name" required placeholder="John Smith" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                        <input name="email" type="email" required placeholder="john@example.com" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                        <select name="role" defaultValue="staff" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none">
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                            <option value="client">Client</option>
                        </select>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? 'Sending Invite...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </GlassModal>
        </div>
    );
}
