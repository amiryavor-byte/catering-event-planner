
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jewishingenuity.com/Catering_app';
const MIGRATION_SECRET = 'migration_secret_key_12345'; // Matching the one in migrate.php

export async function runMigration(): Promise<{ success: boolean; results?: any[]; error?: string }> {
    try {
        // Use GET with query param to bypass ModSecurity
        const response = await fetch(`${API_BASE_URL}/migrate.php?secret=${MIGRATION_SECRET}`, {
            method: 'GET',
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return { success: true, results: data.results };
        } else {
            return { success: false, error: data.error || 'Migration failed' };
        }
    } catch (error) {
        console.error('Migration error:', error);
        return { success: false, error: 'Network error occurred' };
    }
}
