'use client';

import { useState } from 'react';
import { addMenuItemToEvent, removeMenuItemFromEvent } from '@/lib/actions/event-planning';
import { Trash2, Utensils, ChefHat } from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    category: string | null;
    basePrice: number | null;
    servingSize: string | null;
}

interface AssignedMenuItem {
    id: number;
    eventId: number;
    menuItemId: number | null;
    quantity: number | null;
    priceOverride: number | null;
    notes: string | null;
    item: {
        name: string;
        description: string | null;
        basePrice: number | null;
        category: string | null;
        servingSize: string | null;
    } | null;
}

export default function MenuManager({
    eventId,
    assignedMenu,
    allMenuItems
}: {
    eventId: number;
    assignedMenu: AssignedMenuItem[];
    allMenuItems: MenuItem[];
}) {
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    // Group by category for display
    const groupedMenu = assignedMenu.reduce((acc, item) => {
        const cat = item.item?.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, AssignedMenuItem[]>);

    const estimatedFoodCost = assignedMenu.reduce((sum, item) => {
        const price = item.priceOverride ?? item.item?.basePrice ?? 0;
        return sum + (price * (item.quantity ?? 1));
    }, 0);

    const handleAssign = async () => {
        if (!selectedItemId) return;
        await addMenuItemToEvent({
            eventId,
            menuItemId: parseInt(selectedItemId),
            quantity,
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
                        <Utensils size={20} className="text-secondary" />
                        Menu
                    </h3>
                    <p className="text-slate-400 text-sm">Design the menu for this event.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <ChefHat size={16} /> Add Dish
                </button>
            </div>

            {/* Add Menu Form */}
            {isAdding && (
                <div className="card bg-white/5 border border-secondary/20 p-4 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 mb-1 block">Dish</label>
                            <select
                                className="input-field w-full"
                                value={selectedItemId}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                            >
                                <option value="">Select Dish...</option>
                                {allMenuItems.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({m.category}) - ${m.basePrice || 0}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Quantity/Servings</label>
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

            {/* Menu List */}
            <div className="space-y-6">
                {assignedMenu.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-slate-500">No menu items added.</p>
                    </div>
                ) : (
                    Object.entries(groupedMenu).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">{category}</h4>
                            <div className="space-y-2">
                                {items.map(item => {
                                    const cost = (item.priceOverride ?? item.item?.basePrice ?? 0) * (item.quantity || 1);
                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div>
                                                <p className="text-white font-medium">{item.item?.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {item.quantity} servings • {item.item?.servingSize} • ${cost.toFixed(2)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeMenuItemFromEvent(item.id, eventId)}
                                                className="p-2 text-slate-500 hover:text-error hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary Footer */}
            {assignedMenu.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                        <p className="text-xs text-slate-500">Total Dishes</p>
                        <p className="text-xl font-bold text-white">{assignedMenu.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Est. Food Cost</p>
                        <p className="text-xl font-bold text-white">${estimatedFoodCost.toFixed(2)}</p>
                    </div>
                </div>
            )}

        </div>
    );
}
