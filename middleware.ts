import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
    const devMode = request.cookies.get('dev-mode');

    // 1. Protect Dashboard Routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        // Allow access if there's a valid session OR dev mode is enabled
        if (!session && !devMode) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 2. Redirect logged-in users away from Login page
    if (request.nextUrl.pathname === '/login') {
        // Only redirect if there's a real session (not dev mode)
        if (session && !devMode) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // 3. Redirect root path to dashboard (or login if not authenticated)
    if (request.nextUrl.pathname === '/') {
        if (session || devMode) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/'],
};
