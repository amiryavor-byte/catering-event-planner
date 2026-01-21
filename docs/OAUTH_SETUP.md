# Google OAuth Setup Guide

This guide walks through setting up Google OAuth authentication for the Catering Event Planner application.

## Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)
- Vercel project dashboard access

## Step 1: Create Google Cloud Project

1. **Navigate to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Log in with your Google account

2. **Create a New Project**
   - Click the project dropdown in the top-left (next to Google Cloud logo)
   - Click **"New Project"**
   - Name it `Catering App` (or your preferred name)
   - Click **Create**
   - Wait for creation, then select the project from the notification or dropdown

## Step 2: Configure OAuth Consent Screen

> **Note:** This is required the first time you set up OAuth for a project.

1. **Access Consent Screen**
   - Click **"OAuth consent screen"** in the left sidebar
   - Select **External** (unless you have a Google Workspace organization)
   - Click **Create**

2. **Configure App Information**
   - **App name**: `CaterPlan` (or your brand name)
   - **User support email**: Select your email
   - **Developer contact email**: Enter your email

3. **Complete Setup**
   - Click **Save and Continue** through:
     - Scopes (no specific scopes needed yet)
     - Test Users (optional)
   - On the "Summary" page, click **"Back to Dashboard"**

4. **Publish App**
   - Under "Publishing Status", click **"Publish App"**
   - This allows any Google user to log in (not just test users)

## Step 3: Create OAuth Credentials

1. **Navigate to Credentials**
   - Click **"Credentials"** in the left sidebar
   - Click **+ CREATE CREDENTIALS** at the top
   - Select **OAuth client ID**

2. **Configure OAuth Client**
   - **Application type**: Select **Web application**
   - **Name**: `Vercel Production` (or preferred name)

3. **Add Authorized JavaScript Origins**
   ```
   https://catering.jewishingenuity.com
   ```
   (Replace with your production domain)

4. **Add Authorized Redirect URIs** ⚠️ CRITICAL
   ```
   https://catering.jewishingenuity.com/api/auth/callback/google
   ```
   
   The redirect URI must match exactly:
   - `https://` protocol
   - Your exact domain
   - `/api/auth/callback/google` path

5. **Create Credentials**
   - Click **Create**
   - A popup will appear with your credentials

## Step 4: Copy Your Credentials

From the popup that appears:

1. **Copy "Your Client ID"**
   - This is your `GOOGLE_CLIENT_ID`
   - Example format: `468526350550-xxxxxxxxxxxxx.apps.googleusercontent.com`

2. **Copy "Your Client Secret"**
   - This is your `GOOGLE_CLIENT_SECRET`
   - Example format: `GOCSPX-xxxxxxxxxxxxxxxxx`

> **⚠️ Security Note:** Keep these credentials secret! Never commit them to Git.

## Step 5: Configure Vercel Environment Variables

1. **Access Vercel Dashboard**
   - Go to your project: https://vercel.com/dashboard
   - Select your catering app project

2. **Add Environment Variables**
   - Navigate to: Settings → Environment Variables
   - Add the following variables:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `GOOGLE_CLIENT_ID` | (Your Client ID) | Production, Preview, Development |
   | `GOOGLE_CLIENT_SECRET` | (Your Client Secret) | Production, Preview, Development |
   | `AUTH_SECRET` | (Generate random string) | Production, Preview, Development |
   | `AUTH_URL` | Your production URL | Production |

3. **Generate AUTH_SECRET**
   ```bash
   openssl rand -base64 32
   ```
   Or use: https://generate-secret.vercel.app/32

## Step 6: Deploy

After adding environment variables:

1. **Trigger Deployment**
   ```bash
   npm run deploy
   ```
   Or push to your connected Git branch

2. **Verify Deployment**
   - Wait for Vercel deployment to complete
   - Visit your production URL
   - Test the Google OAuth login flow

## Verification Checklist

Before testing, ensure:

- ✅ OAuth consent screen is published (not in testing mode)
- ✅ Authorized JavaScript origins includes your domain
- ✅ Redirect URI matches exactly: `https://yourdomain.com/api/auth/callback/google`
- ✅ All environment variables are set in Vercel
- ✅ Latest deployment includes environment variables
- ✅ `auth.ts` includes Google provider configuration

## Troubleshooting

### "Authorization Error" or "Configuration Error"

**Possible causes:**
1. Redirect URI mismatch
   - Double-check it matches exactly
   - No trailing slashes
   - Correct protocol (https)

2. Environment variables not loaded
   - Redeploy after adding variables
   - Check variable names match exactly

3. OAuth consent screen not published
   - Go to OAuth consent screen
   - Click "Publish App"

### "Access Blocked: This app is not verified"

**Solution:**
- In OAuth consent screen, add your email as a test user
- Or complete the verification process (for production apps)

### "Redirect URI mismatch"

**Solution:**
1. Check Google Cloud Console → Credentials
2. Verify the redirect URI list includes:
   ```
   https://catering.jewishingenuity.com/api/auth/callback/google
   ```
3. No extra spaces or characters
4. Save and wait 5 minutes for changes to propagate

## Local Development

For local testing:

1. **Add localhost to Google Console**
   - JavaScript origins: `http://localhost:3000`
   - Redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Create .env.local**
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   AUTH_SECRET=your-auth-secret
   AUTH_URL=http://localhost:3000
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Security Best Practices

- ✅ Never commit `.env` files to Git
- ✅ Use different OAuth clients for dev/staging/production
- ✅ Rotate secrets periodically
- ✅ Enable 2FA on your Google Cloud account
- ✅ Monitor OAuth usage in Google Cloud Console
- ✅ Review authorized redirect URIs regularly

## Additional Resources

- [NextAuth.js Google Provider Docs](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Environment Variables Guide](https://vercel.com/docs/environment-variables)
