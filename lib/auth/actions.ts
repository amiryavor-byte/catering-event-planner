'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // TODO: Replace with Real DB Lookup & BCrypt
    // Mock Auth for MVP Speed
    if (email === 'admin@caterplan.com' && password === 'admin') {
        // Set 24h session cookie
        (await cookies()).set('session', 'admin_token_secure_123', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
        });
        redirect('/dashboard');
    }

    if (email === 'staff@caterplan.com' && password === 'staff') {
        (await cookies()).set('session', 'staff_token_secure_456', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
        });
        redirect('/dashboard/staff');
    }

    return { error: 'Invalid credentials' };
}

export async function logout() {
    (await cookies()).delete('session');
    redirect('/login');
}
