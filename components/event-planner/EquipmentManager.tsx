'use client';

import { useState } from 'react';
import { addEquipmentToEvent, removeEquipmentFromEvent } from '@/lib/actions/event-planning';
import { Trash2, PackagePlus, Box, Truck } from 'lucide-react';

interface EquipmentItem {
    id: number;
    name: string;
    type: string | null; // 'owned' | 'rental'
    defaultRentalCost: number | null;
    replacementCost: number | null;
}

interface AssignedEquipment {
    id: number;
    eventId: number;
    equipmentId: number | null;
    quantity: number | null;
    rentalCostOverride: number | null;
    item: EquipmentItem | null;
}

export default function EquipmentManager({
    eventId,
    assignedEquipment,
    allEquipment
}: {
    eventId: number;
    assignedEquipment: AssignedEquipment[];
    allEquipment: EquipmentItem[];
}) {
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    // Calculate costs
    const totalEquipmentCost = assignedEquipment.reduce((sum, ae) => {
        // If rental cost override exists, use it. Otherwise use default rental cost if it's a rental/has cost.
        // For owned items, cost to event is usually 0 unless we charge an internal fee, but let's assume rentals cost money.
        const unitCost = ae.rentalCostOverride ?? ae.item?.defaultRentalCost ?? 0;
        return sum + (unitCost * (ae.quantity || 1));
    }, 0);

    const handleAssign = async () => {
        if (!selectedItemId) return;
        const item = allEquipment.find(e => e.id === parseInt(selectedItemId));
        await addEquipmentToEvent({
            eventId,
            equipmentId: parseInt(selectedItemId),
            quantity: quantity,
            rentalCostOverride: item?.defaultRentalCost ?? undefined
        });
        setIsAdding(false);
        setSelectedItemId('');
        setQuantity(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Box size={20} className="text-warning" />
                        Equipment
                    </h3>
                    <p className="text-slate-400 text-sm">Manage rentals and owned inventory.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <PackagePlus size={16} /> Add Allocations
                </button>
            </div>

            {/* Add Equipment Form */}
            {isAdding && (
                <div className="card bg-white/5 border border-warning/20 p-4 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 mb-1 block">Item</label>
                            <select
                                className="input-field w-full"
                                value={selectedItemId}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                            >
                                <option value="">Select Equipment...</option>
                                {allEquipment.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {e.name} ({e.type?.toUpperCase()}) {e.type === 'rental' ? `- $${e.defaultRentalCost}/unit` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                className="input-field w-full"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAssign} disabled={!selectedItemId} className="btn-primary flex-1">
                                Add
                            </button>
                            <button onClick={() => setIsAdding(false)} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {assignedEquipment.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-slate-500">No equipment allocated.</p>
                    </div>
                ) : (
                    assignedEquipment.map((eq) => {
                        const cost = (eq.rentalCostOverride ?? eq.item?.defaultRentalCost ?? 0) * (eq.quantity || 1);
                        return (
                            <div key={eq.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${eq.item?.type === 'rental' ? 'bg-warning/20 text-warning' : 'bg-slate-700 text-slate-300'}`}>
                                        {eq.item?.type === 'rental' ? 'R' : 'O'}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{eq.item?.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {eq.quantity} units {cost > 0 && `• $${cost.toFixed(2)} total`}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeEquipmentFromEvent(eq.id, eventId)}
                                    className="p-2 text-slate-500 hover:text-error hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Summary Footer */}
            {assignedEquipment.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                        <p className="text-xs text-slate-500">Total Items</p>
                        <p className="text-xl font-bold text-white">{assignedEquipment.reduce((a, b) => a + (b.quantity || 0), 0)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Rental Costs</p>
                        <p className="text-xl font-bold text-warning">${totalEquipmentCost.toFixed(2)}</p>
                    </div>
                </div>
            )}

        </div>
    );
}
