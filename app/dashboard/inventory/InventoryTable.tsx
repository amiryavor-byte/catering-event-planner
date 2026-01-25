'use client';

import { SmartTable } from '@/components/ui/smart-table/SmartTable';
import { addEquipment, updateEquipment, deleteEquipment } from '@/lib/actions/equipment';

export default function InventoryTable({ data }: { data: any[] }) {
    const handleAdd = async () => {
        await addEquipment({
            name: 'New Item',
            type: 'owned',
            defaultRentalCost: 0,
            replacementCost: 0
        });
    };

    const handleUpdate = async (id: number | string, field: string, value: any) => {
        await updateEquipment(Number(id), { [field]: value });
    };

    const handleDelete = async (id: number | string) => {
        await deleteEquipment(Number(id));
    };

    return (
        <SmartTable
            data={data}
            columns={[
                { key: 'name', header: 'Item Name', sortable: true, editable: true },
                {
                    key: 'type',
                    header: 'Type',
                    sortable: true,
                    editable: true,
                    inputType: 'select',
                    selectOptions: [
                        { value: 'owned', label: 'Owned' },
                        { value: 'rental', label: 'Rental' }
                    ]
                },
                {
                    key: 'defaultRentalCost',
                    header: 'Rental Cost ($)',
                    sortable: true,
                    editable: true,
                    inputType: 'number',
                    render: (item: any) => item.defaultRentalCost ? `$${Number(item.defaultRentalCost).toFixed(2)}` : '-'
                },
                {
                    key: 'replacementCost',
                    header: 'Replacement Cost ($)',
                    sortable: true,
                    editable: true,
                    inputType: 'number',
                    render: (item: any) => item.replacementCost ? `$${Number(item.replacementCost).toFixed(2)}` : '-'
                }
            ]}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
        />
    );
}
