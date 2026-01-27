'use server'

// STUBBED FOR VERCEL DEPLOYMENT
// Direct DB access removed.

export interface Ingredient {
    id: number;
    name: string;
    unit: string;
    pricePerUnit: number;
    supplierUrl: string | null;
    lastUpdated: string | Date | null;
    isSample?: boolean;
}

export async function getIngredients(): Promise<Ingredient[]> {
    return [];
}

export async function addIngredient(formData: FormData) {
    // No-op
}

export async function updateIngredientPrice(id: number, newPrice: number) {
    // No-op
}

// AI Feature Mock
export async function checkSupplierPrice(url: string) {
    'use server';
    // Simulate AI Scraping delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return a mock fluctuating price
    return {
        price: +(Math.random() * 10 + 5).toFixed(2), // Random price between 5 and 15
        found: true
    };
}
