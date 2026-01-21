# Development Mode Authentication Bypass

## Overview

This guide explains the temporary development mode that allows bypassing authentication to access the dashboard. This is useful for testing and development when OAuth is being debugged.

> **⚠️ WARNING:** This is a temporary development feature. Remove before final production deployment.

## How It Works

### Cookie-Based Bypass System

The dev mode uses a dual-layer authentication bypass:

**Client-Side Storage:**
- `localStorage.devMode = 'true'`
- `localStorage.bypassed-auth = 'true'`

**Server-Side Cookie:**
- `dev-mode=true` (24-hour expiration)
- Path: `/` (site-wide)
- SameSite: `Lax`

### Implementation Details

#### Middleware Integration
Location: `middleware.ts`

The middleware checks for the dev-mode cookie in addition to regular session cookies:

```typescript
export function middleware(request: NextRequest) {
    const session = request.cookies.get('session');
    const devMode = request.cookies.get('dev-mode');

    // Allow access if there's a valid session OR dev mode is enabled
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session && !devMode) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
}
```

#### Login Page
Location: `app/login/page.tsx`

Implements the cookie-based bypass mechanism:

```typescript
const handleDevLogin = () => {
    setLoading(true);
    
    // Set dev mode cookie (expires in 24 hours)
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    document.cookie = `dev-mode=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    
    // Set localStorage flags for client-side checks
    localStorage.setItem('devMode', 'true');
    localStorage.setItem('bypassed-auth', 'true');
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
};
```

## Usage

### Accessing Dashboard with Dev Mode

1. Visit the login page: `https://catering.jewishingenuity.com/login`
2. Click the "🔒 Click for Dev Mode" toggle button at the bottom
3. Button changes to "🔓 Dev Mode Active"
4. Click "Enter as Admin (Dev)" button
5. You'll be redirected to the dashboard with full access

### Verification

After bypassing, you can verify the setup:

**Check Cookies:**
```
dev-mode=true
```

**Check LocalStorage:**
```json
{
  "devMode": "true",
  "bypassed-auth": "true"
}
```

### Disabling Dev Mode

To disable dev mode and restore normal authentication:

1. Clear cookies for the site
2. Clear localStorage
3. Refresh the page

Or simply wait 24 hours for the cookie to expire.

## Security Considerations

### Current Implementation
- ✅ 24-hour cookie expiration
- ✅ Visible warning message on UI
- ⚠️ Client-side activation (no authentication required)

### Before Production

Choose one of these approaches:

**Option 1: Remove Completely**
```typescript
// Remove dev mode toggle from login page
// Remove dev-mode cookie check from middleware
```

**Option 2: Environment Gate**
```typescript
{process.env.NODE_ENV === 'development' && (
  <DevModeToggle />
)}
```

**Option 3: Require Token**
```typescript
const DEV_TOKEN = process.env.DEV_MODE_TOKEN;
// Require token input before enabling dev mode
```

## Technical Details

### Why Cookie-Based?

**Previous Approach (Failed):**
- Attempted to use `signIn('dev-mode', ...)` with custom provider
- Provider didn't exist, causing errors
- Server-side middleware couldn't detect localStorage

**Current Approach (Success):**
- Sets HTTP cookie that middleware can read
- Cookie persists across requests
- Works with existing NextAuth session detection
- No need to modify `auth.ts` configuration

## Files Modified

1. **middleware.ts** - Added dev-mode cookie detection
2. **app/login/page.tsx** - Implemented cookie-based bypass
3. **lib/version.ts** - Version tracking

## Troubleshooting

### Dev Mode Not Working

1. Check that cookies are enabled in browser
2. Verify cookie is set with correct domain
3. Check browser console for errors
4. Ensure localStorage is accessible

### Redirected Back to Login

1. Cookie may have expired (24-hour limit)
2. Cookie domain mismatch
3. Browser privacy settings blocking cookies

### Console Errors

If you see authentication errors, try:
1. Clear all cookies and localStorage
2. Hard refresh (Cmd+Shift+R)
3. Try in incognito mode
