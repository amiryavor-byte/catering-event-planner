import { getMenuItems, addMenuItem } from '@/lib/actions/menus';
import Link from 'next/link';
import { Plus, ChefHat, UtensilsCrossed } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MenusPage() {
    const items = await getMenuItems();

    return (
        <div className="max-w-6xl mx-auto">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Menu Builder</h1>
                    <p className="text-slate-400">Create dishes and build recipes.</p>
                </div>
                {/* Simple Form Trigger for now - can be Modal later */}
                <label htmlFor="new-dish-modal" className="btn-primary flex items-center gap-2 cursor-pointer">
                    <Plus size={18} /> New Dish
                </label>
            </header>

            {/* Grid of Dishes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                        <ChefHat size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No dishes yet. Create your first one!</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="card group hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="badge bg-white/10 text-slate-300">{item.category}</span>
                                <span className="font-mono text-success font-bold">${item.basePrice?.toFixed(2)}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{item.description}</p>

                            <div className="border-t border-white/10 pt-4 flex gap-2">
                                <Link href={`/dashboard/menus/${item.id}`} className="flex-1 btn-secondary text-xs flex justify-center items-center">Edit Recipe</Link>
                                <button className="flex-1 btn-secondary text-xs">Usage</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pure CSS Modal for "New Dish" to save component overhead for now */}
            <input type="checkbox" id="new-dish-modal" className="modal-toggle hidden peer" />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto transition-opacity">
                <label htmlFor="new-dish-modal" className="absolute inset-0 cursor-pointer"></label>
                <div className="glass-panel w-full max-w-md p-6 relative z-10">
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
