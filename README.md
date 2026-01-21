# Catering Event Planner

A white-label catering management platform with event planning, menu management, and staff coordination features.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/amiryavor-byte/catering-event-planner.git
cd catering-event-planner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

- **[Deployment Guide](docs/DEPLOYMENT.md)** - Complete deployment instructions for Vercel + HostGator
- **[OAuth Setup](docs/OAUTH_SETUP.md)** - Google OAuth authentication configuration
- **[Smart Wizard Guide](docs/SMART_WIZARD_GUIDE.md)** - Company onboarding wizard implementation
- **[Dev Mode Guide](docs/DEV_MODE_GUIDE.md)** - Development mode authentication bypass

## ✨ Features

### Current Features (v0.9.32)

- ✅ **Google OAuth Authentication** - Secure user login
- ✅ **Smart Onboarding Wizard** - Company branding, logo upload, color picker
- ✅ **Staff Management** - CSV/XLSX import with AI parsing
- ✅ **Task Management** - Create, assign, and track tasks
- ✅ **Ingredient Inventory** - Track ingredients and stock levels
- ✅ **Menu Management** - Build menus with pricing
- ✅ **Event Dashboard** - Comprehensive overview of operations

### Coming Soon

- 🔄 **Menu PDF Parsing** - AI-powered dish extraction from PDF menus
- 🔄 **Recipe Editor** - Visual recipe builder with cost calculations
- 🔄 **Live Cost Calculator** - Real-time pricing based on ingredients
- 🔄 **Staff Scheduling** - Automated scheduling and availability tracking
- 🔄 **Mobile App** - Native iOS/Android applications

## 🏗️ Architecture

### Split-Horizon Model

```
Frontend (Next.js) → Vercel
    ↓
Backend (PHP/MySQL) → HostGator
```

- **Frontend**: Next.js 15.1.4 with App Router, hosted on Vercel
- **Backend**: PHP REST API with MySQL database on HostGator
- **Authentication**: NextAuth.js v4.24.13 with Google OAuth
- **Styling**: Tailwind CSS with custom design system

### Tech Stack

**Frontend:**
- Next.js 15.1.4
- React 19
- TypeScript
- Tailwind CSS
- NextAuth.js
- Lucide Icons

**Backend:**
- PHP 8+
- MySQL
- RESTful API architecture

**Deployment:**
- Vercel (Frontend)
- HostGator (Backend/Database)

## 🛠️ Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Environment Variables

Create a `.env.local` file with:

```bash
# Database (for local development with SQLite)
DATABASE_URL="sqlite.db"

# Or connect to remote API
API_MODE=api
NEXT_PUBLIC_API_URL=https://api.jewishingenuity.com/Catering_app

# Authentication
AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
AUTH_URL="http://localhost:3000"
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Building
npm run build        # Build for production
npm run start        # Start production build

# Deployment
npm run deploy       # Auto-increment version and deploy to Vercel

# Linting
npm run lint         # Run ESLint
```

### Project Structure

```
catering-app/
├── app/                  # Next.js App Router pages
│   ├── api/             # API routes (file uploads, etc.)
│   ├── dashboard/       # Main dashboard
│   ├── login/           # Authentication page
│   └── setup/           # Onboarding wizard
├── components/          # React components
├── lib/                 # Utility functions and actions
│   ├── actions/         # Server actions
│   └── version.ts       # Version tracking
├── php_api/             # Backend PHP API
├── public/              # Static assets
│   └── uploads/         # User-uploaded files
├── docs/                # Documentation
└── package.json
```

## 📋 Version History

- **v0.9.32** (Current) - Smart Wizard with localStorage persistence
- **v0.9.31** - Logo upload and company settings
- **v0.9.30** - Enhanced onboarding wizard
- **v0.9.29** - Dev mode authentication bypass

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## 🔐 Security

- OAuth credentials are never committed to Git (`.gitignore` protection)
- Environment variables stored securely in Vercel
- Database credentials use IP-based connection (not domain)
- localStorage used for temporary settings (migrating to backend)

## 🧪 Testing

### Development Mode

For testing without OAuth:

1. Visit `/login`
2. Toggle "Enable Dev Mode"
3. Click "Enter as Admin (Dev)"
4. Access full dashboard

See [Dev Mode Guide](docs/DEV_MODE_GUIDE.md) for details.

## 🚀 Deployment

### Quick Deploy

```bash
npm run deploy
```

This automatically:
1. Increments version number
2. Commits changes
3. Pushes to GitHub
4. Triggers Vercel production deployment

For detailed deployment instructions, see [Deployment Guide](docs/DEPLOYMENT.md).

## 🤝 Contributing

### Workflow

1. Clone the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

### Code Style

- Follow existing code conventions
- Use TypeScript for type safety
- Write meaningful commit messages
- Test thoroughly before committing

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Review existing issues and discussions

## 📄 License

This project is proprietary software. All rights reserved.

## 🎯 Roadmap

### Phase 1: Core Features (✅ Complete)
- [x] Authentication system
- [x] Basic CRUD operations
- [x] Company onboarding wizard
- [x] Staff management

### Phase 2: Enhanced Features (🔄 In Progress)
- [x] Logo upload and branding
- [ ] AI-powered CSV parsing
- [ ] PDF menu extraction
- [ ] Recipe editor

### Phase 3: Advanced Features (📅 Planned)
- [ ] Mobile applications
- [ ] Advanced analytics
- [ ] Multi-tenant support
- [ ] API for third-party integrations

## 🌟 Acknowledgments

Built with modern web technologies and best practices for catering businesses worldwide.

---

**Current Version:** 0.9.32  
**Last Updated:** January 2026  
**Live Demo:** https://catering.jewishingenuity.com
