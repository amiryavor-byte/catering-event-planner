# Deployment Guide

This guide covers deploying the Catering Event Planner application using Vercel for the frontend and HostGator for the backend database.

## Architecture Overview

The application uses a "Split-Horizon" architecture:

- **Frontend**: Next.js application hosted on Vercel
- **Backend**: PHP/MySQL API hosted on HostGator
- **Domain**: Single domain pointing to Vercel, API calls route to HostGator IP

```
User Request
    ↓
catering.jewishingenuity.com (DNS → Vercel)
    ↓
Next.js Frontend (Vercel)
    ↓
API Calls → 75.203.51.130 (HostGator IP)
    ↓
PHP Backend + MySQL Database
```

## Prerequisites

### Required Accounts
- GitHub account (for code repository)
- Vercel account (for frontend hosting)
- HostGator account (for backend/database)

### Required Tools
- Node.js 18+ installed
- Git installed
- SSH access or FTP for HostGator

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/amiryavor-byte/catering-event-planner.git
cd catering-event-planner
npm install
```

### 2. Environment Configuration

Create environment files:

**`.env.local`** (for local development):
```bash
# Development mode uses SQLite
DATABASE_URL="sqlite.db"

# Or connect to HostGator for testing
API_MODE=api
NEXT_PUBLIC_API_URL=https://api.jewishingenuity.com/Catering_app

# Authentication
AUTH_SECRET="your-generated-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
AUTH_URL="http://localhost:3000"
```

**`.env.production`** (for Vercel):
```bash
API_MODE=api
NEXT_PUBLIC_API_URL=https://api.jewishingenuity.com/Catering_app

AUTH_SECRET="your-generated-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
AUTH_URL="https://catering.jewishingenuity.com"
```

> **⚠️ Important:** Never commit `.env` files to Git!

## Vercel Deployment

### First-Time Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Link Project**
   ```bash
   vercel link
   ```
   - Select your team/account
   - Link to existing project or create new
   - Set project name

3. **Configure Environment Variables**
   
   Via Vercel Dashboard:
   - Go to: Settings → Environment Variables
   - Add all variables from `.env.production`
   
   Or via CLI:
   ```bash
   vercel env add GOOGLE_CLIENT_ID production
   vercel env add GOOGLE_CLIENT_SECRET production
   vercel env add AUTH_SECRET production
   vercel env add AUTH_URL production
   vercel env add API_MODE production
   vercel env add NEXT_PUBLIC_API_URL production
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Automated Deployment Script

The project includes a deployment script:

```bash
npm run deploy
```

This script:
1. Auto-increments version number in `lib/version.ts`
2. Commits version change
3. Pushes to GitHub
4. Triggers Vercel production deployment

## HostGator Backend Setup

### Database Configuration

The MySQL database should already be configured with:
- Database name: `rriczdte_catering_vercel`
- Host IP: `75.203.51.130`
- User: (configured)
- Password: (configured)

### PHP API Files

Upload the `php_api/` directory to HostGator:

```
/public_html/
  └── Catering_app/
      ├── company.php
      ├── ingredients.php
      ├── tasks.php
      ├── menus.php
      ├── users.php
      └── config/
          └── database.php
```

**Via FTP:**
1. Connect to HostGator FTP
2. Navigate to `public_html/Catering_app/`
3. Upload all PHP files from `php_api/`

**Via cPanel File Manager:**
1. Log into HostGator cPanel
2. Open File Manager
3. Navigate to `public_html/`
4. Upload files

### Verify API Endpoints

Test that APIs are accessible:

```bash
curl https://api.jewishingenuity.com/Catering_app/tasks.php
```

Should return JSON (even if empty):
```json
{"success": true, "data": []}
```

## DNS Configuration

### Why Direct IP Connection?

The frontend connects to the database using HostGator's IP address (`75.203.51.130`) instead of the domain name. This allows:
- Domain to point to Vercel (frontend)
- API calls to reach HostGator (backend)
- No DNS conflicts

### Update DNS Records

In HostGator cPanel:

1. **Navigate to DNS**
   - cPanel → Zone Editor (or Advanced DNS Zone Editor)

2. **Update A Record for Subdomain**
   
   For `catering.jewishingenuity.com`:
   - Delete existing A record (if present)
   - Add CNAME record:
     - **Name**: `catering`
     - **Type**: `CNAME`
     - **Value**: `cname.vercel-dns.com`
     - **TTL**: 3600

3. **Propagation**
   - DNS changes take 15 minutes to 48 hours
   - Check with: `dig catering.jewishingenuity.com`

### Verify DNS

```bash
# Should point to Vercel
dig catering.jewishingenuity.com

# Should point to HostGator
dig api.jewishingenuity.com
```

## Deployment Workflow

### Making Changes

1. **Develop Locally**
   ```bash
   npm run dev
   # Test at http://localhost:3000
   ```

2. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add new feature"
   ```

3. **Push to GitHub**
   ```bash
   git push origin main
   ```

4. **Deploy to Production**
   ```bash
   npm run deploy
   ```

### Automatic Deployment

If you've connected Vercel to GitHub:
- Pushing to `main` branch automatically deploys to production
- Pull requests create preview deployments
- No manual deployment needed

### Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

## Environment Variables

### Production Variables (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `468526350550-xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-xxxxxxxx` |
| `AUTH_SECRET` | NextAuth.js secret | Generate with `openssl rand -base64 32` |
| `AUTH_URL` | Production URL | `https://catering.jewishingenuity.com` |
| `API_MODE` | API connection mode | `api` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.jewishingenuity.com/Catering_app` |

### Updating Environment Variables

1. **Via Vercel Dashboard**
   - Settings → Environment Variables
   - Edit or add variable
   - Redeploy for changes to take effect

2. **Via CLI**
   ```bash
   vercel env add VARIABLE_NAME production
   vercel env ls
   ```

3. **Redeploy**
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Build Failures

**Check build logs:**
```bash
vercel logs
```

**Common issues:**
- TypeScript errors → Fix in code
- Missing environment variables → Add in Vercel dashboard
- Dependency issues → Update `package.json`

### API Connection Errors

**Verify backend:**
```bash
curl https://api.jewishingenuity.com/Catering_app/tasks.php
```

**Check:**
- HostGator server is running
- PHP files are uploaded correctly
- Database credentials are correct
- CORS headers are set in PHP

### Authentication Issues

**Verify OAuth setup:**
- Google Cloud Console credentials match Vercel env vars
- Redirect URI is correct
- OAuth consent screen is published

**Check:**
```bash
# View environment variables
vercel env ls

# Check AUTH_URL matches production domain
```

## Rollback

### Rollback Vercel Deployment

1. **Via Dashboard**
   - Deployments tab
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Via CLI**
   ```bash
   # List deployments
   vercel ls
   
   # Promote specific deployment
   vercel promote <deployment-url>
   ```

### Rollback Code

```bash
# View commit history
git log --oneline

# Revert to specific commit
git revert <commit-hash>
git push origin main
```

## Monitoring

### Vercel Analytics

- Dashboard: https://vercel.com/dashboard
- View: Usage, Performance, Errors
- Real-time logs and metrics

### Check Application Health

```bash
# Frontend
curl -I https://catering.jewishingenuity.com

# Backend API
curl https://api.jewishingenuity.com/Catering_app/tasks.php
```

## Production Checklist

Before deploying to production:

- ✅ All tests passing
- ✅ Environment variables configured
- ✅ OAuth credentials configured
- ✅ DNS records updated
- ✅ Database connection tested
- ✅ Remove dev mode toggle (or gate with env var)
- ✅ Error tracking configured
- ✅ Backup database
- ✅ Test authentication flow
- ✅ Verify all API endpoints

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [HostGator PHP Documentation](https://www.hostgator.com/help/category/programming-databases/php)
