import { IDataService } from './types';
import { SqliteDataService } from './sqlite-service';
import { ApiDataService } from './api-service';

// Singleton instance
let serviceParams: IDataService | null = null;

export function getDataService(): IDataService {
    if (serviceParams) return serviceParams;

    const mode = process.env.API_MODE || 'sqlite'; // 'sqlite' | 'api'

    if (mode === 'api') {
        console.log('🔌 Using Remote API Data Service');
        serviceParams = new ApiDataService();
    } else {
        console.log('📂 Using Local SQLite Data Service');
        serviceParams = new SqliteDataService();
    }

    return serviceParams;
}
