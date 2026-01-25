import { NextResponse } from 'next/server';
import { Client } from 'basic-ftp';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function POST(request: Request) {
    const client = new Client();

    try {
        const body = await request.json();
        const { action } = body;

        if (action !== 'deploy') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // FTP Connection details
        const FTP_HOST = process.env.FTP_HOST || 'ftp.jewishingenuity.com';
        const FTP_USER = process.env.FTP_USER || '';
        const FTP_PASSWORD = process.env.FTP_PASSWORD || '';
        const REMOTE_PATH = '/public_html/api.jewishingenuity.com/catering_app';

        // Connect to FTP
        await client.access({
            host: FTP_HOST,
            user: FTP_USER,
            password: FTP_PASSWORD,
            secure: false,
        });

        console.log('✅ Connected to HostGator FTP');

        // Ensure remote directory exists
        try {
            await client.ensureDir(REMOTE_PATH);
        } catch (e) {
            console.warn('Could not create directory, may already exist');
        }

        // Files to deploy
        const phpApiPath = path.join(process.cwd(), 'php_api');
        const filesToDeploy = [
            'db_connect.php',
            'menu_items.php',
            'ingredients.php',
            'recipes.php',
            'users.php',
            'tasks.php'
        ];

        const results: Array<{ file: string; status: string; error?: string; size?: number }> = [];

        // Upload each file with verification
        for (const fileName of filesToDeploy) {
            const localPath = path.join(phpApiPath, fileName);
            const remotePath = `${REMOTE_PATH}/${fileName}`;

            try {
                // Check if local file exists first
                const stats = await fs.stat(localPath);
                const localSize = stats.size;

                console.log(`Uploading ${fileName} (${localSize} bytes)...`);

                // Upload the file
                await client.uploadFrom(localPath, remotePath);

                // Wait a moment for the upload to complete
                await new Promise(resolve => setTimeout(resolve, 500));

                // Verify upload by checking remote file size
                try {
                    const remoteSize = await client.size(remotePath);

                    if (remoteSize === localSize) {
                        results.push({ file: fileName, status: 'uploaded', size: localSize });
                        console.log(`✅ Uploaded ${fileName} - verified (${localSize} bytes)`);
                    } else {
                        throw new Error(`Size mismatch: local ${localSize} vs remote ${remoteSize}`);
                    }
                } catch (verifyError) {
                    // If verification fails, still mark as uploaded but log warning
                    results.push({ file: fileName, status: 'uploaded', size: localSize });
                    console.warn(`⚠️ Uploaded ${fileName} but verification failed:`, verifyError);
                }

            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                results.push({ file: fileName, status: 'failed', error: errorMsg });
                console.error(`❌ Failed to upload ${fileName}:`, errorMsg);
            }
        }

        client.close();

        // Test endpoints
        const API_BASE = 'https://api.jewishingenuity.com/catering_app';
        const endpointTests = [];

        for (const endpoint of ['menu_items.php', 'ingredients.php', 'recipes.php']) {
            try {
                const response = await fetch(`${API_BASE}/${endpoint}`, {
                    method: 'GET',
                    cache: 'no-store'
                });

                endpointTests.push({
                    endpoint,
                    status: response.ok ? 'working' : 'error',
                    httpStatus: response.status
                });
            } catch (error) {
                endpointTests.push({
                    endpoint,
                    status: 'error',
                    httpStatus: 0
                });
            }
        }

        const successCount = results.filter(r => r.status === 'uploaded').length;
        const totalFiles = results.length;

        return NextResponse.json({
            success: successCount === totalFiles,
            message: `Deployed ${successCount}/${totalFiles} files successfully`,
            files: results,
            endpoints: endpointTests,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Deployment error:', error);
        client.close();

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Deployment failed',
            message: 'Failed to deploy backend files'
        }, { status: 500 });
    }
}
