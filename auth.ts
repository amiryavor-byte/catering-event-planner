import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ApiDataService } from '@/lib/data/api-service';

const api = new ApiDataService();

export const authOptions: NextAuthOptions = {
    providers: [
        // Dev Mode Provider - ALWAYS ENABLED FOR NOW
        CredentialsProvider({
            id: 'dev-mode',
            name: 'Dev Mode',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log('[Auth] Authorize called');

                if (!credentials?.email) return null;

                const normalizedEmail = credentials.email.toLowerCase();
                // Special handling for requested Admin user
                if (normalizedEmail === 'amiryavor@gmail.com' && credentials.password === 'Ramir751!!0102') {
                    return {
                        id: 'admin-user',
                        email: normalizedEmail,
                        name: 'Amir Yavor',
                        role: 'admin'
                    };
                }

                // Generic Dev-Mode fallback (if no password or special user)
                return {
                    id: 'dev-user',
                    email: normalizedEmail,
                    name: 'Developer',
                    role: 'admin'
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            // Skip database checks for dev mode
            if (user.id === 'dev-user') {
                console.log('[Auth] Dev mode bypass - skipping database checks');
                return true;
            }

            try {
                // 1. Check if user exists in our DB
                const existingUser = await api.getUserByEmail(user.email);

                if (!existingUser) {
                    // 2. Determine Role & Status
                    let role: 'admin' | 'manager' | 'staff' | 'client' = 'client'; // Default
                    let status: 'active' | 'pending' = 'pending'; // Default: Pending approval

                    if (user.email === 'amiryavor@gmail.com') {
                        role = 'admin';
                        status = 'active'; // Admin is auto-active
                    }

                    // 3. Create User in DB
                    console.log(`[Auth] Creating new user: ${user.email} as ${role} (${status})`);
                    await api.addUser({
                        name: user.name || 'Unknown',
                        email: user.email,
                        role: role,
                        status: status
                    });

                    // If newly created as pending, deny access immediately
                    if (status === 'pending') {
                        return '/auth/pending';
                    }
                } else {
                    console.log(`[Auth] User exists: ${user.email} [${existingUser.status}]`);

                    // 4. Check Pending Status
                    if (existingUser.status === 'pending') {
                        return '/auth/pending'; // Redirect to pending page
                    }
                }

                return true;
            } catch (error) {
                console.error('[Auth] Error syncing user:', error);
                return true; // Allow login but functionality may be limited
            }
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user) {
                token.role = (user as any).role || 'staff';
                token.dbId = user.id;

                // Force admin for dev/admin users
                if (user.id === 'dev-user' || user.id === 'admin-user' || user.email === 'amiryavor@gmail.com') {
                    token.role = 'admin';
                }
            }

            // Refresh role/data from DB if needed
            if (!user && token.email && token.dbId !== 'dev-user' && token.dbId !== 'admin-user') {
                const dbUser = await api.getUserByEmail(token.email);
                if (dbUser) {
                    token.role = dbUser.role;
                    token.dbId = dbUser.id;
                    token.picture = dbUser.profileImage;
                    token.language = dbUser.language;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.id = token.dbId;
                // @ts-ignore
                session.user.image = token.picture; // Override default image
                // @ts-ignore
                session.user.language = token.language || 'en';
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);

// Export individual auth helpers for Server Components
export const { signIn, signOut } = handler;

// Export GET/POST for App Router
export { handler as GET, handler as POST };
