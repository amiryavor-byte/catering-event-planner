'use server';

import { getDataService } from '@/lib/data/factory';
import { User } from '@/lib/data/types';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

const service = getDataService();

export async function getUsers(status?: string): Promise<User[]> {
    // Ideally ensure only admin calls this, but API key layer protects writes
    const service = getDataService();
    return await service.getUsers(status);
}

export async function approveUser(email: string) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const service = getDataService();
    await service.approveUser(email);
    revalidatePath('/dashboard/users');
}

export async function inviteUser(data: { name: string, email: string, role: 'admin' | 'staff' | 'client' }) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    // Force active status for invited users
    const service = getDataService();
    await service.addUser({
        ...data,
        status: 'active'
    });
    revalidatePath('/dashboard/users');
}

export async function updateUser(id: number, data: Partial<User>) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const service = getDataService();
    await service.updateUser(id, data);
    revalidatePath('/dashboard/users');
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard/access');
}

export async function deleteUser(id: number) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        const service = getDataService();
        // Soft delete: Change status to inactive
        await service.updateUser(id, { status: 'inactive' });
    } catch (error: any) {
        console.error(`Failed to soft-delete user ${id}:`, error);
        throw error;
    }

    revalidatePath('/dashboard/users');
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard/access');
}

export async function bulkDeleteUsers(ids: number[]) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const service = getDataService();
    // Execute all soft-deletions in parallel
    await Promise.all(ids.map(id => service.updateUser(id, { status: 'inactive' })));

    revalidatePath('/dashboard/users');
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard/access');
}

export async function resetPassword(id: number) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const service = getDataService();
    await service.resetPassword(id);
    // No path revalidation needed for a password reset log, but good practice
    revalidatePath('/dashboard/users');
}
