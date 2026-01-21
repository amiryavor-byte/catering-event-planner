import { getMenuItems, getRecipe, addRecipeItem } from '@/lib/actions/menus';
import { getIngredients } from '@/lib/actions/ingredients';
import { calculateRecipeCost, suggestPrice, calculateMargin, formatCurrency, getMarginStatus } from '@/lib/utils/cost-calculator';
import { ArrowLeft, Save, Trash2, Plus, TrendingUp, DollarSign } from 'lucide-react';
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

    // Calculate costs using our utility functions
    const totalCost = calculateRecipeCost(recipe);
    const suggested = suggestPrice(totalCost, 300); // 3x markup
    const currentPrice = menuItem.basePrice || suggested;
    const margin = calculateMargin(currentPrice, totalCost);
    const marginStatus = getMarginStatus(margin);

    // Filter out already-added ingredients
    const usedIngredientIds = recipe.map(r => r.ingredientId);
    const availableIngredients = allIngredients.filter(ing => !usedIngredientIds.includes(ing.id));

    return (
        <div className="max-w-6xl mx-auto">
            <Link href="/dashboard/menus" className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Menu
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Header Info */}
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-bold text-white mb-2">{menuItem.name}</h1>
                    <p className="text-slate-400 mb-4">{menuItem.description}</p>
                    <span className="badge bg-primary/20 text-primary">{menuItem.category}</span>
                </div>

                {/* Cost Summary Panel */}
                <div className="card p-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                        <DollarSign size={16} />
                        Cost Summary
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-slate-500 mb-1">Ingredient Cost</div>
                            <div className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500 mb-1">Current Price</div>
                            <div className="text-2xl font-bold text-success">{formatCurrency(currentPrice)}</div>
                        </div>

                        <div className="pt-3 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-500">Profit Margin</span>
                                <TrendingUp size={14} className={
                                    marginStatus === 'excellent' ? 'text-success' :
                                        marginStatus === 'good' ? 'text-primary' :
                                            marginStatus === 'low' ? 'text-warning' :
                                                'text-error'
                                } />
                            </div>
                            <div className={`text-xl font-bold ${marginStatus === 'excellent' ? 'text-success' :
                                    marginStatus === 'good' ? 'text-primary' :
                                        marginStatus === 'low' ? 'text-warning' :
                                            'text-error'
                                }`}>
                                {margin.toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {marginStatus === 'excellent' && '🎯 Excellent margin!'}
                                {marginStatus === 'good' && '✅ Good margin'}
                                {marginStatus === 'low' && '⚠️ Low margin'}
                                {marginStatus === 'negative' && '❌ Losing money!'}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/10">
                            <div className="text-xs text-slate-500 mb-1">Suggested Price (3x)</div>
                            <div className="text-lg font-semibold text-primary">{formatCurrency(suggested)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ingredients List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Recipe Ingredients</h2>

                    {recipe.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                            <p className="text-slate-500">No ingredients added yet.</p>
                            <p className="text-slate-600 text-sm mt-2">Use the form on the right to add ingredients →</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recipe.map((item) => {
                                const lineCost = (item.pricePerUnit || 0) * item.amountRequired;
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {item.amountRequired}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white">{item.ingredientName}</h3>
                                                <p className="text-xs text-slate-400">
                                                    {item.unit} @ {formatCurrency(item.pricePerUnit || 0)}/{item.unit}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-success font-semibold">{formatCurrency(lineCost)}</span>
                                            <button className="text-slate-500 hover:text-red-400 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-white">Total Cost:</span>
                                    <span className="text-2xl font-mono text-success font-bold">{formatCurrency(totalCost)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Ingredient Form */}
                <div className="glass-panel p-6 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Plus size={18} /> Add Ingredient
                    </h3>

                    {availableIngredients.length === 0 ? (
                        <div className="text-slate-500 text-sm">
                            <p className="mb-2">All ingredients have been added!</p>
                            <Link href="/dashboard/ingredients" className="text-primary hover:underline text-xs">
                                + Create new ingredients
                            </Link>
                        </div>
                    ) : (
                        <form action={addRecipeItem} className="space-y-4">
                            <input type="hidden" name="menuItemId" value={menuId} />

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Ingredient</label>
                                <select name="ingredientId" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm" required>
                                    <option value="">Select Ingredient...</option>
                                    {availableIngredients.map(ing => (
                                        <option key={ing.id} value={ing.id}>
                                            {ing.name} ({formatCurrency(ing.pricePerUnit)}/{ing.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Amount Required</label>
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                    placeholder="e.g. 2.5"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
                                <Save size={16} /> Add to Recipe
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
