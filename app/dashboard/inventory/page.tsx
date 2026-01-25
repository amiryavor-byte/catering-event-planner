import { getEquipment } from '@/lib/actions/equipment';
import InventoryTable from './InventoryTable';
import { Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const data = await getEquipment();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Package className="text-warning" size={32} />
                    Equipment Inventory
                </h1>
                <p className="text-slate-400">
                    Manage your master list of equipment, including owned assets and rental items.
                </p>
            </div>

            <InventoryTable data={data} />
        </div>
    );
}
