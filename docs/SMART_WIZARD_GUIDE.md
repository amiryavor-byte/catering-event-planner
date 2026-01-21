# Smart Wizard Implementation Guide

## Overview

The Setup Wizard helps new catering companies onboard by collecting their branding, staff roster, and menus. This guide covers the implementation of the enhanced wizard with company branding and file upload functionality.

## Features

### 1. Company Branding (Step 1)

#### Logo Upload
- Image upload functionality with instant preview
- Supports PNG, JPG, and WebP formats
- Shows loading state during upload
- Files stored in `/public/uploads/` with timestamp prefixes

#### Company Settings
- Company name input with validation
- Interactive color picker with live hex code display
- Visual feedback for selected brand color

#### Settings Persistence
- Uses localStorage for temporary storage (until backend API is ready)
- Successfully saves and retrieves company branding data
- Settings stored under `companySettings` key

### 2. Staff Import (Step 2)

#### Enhanced UX
- File selection UI showing selected filename
- Separate "Process File" button after file selection
- "Skip for Now" option to proceed without uploading
- Loading states with animations
- AI-powered CSV/XLSX parsing (in progress)

### 3. Menu Management (Step 3)

- PDF upload support
- AI-powered dish extraction (planned)
- Ingredient identification (planned)

## Technical Implementation

### API Endpoints

#### File Upload API
**Location:** `/app/api/upload/route.ts`

Handles file uploads for:
- Company logos (`image/png`, `image/jpeg`, `image/jpg`, `image/webp`)
- Menu PDFs (`application/pdf`)
- Staff rosters (CSV, XLSX)

Features:
- File type validation
- Automatic directory creation
- Unique filename generation with timestamps
- Public URL generation
- Comprehensive error handling

### Settings Management

**Location:** `/lib/actions/company.ts`

Provides functions for:
- Saving company settings to localStorage
- Retrieving company settings
- Settings validation

```typescript
interface CompanySettings {
  companyName: string;
  brandColor: string;
  logoUrl?: string;
}
```

### Migration Path

The wizard currently uses localStorage for settings persistence. When the backend API is ready:

1. Create `/company.php` endpoint on HostGator
2. Update `/lib/actions/company.ts` to use API calls
3. Migrate existing localStorage data to MySQL
4. Maintain backward compatibility during transition

## Version History

- **v0.9.30** - Initial enhanced wizard deployment
- **v0.9.31** - Logo upload and company settings (had 500 error)
- **v0.9.32** - Fixed with localStorage persistence ✅ **CURRENT**

## Usage

### Accessing the Wizard

1. Visit: `https://catering.jewishingenuity.com/setup`
2. Complete Step 1: Company Branding
   - Upload logo
   - Enter company name
   - Select brand color
3. Complete Step 2: Staff Import (optional)
   - Upload CSV/XLSX file
   - Or skip for now
4. Step 3: Menu Management (coming soon)

### Testing with Dev Mode

1. Go to login page
2. Toggle "Enable Dev Mode"
3. Navigate to `/setup`
4. Experience the enhanced onboarding flow

## Future Enhancements

### Staff CSV Parsing
- AI-powered parsing using OpenAI
- Support for various CSV formats
- XLSX file support
- Automatic field mapping

### Menu PDF Parsing
- PDF text extraction
- AI-powered dish categorization
- Ingredient identification
- Automatic pricing suggestions

### Backend Integration
- Migrate from localStorage to MySQL
- Implement `/company.php` endpoint
- Persistent company branding across sessions
- Multi-user support with role-based access
