import { SqliteDataService } from '../lib/data/sqlite-service';

async function main() {
    try {
        console.log("🌱 Creating Admin User...");
        const service = new SqliteDataService();

        const adminEmail = 'amiryavor@gmail.com';
        const existingUser = await service.getUserByEmail(adminEmail);

        if (existingUser) {
            console.log(`User ${adminEmail} already exists. Updating role and password...`);
            await service.updateUser(existingUser.id, {
                role: 'admin',
                status: 'active',
                password: 'Ramir751!!0102', // Hashing omitted as per request/dev-mode context
                name: 'Amir Yavor'
            });
        } else {
            console.log(`Creating new user: ${adminEmail}`);
            await service.addUser({
                name: 'Amir Yavor',
                email: adminEmail,
                role: 'admin',
                status: 'active',
                password: 'Ramir751!!0102',
                isSample: false
            });
        }

        console.log("✅ Admin User check complete!");
    } catch (e) {
        console.error("❌ Failed to create admin user:", e);
        process.exit(1);
    }
}

main();
