
import { getMenuItems, getRecipe, addRecipeItem } from '@/lib/actions/menus';
import { getIngredients } from '@/lib/actions/ingredients';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RecipeEditorPage({ params }: { params: { id: string } }) {
    const menuId = parseInt(params.id);
    const [menuItems, recipe, allIngredients] = await Promise.all([
        getMenuItems(),
        getRecipe(menuId),
        getIngredients()
    ]);

    const menuItem = menuItems.find(i => i.id === menuId);

    if (!menuItem) {
        return <div className="text-white">Menu item not found</div>;
    }

    // Calculate total cost
    const totalCost = recipe.reduce((sum, item) => {
        return sum + (item.pricePerUnit || 0) * item.amountRequired;
    }, 0);

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/dashboard/menus" className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Menu
            </Link>

            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Recipe: {menuItem.name}</h1>
                    <p className="text-slate-400 max-w-xl">{menuItem.description}</p>
                    <div className="mt-4 flex gap-4">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <span className="block text-xs text-slate-500 uppercase tracking-wider">Target Cost</span>
                            <span className="text-xl font-mono text-white">$ -</span>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <span className="block text-xs text-slate-500 uppercase tracking-wider">Actual Cost</span>
                            <span className="text-xl font-mono text-success">${totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ingredients List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Ingredients</h2>

                    {recipe.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                            <p className="text-slate-500">No ingredients added yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recipe.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {item.amountRequired}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{item.ingredientName}</h3>
                                            <p className="text-xs text-slate-400">{item.unit} @ ${item.pricePerUnit?.toFixed(2)}/unit</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-white">${((item.pricePerUnit || 0) * item.amountRequired).toFixed(2)}</span>
                                        <button className="text-slate-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Ingredient Form */}
                <div className="glass-panel p-6 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Plus size={18} /> Add Ingredient
                    </h3>
                    <form action={addRecipeItem} className="space-y-4">
                        <input type="hidden" name="menuItemId" value={menuId} />

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Ingredient</label>
                            <select name="ingredientId" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm" required>
                                <option value="">Select Ingredient...</option>
                                {allIngredients.map(ing => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.name} ({ing.unit}) - ${ing.pricePerUnit}/unit
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Amount Required</label>
                            <div className="relative">
                                <input name="amount" type="number" step="0.01" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white pr-12" placeholder="0.00" required />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
                            <Save size={16} /> Add to Recipe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
