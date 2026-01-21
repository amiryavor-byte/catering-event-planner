// Client-side company settings management
// This uses localStorage until the backend API is ready

export interface CompanySettings {
    id?: number;
    name: string;
    logoUrl?: string;
    primaryColor: string;
}

export function saveCompanySettings(settings: CompanySettings): { success: boolean; settings?: CompanySettings; error?: string } {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem('companySettings', JSON.stringify(settings));
            console.log('Company settings saved to localStorage:', settings);
            return { success: true, settings };
        }

        return { success: false, error: 'Window not available' };
    } catch (error) {
        console.error('Error saving company settings:', error);
        return { success: false, error: 'Failed to save company settings' };
    }
}

export function getCompanySettings(): CompanySettings | null {
    try {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('companySettings');
            if (stored) {
                return JSON.parse(stored);
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching company settings:', error);
        return null;
    }
}
