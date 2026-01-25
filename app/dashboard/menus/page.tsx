import { getMenus, addMenuItem } from '@/lib/actions/menus';
import { MenuManager } from '@/components/menus/MenuManager';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MenusPage() {
    const menus = await getMenus();

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Menu Builder</h1>
                    <p className="text-slate-400">Manage menus, dishes, and recipes.</p>
                </div>
                {/* Simple Form Trigger for now - can be Modal later */}
                {/* Note: We might want to move this into MenuManager or have separate actions for New Menu vs New Dish */}
                <div className="flex gap-2">
                    <label htmlFor="new-dish-modal" className="btn-primary flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto touch-target">
                        <Plus size={18} /> New Dish
                    </label>
                </div>
            </header>

            {/* Drill Down Interface */}
            <div className="flex-1 min-h-0">
                <MenuManager initialMenus={menus} />
            </div>

            {/* Pure CSS Modal for "New Dish" to save component overhead for now */}
            {/* Kept existing modal for creating dishes, though logic might need adjustment to associate with selected menu if desired. 
                For now, it creates unassigned dishes or dishes assigned to a default if logic persists. 
                We might want to enhance this later. */}
            <input type="checkbox" id="new-dish-modal" className="modal-toggle hidden peer" />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto transition-opacity p-4">
                <label htmlFor="new-dish-modal" className="absolute inset-0 cursor-pointer"></label>
                <div className="glass-panel w-full max-w-md p-6 relative z-10 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-white mb-6">Create New Dish</h2>
                    <form action={addMenuItem} method="POST" className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Dish Name</label>
                            <input name="name" type="text" required placeholder="e.g. Truffle Risotto" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                            <select name="category" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white">
                                <option>Appetizer</option>
                                <option>Main Course</option>
                                <option>Dessert</option>
                                <option>Drink</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Base Price ($)</label>
                            <input name="basePrice" type="number" step="0.01" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <textarea name="description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"></textarea>
                        </div>
                        <button type="submit" className="btn-primary w-full mt-4">Create Dish</button>
                    </form>
                </div>
            </div>

        </div>
    );
}
