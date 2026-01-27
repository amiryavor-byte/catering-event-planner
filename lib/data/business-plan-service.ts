
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jewishingenuity.com/catering_app';

export interface BusinessPlanData {
    // Executive Summary
    missionStatement: string;

    // Partnership
    amirRole: string;
    davidRole: string;

    // Financials - Variables are stored here for auto-calc
    basePriceLow: number;
    basePriceHigh: number;
    hostingCost: number;
    serverCost: number;
    hourlyRate: number;

    // Projections (Year 1-5) - Stored as array or object
    // Projections (Month 1-60)
    monthlyProjections: {
        month: number;
        clientCount: number;
        upgradeAdoption: number; // %
        upgradePrice: number;
    }[];

    // Legacy (Year 1-5) - Optional for migration
    projections?: {
        year: number;
        clientCount: number;
        upgradeAdoption: number;
        upgradePrice: number;
    }[];

    // Revenue Share Rules (For reference/calc)
    shareAmir: number; // 51
    shareDavid: number; // 49
}

export interface BusinessPlanVersion {
    id: number;
    user: string;
    created_at: string;
    content: BusinessPlanData; // When fetching specific version
}

export const BusinessPlanService = {
    async getLatest(): Promise<{ latest: { content: BusinessPlanData, user: string, created_at: string } | null, history: BusinessPlanVersion[] }> {
        try {
            const res = await fetch(`${API_URL}/business_plan.php`);
            if (!res.ok) throw new Error('Failed to fetch plan');
            const data = await res.json();

            // Parse content string to JSON if needed
            if (data.latest && typeof data.latest.content === 'string') {
                try { data.latest.content = JSON.parse(data.latest.content); } catch (e) { }
            }

            return data;
        } catch (error) {
            console.error(error);
            return { latest: null, history: [] };
        }
    },

    async getVersion(id: number): Promise<BusinessPlanData | null> {
        try {
            const res = await fetch(`${API_URL}/business_plan.php?id=${id}`);
            if (!res.ok) throw new Error('Failed to fetch version');
            const data = await res.json();

            // Parse content
            if (data.content && typeof data.content === 'string') {
                try { data.content = JSON.parse(data.content); } catch (e) { }
            }
            return data.content || data;
        } catch (error) {
            return null;
        }
    },

    async saveVersion(user: string, content: BusinessPlanData): Promise<number | null> {
        try {
            const res = await fetch(`${API_URL}/business_plan.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, content })
            });
            if (!res.ok) throw new Error('Failed to save');
            const data = await res.json();
            return data.id;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
};

// Exponential Growth Generator: Start 3, End ~70 in Year 5 (Month 60)
// Formula: y = a * (1 + r)^x
// 70 = 3 * (1 + r)^60 => 23.33 = (1+r)^60 => ln(23.33) = 60 * ln(1+r)
const generateProjections = () => {
    const startClients = 3;
    const endClients = 70; // Target for year 5
    const months = 60;
    const growthRate = Math.pow(endClients / startClients, 1 / months) - 1;

    return Array.from({ length: months }, (_, i) => {
        const month = i + 1;
        // Exponential growth formula
        const clientCount = Math.round(startClients * Math.pow(1 + growthRate, i));

        return {
            month,
            clientCount,
            upgradeAdoption: Math.min(70, Math.floor(i * 1.2)), // Gradual adoption ramp
            upgradePrice: 500
        };
    });
};

export const DEFAULT_PLAN_DATA: BusinessPlanData = {
    missionStatement: "To revolutionize catering event management with a premium, self-hosted, technical partnership.",
    amirRole: "Technical Co-Founder (Product Development, Deployment, Customization)",
    davidRole: "Sales Co-Founder (Lead Gen, Sales, Client Relations)",
    basePriceLow: 3000,
    basePriceHigh: 5000,
    hostingCost: 200,
    serverCost: 500,
    hourlyRate: 150,
    shareAmir: 51,
    shareDavid: 49,
    monthlyProjections: generateProjections()
};

