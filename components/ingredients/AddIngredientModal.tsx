'use client';

import { useState } from 'react';
import { addIngredient } from '@/lib/actions/ingredients';
import { X, Plus, Loader2 } from 'lucide-react';

export default function AddIngredientModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        await addIngredient(formData);
        setIsSubmitting(false);
        setIsOpen(false);
    }

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add Ingredient
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">New Ingredient</h2>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                        <input name="name" type="text" required placeholder="e.g. Sliced Brisket" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-primary" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Unit</label>
                            <select name="unit" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-primary">
                                <option value="kg">kg</option>
                                <option value="lb">lb</option>
                                <option value="oz">oz</option>
                                <option value="gal">gal</option>
                                <option value="count">count</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Cost per Unit</label>
                            <input name="price" type="number" step="0.01" required placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-primary" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Supplier URL</label>
                        <input name="supplierUrl" type="url" placeholder="https://costco.com/..." className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-primary" />
                    </div>

                    <button disabled={isSubmitting} type="submit" className="btn-primary w-full flex justify-center mt-4">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Item'}
                    </button>
                </form>
            </div>
        </div>
    );
}
