import { RecipeItem } from '@/lib/data/types';

/**
 * Calculate the total cost of a recipe based on ingredient prices and amounts
 */
export function calculateRecipeCost(recipeItems: RecipeItem[]): number {
    return recipeItems.reduce((total, item) => {
        const itemCost = (item.pricePerUnit || 0) * item.amountRequired;
        return total + itemCost;
    }, 0);
}

/**
 * Suggest a selling price based on cost and markup percentage
 * @param cost - Total recipe cost
 * @param markupPercent - Markup percentage (e.g., 300 for 3x markup)
 */
export function suggestPrice(cost: number, markupPercent: number = 300): number {
    return cost * (1 + markupPercent / 100);
}

/**
 * Calculate profit margin percentage
 * @param price - Selling price
 * @param cost - Total cost
 * @returns Margin as a percentage (0-100)
 */
export function calculateMargin(price: number, cost: number): number {
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
}

/**
 * Get margin status color based on percentage
 */
export function getMarginStatus(margin: number): 'excellent' | 'good' | 'low' | 'negative' {
    if (margin >= 70) return 'excellent';
    if (margin >= 50) return 'good';
    if (margin >= 0) return 'low';
    return 'negative';
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
