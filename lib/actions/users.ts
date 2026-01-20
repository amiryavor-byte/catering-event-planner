'use server';

import { ApiDataService } from '@/lib/data/api-service';
import { User } from '@/lib/data/types';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

const api = new ApiDataService();

export async function getUsers(status?: string): Promise<User[]> {
    // Ideally ensure only admin calls this, but API key layer protects writes
    return await api.getUsers(status);
}

export async function approveUser(email: string) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    await api.approveUser(email);
    revalidatePath('/dashboard/users');
}

export async function inviteUser(data: { name: string, email: string, role: 'admin' | 'staff' | 'client' }) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    // Force active status for invited users
    await api.addUser({
        ...data,
        status: 'active'
    });
    revalidatePath('/dashboard/users');
}
