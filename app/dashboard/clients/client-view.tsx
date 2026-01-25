'use client';

import { SmartTable, Column } from '@/components/ui/smart-table/SmartTable';
import { User } from '@/lib/data/types';
import { createClient, updateClient } from '@/lib/actions/clients';
import { useState } from 'react';
import { GlassModal } from '@/components/ui/GlassModal';

export function ClientsView({ clients }: { clients: User[] }) {
    const columns: Column<User>[] = [

        { key: 'name', header: 'Name', sortable: true, editable: true },
        { key: 'email', header: 'Email', sortable: true, editable: true },
        { key: 'phoneNumber', header: 'Phone', editable: true },
        { key: 'address', header: 'Address', editable: true },
        {
            key: 'status',
            header: 'Status',
            render: (user) => (
                <span className={`px-2 py-0.5 rounded-full text-xs border ${user.status === 'active'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                    {user.status?.toUpperCase()}
                </span>
            )
        }
    ];

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleAddClient(formData: FormData) {
        setIsLoading(true);
        try {
            await createClient({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phoneNumber: formData.get('phone') as string,
                address: formData.get('address') as string
            });
            setIsAddModalOpen(false);
        } catch (error) {
            alert('Failed to create client'); // Minimal fallback for now
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
                    Add Client
                </button>
            </div>

            <SmartTable
                data={clients}
                columns={columns}
                onRowClick={(client) => {
                    // Start with basic alert or navigation, can be expanded to detail view
                    console.log('Clicked client:', client);
                }}
                onUpdate={async (id, field, value) => {
                    await updateClient(Number(id), { [field]: value });
                }}
            />

            <GlassModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Client"
            >
                <form action={handleAddClient} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                        <input name="name" required placeholder="Jane Doe" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                        <input name="email" type="email" required placeholder="jane@example.com" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                        <input name="phone" placeholder="(555) 123-4567" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Address</label>
                        <input name="address" placeholder="123 Main St, New York, NY" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? 'Creating...' : 'Create Client'}
                        </button>
                    </div>
                </form>
            </GlassModal>
        </div>
    );
}
