import * as readline from 'readline';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { provisionClient } from '../lib/services/provisioning';

// Load environment variables
dotenv.config({ path: '.env.production.local' });
dotenv.config({ path: '.env.local' });
dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

async function main() {
    console.log('🚀 White-Label Client Provisioning Tool');
    console.log('---------------------------------------');

    try {
        const host = await question('FTP Host (default: 75.203.51.130): ') || '75.203.51.130';
        const user = await question('FTP User: ');
        const password = await question('FTP Password: ');
        const remotePath = await question('Remote Path (e.g., /public_html/client_name): ');

        if (!user || !password || !remotePath) {
            console.error('❌ Error: User, Password, and Remote Path are required.');
            process.exit(1);
        }

        console.log(`\n📦 Provisioning target: ${user}@${host}:${remotePath}`);
        const confirm = await question('Proceed? (y/n): ');

        if (confirm.toLowerCase() !== 'y') {
            console.log('Aborted.');
            process.exit(0);
        }

        const phpApiPath = path.join(process.cwd(), 'php_api');

        const result = await provisionClient({
            host,
            user,
            password,
            remotePath
        }, phpApiPath);

        if (result.success) {
            console.log('\n✅ Provisioning Successful!');
            console.log(result.message);
        } else {
            console.error('\n❌ Provisioning Failed');
            console.error(result.message);
            result.files.forEach(f => {
                if (f.status === 'failed') {
                    console.error(` - ${f.file}: ${f.error}`);
                }
            });
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    } finally {
        rl.close();
    }
}

main();
