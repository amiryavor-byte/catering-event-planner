import { IDataService } from './types';
import { SqliteDataService } from './sqlite-service';
import { ApiDataService } from './api-service';
import { MockDataService } from './mock-service';
import { HybridDataService } from './hybrid-service';

// Singleton instance
let serviceInstance: IDataService | null = null;

export function getDataService(): IDataService {
    if (serviceInstance) return serviceInstance;

    const mode = process.env.API_MODE || 'sqlite'; // 'sqlite' | 'api'

    try {
        if (mode === 'api') {
            console.log('🔌 Using Hybrid Data Service (API + Local Samples)');
            serviceInstance = new HybridDataService();
        } else {
            console.log('📂 Using Local SQLite Data Service (Explicit)');
            serviceInstance = new SqliteDataService();
        }
    } catch (error) {
        console.warn('⚠️ Failed to initialize data service, using Mock fallback:', error);
        serviceInstance = new MockDataService();
    }

    return serviceInstance;
}
