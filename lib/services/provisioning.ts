import { Client } from 'basic-ftp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { REQUIRED_PHP_FILES } from '../constants';

export interface ProvisioningConfig {
    host: string;
    user: string;
    password?: string;
    remotePath: string;
    port?: number;
    secure?: boolean;
}

export interface ProvisioningResult {
    success: boolean;
    message: string;
    files: Array<{ file: string; status: 'uploaded' | 'failed' | 'skipped'; error?: string; size?: number }>;
    healthCheckUrl?: string;
    healthCheckStatus?: boolean;
}

export async function provisionClient(config: ProvisioningConfig, phpApiPath: string): Promise<ProvisioningResult> {
    const client = new Client();
    const results: ProvisioningResult['files'] = [];

    try {
        // Connect to FTP
        await client.access({
            host: config.host,
            user: config.user,
            password: config.password,
            port: config.port,
            secure: config.secure ?? false,
            // @ts-ignore
            accessTimeout: 10000,
        });

        console.log(`✅ Connected to ${config.host} as ${config.user}`);

        // Ensure remote directory exists
        try {
            await client.ensureDir(config.remotePath);
        } catch (e) {
            console.warn(`Could not verify/create directory ${config.remotePath}, attempting upload anyway...`);
        }

        // Upload files
        for (const fileName of REQUIRED_PHP_FILES) {
            const localPath = path.join(phpApiPath, fileName);
            const remoteFilePath = `${config.remotePath}/${fileName}`;

            try {
                // Check if local file exists
                const stats = await fs.stat(localPath);
                const localSize = stats.size;

                console.log(`Uploading ${fileName} (${localSize} bytes)...`);

                // Upload
                await client.uploadFrom(localPath, remoteFilePath);

                // Verify
                // Wait a small delay to ensure file system consistency
                await new Promise(resolve => setTimeout(resolve, 200));

                try {
                    const remoteSize = await client.size(remoteFilePath);
                    if (remoteSize === localSize) {
                        results.push({ file: fileName, status: 'uploaded', size: localSize });
                    } else {
                        results.push({ file: fileName, status: 'failed', error: `Size mismatch: local ${localSize} vs remote ${remoteSize}` });
                    }
                } catch (verifyError) {
                    console.warn(`Verification failed for ${fileName}:`, verifyError);
                    // If we can't verify size, we assume it uploaded but warn
                    results.push({ file: fileName, status: 'uploaded', size: localSize, error: 'Verification unchecked' });
                }

            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown upload error';
                console.error(`❌ Failed to upload ${fileName}:`, errorMsg);
                results.push({ file: fileName, status: 'failed', error: errorMsg });
            }
        }

        client.close();

        const successCount = results.filter(r => r.status === 'uploaded').length;
        const allSuccess = successCount === REQUIRED_PHP_FILES.length;

        return {
            success: allSuccess,
            message: allSuccess
                ? `Successfully provisioned ${successCount} files to ${config.host}`
                : `Provisioning incomplete. ${successCount}/${REQUIRED_PHP_FILES.length} files uploaded.`,
            files: results
        };

    } catch (error) {
        client.close();
        return {
            success: false,
            message: `FTP Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            files: results
        };
    }
}
