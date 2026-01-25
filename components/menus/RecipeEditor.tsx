'use client';

import { useState, useEffect } from 'react';
import { MenuItem, RecipeItem, Ingredient } from '@/lib/data/types';
import { addRecipeItem, updateRecipeItem, deleteRecipeItem, getRecipe } from '@/lib/actions/menus';
import { getIngredients } from '@/lib/actions/ingredients'; // Assuming we can use this directly or need client wrapper
import { Plus, Trash2, Save, Loader2, RefreshCw } from 'lucide-react';

interface RecipeEditorProps {
    menuItem: MenuItem;
}

export function RecipeEditor({ menuItem }: RecipeEditorProps) {
    const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Form State
    const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [adding, setAdding] = useState(false);

    // Editing State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editAmount, setEditAmount] = useState<string>('');

    // Totals
    const totalCost = recipeItems.reduce((sum, item) => sum + ((item.pricePerUnit || 0) * item.amountRequired), 0);
    const profitMargin = (menuItem.basePrice || 0) - totalCost;
    const marginPercent = menuItem.basePrice ? ((profitMargin / menuItem.basePrice) * 100).toFixed(1) : '0';

    async function loadData() {
        setLoading(true);
        try {
            const [recipes, ingredients] = await Promise.all([
                getRecipe(menuItem.id),
                getIngredients()
            ]);
            setRecipeItems(recipes);
            setAllIngredients(ingredients.map(i => ({
                ...i,
                isSample: i.isSample ?? false,
                lastUpdated: i.lastUpdated ? new Date(i.lastUpdated) : null
            } as Ingredient)));
        } catch (error) {
            console.error("Failed to load recipe data", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [menuItem.id]);

    async function handleAdd() {
        if (!selectedIngredientId || !amount) return;
        setAdding(true);
        try {
            const formData = new FormData();
            formData.append('menuItemId', menuItem.id.toString());
            formData.append('ingredientId', selectedIngredientId);
            formData.append('amount', amount);

            await addRecipeItem(formData);
            await loadData(); // Reload to get fresh data with joins

            // Reset form
            setSelectedIngredientId('');
            setAmount('');
        } catch (error) {
            console.error("Failed to add item", error);
        } finally {
            setAdding(false);
        }
    }

    async function handleUpdate(id: number) {
        if (!editAmount) return;
        try {
            await updateRecipeItem(id, parseFloat(editAmount));
            setEditingId(null);
            loadData();
        } catch (error) {
            console.error("Failed to update item", error);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Remove this ingredient?')) return;
        try {
            await deleteRecipeItem(id);
            loadData();
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    }

    // Filter ingredients not already in recipe
    const availableIngredients = allIngredients.filter(
        i => !recipeItems.some(r => r.ingredientId === i.id)
    );

    return (
        <div className="flex flex-col h-full bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div>
                    <h3 className="font-semibold text-white">Recipe & Costing</h3>
                    <p className="text-xs text-slate-400">For: {menuItem.name}</p>
                </div>
                <button onClick={loadData} className="text-slate-400 hover:text-white" title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recipeItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 group">
                                <div className="flex-1">
                                    <div className="font-medium text-slate-200">{item.ingredientName}</div>
                                    <div className="text-xs text-slate-500">
                                        ${item.pricePerUnit?.toFixed(2)} / {item.unit}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {editingId === item.id ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                className="w-16 bg-black/50 border border-white/20 rounded px-1 py-0.5 text-right text-sm text-white"
                                                value={editAmount}
                                                onChange={e => setEditAmount(e.target.value)}
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdate(item.id)} className="text-green-400 hover:bg-white/10 p-1 rounded">
                                                <Save size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="text-sm font-mono text-slate-300 cursor-pointer hover:text-primary hover:underline"
                                            onClick={() => {
                                                setEditingId(item.id);
                                                setEditAmount(item.amountRequired.toString());
                                            }}
                                            title="Click to edit amount"
                                        >
                                            {item.amountRequired} {item.unit}
                                        </div>
                                    )}

                                    <div className="w-16 text-right font-mono text-sm text-slate-400">
                                        ${((item.pricePerUnit || 0) * item.amountRequired).toFixed(2)}
                                    </div>

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {recipeItems.length === 0 && (
                            <div className="text-center py-8 text-slate-500 italic">
                                No ingredients added yet.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Ingredient Form */}
            <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Add Ingredient</div>
                <div className="flex gap-2">
                    <select
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                        value={selectedIngredientId}
                        onChange={(e) => setSelectedIngredientId(e.target.value)}
                    >
                        <option value="">Select Ingredient...</option>
                        {availableIngredients.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Qty"
                        className="w-20 bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!selectedIngredientId || !amount || adding}
                        className="btn-primary px-3 py-1.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                </div>
            </div>

            {/* Cost Summary */}
            <div className="p-4 bg-primary/10 border-t border-primary/20">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-sm text-slate-300">Total Cost</span>
                    <span className="text-lg font-bold text-white">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end text-xs">
                    <span className="text-slate-400">Base Price: ${menuItem.basePrice?.toFixed(2)}</span>
                    <span className={profitMargin > 0 ? "text-green-400" : "text-red-400"}>
                        Margin: ${profitMargin.toFixed(2)} ({marginPercent}%)
                    </span>
                </div>
            </div>
        </div>
    );
}
