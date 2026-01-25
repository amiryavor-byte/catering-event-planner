"use client";

import { useState, useEffect } from 'react';
import { DrillDownTable } from './DrillDownTable';
import { getMenuItems, getRecipe } from '@/lib/actions/menus';
import { Menu, MenuItem, RecipeItem } from '@/lib/data/types';
import { Loader2 } from 'lucide-react';
import { RecipeEditor } from './RecipeEditor';

interface MenuManagerProps {
    initialMenus: Menu[];
}

export function MenuManager({ initialMenus }: MenuManagerProps) {
    // Selection State
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

    // Data State
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [ingredients, setIngredients] = useState<RecipeItem[]>([]);

    // Loading State
    const [loadingItems, setLoadingItems] = useState(false);
    const [loadingIngredients, setLoadingIngredients] = useState(false);

    // Fetch Menu Items when Menu is selected
    useEffect(() => {
        if (!selectedMenu) {
            setMenuItems([]);
            return;
        }

        async function fetchItems() {
            setLoadingItems(true);
            try {
                const items = await getMenuItems(selectedMenu!.id);
                setMenuItems(items);
            } catch (error) {
                console.error("Failed to load items", error);
            } finally {
                setLoadingItems(false);
            }
        }

        fetchItems();
        // Reset child selection
        setSelectedMenuItem(null);
        setIngredients([]);
    }, [selectedMenu]);

    // Fetch Recipe Ingredients when Menu Item is selected
    useEffect(() => {
        if (!selectedMenuItem) {
            setIngredients([]);
            return;
        }

        async function fetchRecipe() {
            setLoadingIngredients(true);
            try {
                const recipeItems = await getRecipe(selectedMenuItem!.id);
                setIngredients(recipeItems);
            } catch (error) {
                console.error("Failed to load recipe", error);
            } finally {
                setLoadingIngredients(false);
            }
        }

        fetchRecipe();
    }, [selectedMenuItem]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">

            {/* Level 1: Menus */}
            <div className="h-full">
                <DrillDownTable
                    title="1. Select Menu"
                    data={initialMenus}
                    selectedId={selectedMenu?.id}
                    onRowClick={setSelectedMenu}
                    searchPlaceholder="Filter menus..."
                    columns={[
                        { header: "Name", accessor: (m) => m.name },
                        { header: "Status", accessor: (m) => m.isActive ? 'Active' : 'Draft' }
                    ]}
                />
            </div>

            {/* Level 2: Menu Items */}
            <div className="h-full relative">
                {!selectedMenu && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center text-slate-500 border border-white/5">
                        <span className="bg-black/50 px-4 py-2 rounded-lg border border-white/10 text-sm">Select a menu first</span>
                    </div>
                )}
                {loadingItems && (
                    <div className="absolute inset-0 bg-black/20 z-20 flex items-center justify-center rounded-xl">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                )}
                <DrillDownTable
                    title={selectedMenu ? `Items in "${selectedMenu.name}"` : "2. Menu Items"}
                    data={menuItems}
                    selectedId={selectedMenuItem?.id}
                    onRowClick={setSelectedMenuItem}
                    searchPlaceholder="Filter dishes..."
                    columns={[
                        { header: "Name", accessor: (i) => i.name },
                        { header: "Price", accessor: (i) => `$${i.basePrice}` },
                        { header: "Cost", accessor: (i) => (i.calculatedCost !== undefined && i.calculatedCost !== null) ? `$${i.calculatedCost.toFixed(2)}` : '-' },
                        { header: "Category", accessor: (i) => i.category }
                    ]}
                />
            </div>

            {/* Level 3: Ingredients / Recipe Editor */}
            <div className="h-full relative">
                {!selectedMenuItem && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center text-slate-500 border border-white/5">
                        <span className="bg-black/50 px-4 py-2 rounded-lg border border-white/10 text-sm">Select a dish first</span>
                    </div>
                )}

                {selectedMenuItem ? (
                    <RecipeEditor menuItem={selectedMenuItem} />
                ) : (
                    <div className="h-full bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-slate-500">
                        Select a dish to edit recipe
                    </div>
                )}
            </div>
        </div>
    );
}
