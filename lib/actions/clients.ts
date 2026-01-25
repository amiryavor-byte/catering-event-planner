'use server';

import { getDataService } from '@/lib/data/factory';
import { User } from '@/lib/data/types';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function getClients() {
    const service = getDataService();
    const users = await service.getUsers('active');
    return users.filter(user => user.role === 'client');
}

export async function createClient(data: { name: string, email: string, phoneNumber?: string, address?: string }) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const service = getDataService();
    // Clients created this way are auto-activated
    await service.addUser({
        ...data,
        role: 'client',
        status: 'active'
    });
    revalidatePath('/dashboard/clients');
}

export async function updateClient(id: number, data: Partial<User>) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const service = getDataService();
    await service.updateUser(id, data);
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard/users');
}

export async function deleteClient(id: number) {
    const session = await getServerSession(authOptions);
    console.log('[deleteClient] Session:', JSON.stringify(session, null, 2));
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        // @ts-ignore
        throw new Error(`Unauthorized. Role: ${session?.user?.role}, ID: ${session?.user?.id}`);
    }

    const service = getDataService();
    await service.deleteUser(id);
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard/users');
}
