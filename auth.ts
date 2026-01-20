import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ApiDataService } from '@/lib/data/api-service';

const api = new ApiDataService();

export const authOptions: NextAuthOptions = {
    providers: [
        // Dev Mode Provider (only active in development)
        CredentialsProvider({
            id: 'dev-mode',
            name: 'Dev Mode',
            credentials: {
                email: { label: "Email", type: "email" }
            },
            async authorize(credentials) {
                // Only allow in development or if explicitly enabled
                if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_MODE !== 'true') {
                    return null;
                }

                if (!credentials?.email) {
                    return null;
                }

                // Return a dev user
                return {
                    id: 'dev-user',
                    email: credentials.email,
                    name: 'Developer',
                    image: null,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            try {
                // 1. Check if user exists in our DB
                const existingUser = await api.getUserByEmail(user.email);

                if (!existingUser) {
                    // 2. Determine Role & Status
                    let role: 'admin' | 'staff' | 'client' = 'client'; // Default
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
                    if (existingUser.status === 'pending' || existingUser.status === 'rejected') {
                        return '/auth/pending'; // Redirect to pending page
                    }
                }

                return true;
            } catch (error) {
                console.error('[Auth] Error syncing user:', error);
                return true; // Allow login but functionality may be limited
            }
        },
        async jwt({ token, user }) {
            // On initial sign in, fetch role from DB to persist in token
            if (user?.email) {
                const dbUser = await api.getUserByEmail(user.email);
                if (dbUser) {
                    token.role = dbUser.role;
                    token.dbId = dbUser.id;
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
            }
            return session;
        }
    },
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);

// Export individual auth helpers for Server Components
export const { signIn, signOut } = handler;

// Export GET/POST for App Router
export { handler as GET, handler as POST };
