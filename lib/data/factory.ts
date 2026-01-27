import { IDataService } from './types';

// Singleton instance
let serviceInstance: IDataService | null = null;

export function getDataService(): IDataService {
    if (serviceInstance) return serviceInstance;

    const mode = process.env.API_MODE || 'sqlite'; // 'sqlite' | 'api'

    try {
        if (mode === 'api') {
            const { HybridDataService } = require('./hybrid-service');
            console.log('🔌 Using Hybrid Data Service (API + Local Samples)');
            serviceInstance = new HybridDataService();
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
