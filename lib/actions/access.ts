'use server';

import { getDataService } from '@/lib/data/factory';
import { User } from '@/lib/data/types';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function getAccessUsers() {
    const service = getDataService();
    // Retrieve all users to manage their roles
    return await service.getUsers();
}

export async function updateAccess(id: number, role: 'admin' | 'staff' | 'client', status: 'active' | 'inactive' | 'pending') {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const service = getDataService();
    await service.updateUser(id, { role, status });
    revalidatePath('/dashboard/access');
    revalidatePath('/dashboard/users');
    revalidatePath('/dashboard/clients');
}
