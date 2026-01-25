import { calculateRecipeCost, suggestPrice, calculateMargin, getMarginStatus, formatCurrency } from '@/lib/utils/cost-calculator';
import { RecipeItem } from '@/lib/data/types';

describe('Cost Calculator Utils', () => {
    describe('calculateRecipeCost', () => {
        it('should calculate total cost correctly for valid items', () => {
            const items: RecipeItem[] = [
                { id: 1, menuItemId: 1, ingredientId: 1, amountRequired: 2, pricePerUnit: 10, unit: 'kg' },
                { id: 2, menuItemId: 1, ingredientId: 2, amountRequired: 0.5, pricePerUnit: 20, unit: 'kg' },
            ];
            // (2 * 10) + (0.5 * 20) = 20 + 10 = 30
            expect(calculateRecipeCost(items)).toBe(30);
        });

        it('should return 0 for empty items', () => {
            expect(calculateRecipeCost([])).toBe(0);
        });

        it('should handle items with 0 price', () => {
            const items: RecipeItem[] = [
                { id: 1, menuItemId: 1, ingredientId: 1, amountRequired: 2, pricePerUnit: 0, unit: 'kg' },
            ];
            expect(calculateRecipeCost(items)).toBe(0);
        });
    });

    describe('suggestPrice', () => {
        it('should calculate price with default markup (300%)', () => {
            // Cost 10, Markup 300% -> 10 * (1 + 3) = 40
            expect(suggestPrice(10)).toBe(40);
        });

        it('should calculate price with custom markup', () => {
            // Cost 10, Markup 50% -> 10 * (1 + 0.5) = 15
            expect(suggestPrice(10, 50)).toBe(15);
        });

        it('should return 0 if cost is 0', () => {
            expect(suggestPrice(0)).toBe(0);
        });
    });

    describe('calculateMargin', () => {
        it('should calculate margin correctly', () => {
            // Price 200, Cost 100 -> (100/200)*100 = 50%
            expect(calculateMargin(200, 100)).toBe(50);
        });

        it('should return 0 if price is 0', () => {
            expect(calculateMargin(0, 100)).toBe(0);
        });

        it('should return negative margin if cost > price', () => {
            // Price 100, Cost 150 -> (-50/100)*100 = -50%
            expect(calculateMargin(100, 150)).toBe(-50);
        });
    });

    describe('getMarginStatus', () => {
        it('should return excellent for margin >= 70', () => {
            expect(getMarginStatus(70)).toBe('excellent');
            expect(getMarginStatus(80)).toBe('excellent');
        });

        it('should return good for margin >= 50 and < 70', () => {
            expect(getMarginStatus(50)).toBe('good');
            expect(getMarginStatus(69)).toBe('good');
        });

        it('should return low for margin >= 0 and < 50', () => {
            expect(getMarginStatus(0)).toBe('low');
            expect(getMarginStatus(49)).toBe('low');
        });

        it('should return negative for margin < 0', () => {
            expect(getMarginStatus(-1)).toBe('negative');
        });
    });

    describe('formatCurrency', () => {
        it('should format number to USD currency', () => {
            // Note: internal implementation uses non-breaking space depending on locale, 
            // but standard node environment might use regular space or non-breaking.
            // We'll check for the digits and symbol.
            const result = formatCurrency(1234.56);
            expect(result).toMatch(/\$1,234\.56/);
        });

        it('should handle 0', () => {
            expect(formatCurrency(0)).toBe('$0.00');
        });
    });
});
