import { IDataService } from './types';

// Singleton instance
let serviceInstance: IDataService | null = null;

export function getDataService(): IDataService {
    if (serviceInstance) return serviceInstance;

    let mode = process.env.API_MODE || 'sqlite'; // 'sqlite' | 'api'

    // Auto-detect production environment (Vercel)
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        mode = 'api';
    }

    try {
        if (mode === 'api') {
            const { ApiDataService } = require('./api-service');
            console.log('🔌 Using API Data Service');
            serviceInstance = new ApiDataService();
        } else {
            console.log('📂 Using Local SQLite Data Service (Explicit)');
            // Use require to avoid top-level import of better-sqlite3 which might break build
            const { SqliteDataService } = require('./sqlite-service');
            serviceInstance = new SqliteDataService();
        }
    } catch (error) {
        console.error('⚠️ Critical Data Service Failure:', error);
        console.warn('⚠️ Falling back to MockDataService to prevent crash.');
        // Mock service is safe to import static
        const { MockDataService } = require('./mock-service');
        serviceInstance = new MockDataService();
    }

    return serviceInstance as IDataService;
}
