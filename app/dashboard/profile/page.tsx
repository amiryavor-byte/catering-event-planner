'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ApiDataService } from '@/lib/data/api-service';
import { User } from '@/lib/data/types';
import { ProfileSettings } from '@/components/user/ProfileSettings';
import { Loader2 } from 'lucide-react';

const api = new ApiDataService();

export default function ProfilePage() {
    const { data: session } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            if (session?.user?.email) {
                try {
                    const userData = await api.getUserByEmail(session.user.email);
                    setUser(userData);
                } catch (err) {
                    console.error('Failed to load user profile', err);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchUser();
    }, [session]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-brand-500" size={32} />
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-white">User not found.</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400">Manage your personal settings and preferences.</p>

            <ProfileSettings user={user} onUpdate={(updated) => setUser(updated)} />
        </div>
    );
}
