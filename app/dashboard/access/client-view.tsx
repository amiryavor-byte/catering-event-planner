'use client';

import { SmartTable, ColumnDef } from '@/components/ui/smart-table/SmartTable';
import { User } from '@/lib/data/types';
import { updateAccess } from '@/lib/actions/access';

export function AccessView({ users }: { users: User[] }) {
    const columns: ColumnDef<User>[] = [
        { key: 'name', header: 'Name', editable: false, sortable: true },
        { key: 'email', header: 'Email', editable: false, sortable: true },
        {
            key: 'role',
            header: 'Role',
            editable: true,
            inputType: 'select',
            selectOptions: [
                { label: 'Admin', value: 'admin' },
                { label: 'Staff', value: 'staff' },
                { label: 'Client', value: 'client' }
            ],
            render: (user) => (
                <span className={`font-bold ${user.role === 'admin' ? 'text-primary' : 'text-slate-300'
                    }`}>
                    {user.role.toUpperCase()}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Account Status',
            editable: true,
            inputType: 'select',
            selectOptions: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
            ],
            render: (user) => (
                <span className={`px-2 py-0.5 rounded-full text-xs border ${user.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    {user.status?.toUpperCase()}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="glass-panel p-6 bg-blue-500/5 border-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Access Control</h3>
                <p className="text-sm text-slate-400">
                    Manage system access levels. Use this table to quickly promote/demote users or revoke access.
                </p>
            </div>

            <SmartTable
                data={users}
                columns={columns}
                // @ts-ignore
                onUpdate={async (id, key, val) => {
                    // We only care if we are updating role or status here, 
                    // though smart table is generic.
                    // Ideally we should use specific updateAccess action but 
                    // updateUser is simpler if arguments match.
                    // But access.ts has updateAccess(id, role, status)
                    // SmartTable calls onUpdate(id, key, val)

                    // We need to map this generic call to specific server action if needed,
                    // or just use generic updateUser action which works for individual fields.

                    // Let's rely on generic updateUser from access.ts? 
                    // Actually updateAccess expects (id, role, status).
                    // So we can't use updateAccess directly if we only change one field.
                    // We should use updateUser from users.ts? Or make updateAccess generic?
                    // Let's use updateUser from users for simplicity as it accepts Partial<User>.
                    const { updateUser } = await import('@/lib/actions/users');
                    await updateUser(Number(id), { [key]: val });
                }}
                searchPlaceholder="Search users to modify access..."
            />
        </div>
    );
}
