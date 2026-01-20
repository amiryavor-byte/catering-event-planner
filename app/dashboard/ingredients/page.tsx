import { getIngredients } from '@/lib/actions/ingredients';
import AddIngredientModal from '@/components/ingredients/AddIngredientModal';
import { ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function IngredientsPage() {
    const ingredients = await getIngredients();

    return (
        <div className="max-w-6xl mx-auto">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Pantry & Pricing</h1>
                    <p className="text-slate-400">Manage your inventory costs. Prices update automatically via AI Watch.</p>
                </div>
                <AddIngredientModal />
            </header>

            <div className="card overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-slate-300 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Item Name</th>
                            <th className="p-4">Unit Cost</th>
                            <th className="p-4">Supplier</th>
                            <th className="p-4 text-right">Last Check</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-200">
                        {ingredients.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    No ingredients found. Add your first item above.
                                </td>
                            </tr>
                        ) : (
                            ingredients.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium">{item.name}</td>
                                    <td className="p-4 font-mono text-success">
                                        ${item.pricePerUnit.toFixed(2)} <span className="text-slate-500 text-xs">/ {item.unit}</span>
                                    </td>
                                    <td className="p-4">
                                        {item.supplierUrl ? (
                                            <Link href={item.supplierUrl} target="_blank" className="flex items-center gap-2 text-primary hover:underline text-sm">
                                                View Supplier <ExternalLink size={14} />
                                            </Link>
                                        ) : (
                                            <span className="text-slate-600 italic">No link</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right text-sm text-slate-400">
                                        {new Date(item.lastUpdated!).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-full text-primary transition-colors" title="Force AI Check">
                                            <RefreshCw size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
