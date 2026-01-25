
import { ApiDataService } from '../lib/data/api-service';

async function verifyUserDeletion() {
    const api = new ApiDataService();
    console.log('🧪 Starting User Deletion verification...');

    // 1. Create a test user
    const testUser = {
        name: 'Delete Test User',
        email: `deletetest_${Date.now()}@example.com`,
        role: 'staff' as const,
        status: 'active' as const
    };

    let createdUser;

    try {
        console.log('Creating test user...');
        createdUser = await api.addUser(testUser);
        console.log(`✅ Created user: ${createdUser.name} (ID: ${createdUser.id})`);
    } catch (e) {
        console.error('❌ Failed to create user:', e);
        return;
    }

    // 2. Attempt Soft Delete (Update status to inactive)
    try {
        console.log('Attempting soft delete (status=inactive)...');
        // This simulates what deleteUser action does
        await api.updateUser(createdUser.id, { status: 'inactive' });
        console.log('✅ Soft delete successful (no error returned)');
    } catch (e) {
        console.error('❌ Soft delete failed:', e);
    }

    // 3. Verify status is inactive
    try {
        const users = await api.getUsers();
        const updated = users.find(u => u.id === createdUser!.id);

        if (updated?.status === 'inactive') {
            console.log('✅ Verification: User status is indeed "inactive"');
        } else {
            console.error('❌ Verification Failed: User status is', updated?.status);
        }

        // Cleanup: Hard delete
        console.log('Cleaning up (Hard Delete)...');
        await api.deleteUser(createdUser.id);
        console.log('✅ Cleanup complete');

    } catch (e) {
        console.error('Verification/Cleanup failed:', e);
    }
}

verifyUserDeletion();
