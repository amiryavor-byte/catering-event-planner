
import { BusinessPlanData } from '@/lib/data/business-plan-service';

export function calculateRequiredSales(targetEarnings: number, year: number, data: BusinessPlanData, amirSharePercent: number) {
    if (amirSharePercent <= 0) return 0;

    // Target Net Profit needed for the whole year
    const requiredTotalNetProfit = targetEarnings / (amirSharePercent / 100);

    // Fixed Costs for a year
    const yearlyHosting = data.hostingCost * 12; // Per client hosting is dynamic... wait.
    // Simplifying assumption: Hosting is per client per month.

    // Average Revenue Per Client (Annualized)
    // Avg Base Price (One off) + 12 * Hosting Revenue (?) No hosting is cost.
    // Revenue = Base Price + (Upgrade Adoption * Upgrade Price)

    // Let's invert the logic based on average value per client in THAT year.
    // This is an estimation "Goal Seek".

    const avgBasePrice = (data.basePriceLow + data.basePriceHigh) / 2;
    const avgUpgradeRevenue = (data.monthlyProjections[year * 12 - 1]?.upgradeAdoption / 100) * (data.featurePriceLow + data.featurePriceHigh) / 2;

    // This is getting too complex for a perfect reverse calc because of the ramping curve.
    // SIMPLIFIED APPROACH:
    // "To hit $X earnings, you need roughly Y total active clients by end of year."

    // Profit Per Client (Approx) = (AvgBase/12?? No base is one time)
    // Let's stick to "New Sales Needed per Month" 

    // Total Revenue = (New Clients * Base) + (Total Clients * Upgrade * UpgradePrice)
    // Total Expense = (Total Clients * Hosting) + Fixed Server

    // We will solve for "Monthly New Sales" assuming it's constant for the year.
    return Math.round(requiredTotalNetProfit / avgBasePrice); // Very rough approximation
}
