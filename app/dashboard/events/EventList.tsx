'use client';

import { SmartTable, Column } from '@/components/ui/smart-table/SmartTable';
import { useRouter } from 'next/navigation';
import { patchEvent } from '@/lib/actions/events';

export default function EventList({ events, onEventClick }: { events: any[], onEventClick?: (event: any) => void }) {
    const router = useRouter();

    const STATUS_CONFIG: any = {
        inquiry: { label: 'Inquiry', color: 'var(--slate-400)', bg: 'rgba(148, 163, 184, 0.1)' },
        quote: { label: 'Quote Sent', color: 'var(--warning)', bg: 'rgba(251, 191, 36, 0.1)' },
        approved: { label: 'Approved', color: 'var(--primary)', bg: 'rgba(59, 130, 246, 0.1)' },
        active: { label: 'Active', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
        completed: { label: 'Completed', color: 'var(--slate-500)', bg: 'rgba(100, 116, 139, 0.1)' }
    };

    const columns: Column<any>[] = [
        {
            header: 'Event Name',
            key: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <div className="font-semibold text-white">{row.name}</div>
                    <div className="text-xs text-slate-400">{row.eventType?.replace('_', ' ')}</div>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            sortable: true,
            render: (row) => {
                const config = STATUS_CONFIG[row.status] || STATUS_CONFIG.inquiry;
                return (
                    <span
                        className="badge px-2 py-1 text-xs rounded-full"
                        style={{ color: config.color, backgroundColor: config.bg }}
                    >
                        {config.label}
                    </span>
                );
            }
        },
        {
            header: 'Date',
            key: 'startDate',
            sortable: true,
            render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString() : 'TBD'
        },
        {
            header: 'Guests',
            key: 'guestCount',
            sortable: true,
            editable: true,
            inputType: 'number',
            render: (row) => row.guestCount ? `${row.guestCount}` : '-'
        },
        {
            header: 'Budget',
            key: 'estimatedBudget',
            sortable: true,
            editable: true,
            inputType: 'number',
            render: (row) => row.estimatedBudget ? `$${row.estimatedBudget.toLocaleString()}` : '-'
        }
    ];

    return (
        <SmartTable
            data={events}
            columns={columns}

            onRowClick={(row) => {
                if (onEventClick) {
                    onEventClick(row);
                } else {
                    router.push(`/dashboard/events/${row.id}`);
                }
            }}
            onUpdate={async (id, field, value) => {
                await patchEvent(Number(id), { [field]: Number(value) });
            }}
        />
    );
}
