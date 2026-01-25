// Client-side company settings management
// Migrated to PHP backend

export interface CompanySettings {
    id?: number;
    name: string;
    logoUrl?: string;
    primaryColor: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jewishingenuity.com/Catering_app';

export async function saveCompanySettings(settings: CompanySettings): Promise<{ success: boolean; settings?: CompanySettings; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/company.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('Company settings saved to API:', settings);
            // Also cache locally for immediate UI updates if needed, logic can be added here
            return { success: true, settings };
        } else {
            return { success: false, error: data.error || 'Failed to save settings' };
        }
    } catch (error) {
        console.error('Error saving company settings:', error);
        return { success: false, error: 'Network error occurred' };
    }
}

export async function getCompanySettings(): Promise<CompanySettings | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/company.php`);
        if (!response.ok) return null;

        const data = await response.json();
        return data || null;
    } catch (error) {
        console.error('Error fetching company settings:', error);
        return null;
    }
}
