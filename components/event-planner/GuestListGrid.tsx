'use client';

import { SmartTable, Column } from '@/components/ui/smart-table/SmartTable';
import { useState, useEffect } from 'react';
import { getGuests, updateGuest, deleteGuest, createGuest } from '@/lib/actions/guests';

interface Guest {
    id: number;
    name: string;
    email: string | null;
    dietaryRequirements: string | null;
    rsvpStatus: 'pending' | 'attending' | 'declined' | null;
    tableNumber: string | null;
    notes: string | null;
}

export default function GuestListGrid({ eventId }: { eventId: number }) {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadGuests = async () => {
        setIsLoading(true);
        try {
            const data = await getGuests(eventId);
            setGuests(data);
        } catch (error) {
            console.error('Failed to load guests', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGuests();
    }, [eventId]);

    const handleUpdate = async (id: number | string, field: string, value: any) => {
        // Optimistic update
        setGuests(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
        try {
            await updateGuest(Number(id), { [field]: value });
        } catch (error) {
            console.error('Failed to update guest', error);
            loadGuests(); // Revert on error
        }
    };

    const handleDelete = async (id: number | string) => {
        try {
            await deleteGuest(Number(id));
            setGuests(prev => prev.filter(g => g.id !== id));
        } catch (error) {
            console.error('Failed to delete guest', error);
        }
    };

    const handleAdd = async () => {
        // Add placeholder or modal? For grid, a quick prompt or modal is fine.
        // Let's create a default guest and let them edit it inline (Excel style)
        try {
            const newGuest = await createGuest({
                eventId,
                name: 'New Guest',
                rsvpStatus: 'pending'
            });
            setGuests(prev => [newGuest, ...prev]);
        } catch (error) {
            console.error('Failed to create guest', error);
        }
    };

    const columns: Column<Guest>[] = [
        { key: 'name', header: 'Guest Name', sortable: true, editable: true },
        { key: 'email', header: 'Email', sortable: true, editable: true, inputType: 'email' },
        {
            key: 'rsvpStatus',
            header: 'RSVP',
            sortable: true,
            editable: true,
            inputType: 'select',
            selectOptions: [
                { label: 'Pending', value: 'pending' },
                { label: 'Attending', value: 'attending' },
                { label: 'Declined', value: 'declined' }
            ],
            render: (row) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.rsvpStatus === 'attending' ? 'bg-green-500/10 text-green-400' :
                    row.rsvpStatus === 'declined' ? 'bg-red-500/10 text-red-400' :
                        'bg-slate-500/10 text-slate-400'
                    }`}>
                    {row.rsvpStatus ? row.rsvpStatus.charAt(0).toUpperCase() + row.rsvpStatus.slice(1) : 'Pending'}
                </span>
            )
        },
        { key: 'dietaryRequirements', header: 'Dietary', sortable: true, editable: true },
        { key: 'tableNumber', header: 'Table #', sortable: true, editable: true },
        { key: 'notes', header: 'Notes', editable: true }
    ];

    if (isLoading && guests.length === 0) {
        return <div className="p-8 text-center text-slate-500">Loading guests...</div>;
    }

    return (
        <SmartTable
            data={guests}
            columns={columns}

            searchPlaceholder="Search guests..."
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAdd={handleAdd}
        />
    );
}
