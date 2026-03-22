# Infrastructure Documentation

This document describes the complete infrastructure for CardTrack, created on 2026-03-22.

## Project Overview

**Name:** CardTrack  
**Purpose:** eBay card sales P&L tracking dashboard  
**Status:** MVP Complete - Ready for Deployment  
**Location:** `/Users/mastercontrol/.openclaw/workspace/ebay-card-dashboard`

## Technology Stack

### Frontend
- **Framework:** Next.js 14.2.1
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts 3.8.0
- **Runtime:** Node.js 18+

### Backend
- **API:** Next.js API Routes (REST)
- **Auth:** eBay OAuth 2.0
- **HTTP Client:** Axios 1.13.6

### Database
- **Provider:** Supabase (PostgreSQL)
- **Schema:** See DATABASE.md or SETUP.md

### Deployment
- **Platform:** Vercel
- **Domain:** `*.vercel.app` (or custom)
- **Environment:** Automatic staging + production

## API Keys & Credentials

### Required eBay Developer Credentials
```
EBAY_CLIENT_ID         - eBay App ID
EBAY_CLIENT_SECRET     - eBay App Secret
EBAY_REDIRECT_URI      - OAuth callback URL
```

### Required Supabase Credentials
```
NEXT_PUBLIC_SUPABASE_URL       - Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  - Anonymous key (public)
SUPABASE_SERVICE_ROLE_KEY      - Service role (private)
```

### Auth Secrets
```
NEXTAUTH_SECRET - Random 32-byte secret for session signing
NEXTAUTH_URL    - Your app's base URL
```

**Storage:** All credentials stored in `.env.local` (development) and Vercel Environment Variables (production). Never commit `.env.local` to git.

## Database Schema

### Table: `transactions`

```sql
CREATE TABLE transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id VARCHAR(255) NOT NULL,
  ebay_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) CHECK (type IN ('buy', 'sell')),
  card_type VARCHAR(50) CHECK (card_type IN ('sports', 'pokemon')),
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

Indexes:
- PRIMARY KEY on id
- UNIQUE on ebay_transaction_id
- INDEX on user_id
- INDEX on card_type
- INDEX on type
```

## API Endpoints

### Authentication
- `GET /` - Login page (redirects to eBay OAuth)
- `GET /api/auth/callback/ebay` - OAuth callback handler

### Dashboard
- `GET /dashboard` - Main dashboard page

### Data
- `POST /api/transactions/sync` - Sync eBay transactions
- `GET /api/transactions/stats` - Get dashboard statistics

## Environment Variables (.env.local)

### Development
```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000

EBAY_CLIENT_ID=dev_client_id
EBAY_CLIENT_SECRET=dev_client_secret
EBAY_REDIRECT_URI=http://localhost:3000/api/auth/callback/ebay

NEXT_PUBLIC_SUPABASE_URL=https://dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=dev_service_key

NEXTAUTH_SECRET=dev_secret
```

### Production (Vercel)
Same variables as above, but with production values:
- eBay production credentials (not sandbox)
- Supabase production project
- NEXTAUTH_URL = your production domain
- EBAY_REDIRECT_URI = production callback URL

## Deployment Pipeline

### Local Development
```bash
npm install
cp .env.example .env.local  # Add your dev credentials
npm run dev                  # http://localhost:3000
```

### Testing & Preview
```bash
npm run build
npm run start                # Production-like environment
```

### Production Deployment
```bash
# Option 1: Vercel CLI
vercel --prod

# Option 2: GitHub Auto-Deploy
git push origin main        # Triggers Vercel deployment
```

## File Structure

```
ebay-card-dashboard/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Home/login page
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard page
│   └── api/
│       ├── auth/
│       │   └── callback/
│       │       └── ebay/
│       │           └── route.ts    # OAuth callback
│       └── transactions/
│           ├── sync/
│           │   └── route.ts        # Sync endpoint
│           └── stats/
│               └── route.ts        # Stats endpoint
│
├── components/                # React components
│   ├── StatsCards.tsx
│   ├── ProfitChart.tsx
│   ├── CategoryBreakdown.tsx
│   └── Navigation.tsx
│
├── lib/                       # Utility libraries
│   ├── supabase.ts           # Supabase client
│   └── ebay.ts               # eBay API helpers
│
├── public/                    # Static files
│
├── Configuration Files
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── package.json
│   └── .gitignore
│
├── Documentation
│   ├── README.md             # Project overview
│   ├── SETUP.md              # Setup guide
│   ├── DEPLOY.md             # Deployment guide
│   ├── INFRASTRUCTURE.md     # This file
│   ├── .env.example          # Environment template
│   └── .env.local            # Local config (gitignored)
```

## Cost Analysis

### Monthly Costs
| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Vercel | Free | $0 | 5GB bandwidth/month |
| Supabase | Free | $0 | 500MB database, 2GB bandwidth |
| eBay API | Free | $0 | Calls are free (auth required) |
| **Total** | - | **$0** | Under free tier limits |

### Scaling Costs
If traffic exceeds free tiers:
- Vercel: $20/month for Pro
- Supabase: $25/month for Pro

## Security Considerations

### Authentication
- ✅ OAuth 2.0 via eBay (user doesn't share password)
- ✅ HTTPS only in production
- ✅ HttpOnly cookies for tokens
- ⚠️ User IDs stored in localStorage (dev simplification)

### Data Protection
- ✅ Supabase has built-in encryption
- ✅ API keys never exposed to client
- ✅ Service role key stored server-side only

### Environment Variables
- ✅ Never commit `.env.local`
- ✅ Vercel keeps secrets encrypted
- ✅ Use different keys for dev/prod

### Future Improvements
- [ ] Store access tokens in database (encrypted)
- [ ] Implement refresh token rotation
- [ ] Add rate limiting
- [ ] Add request signing
- [ ] Audit logging

## Monitoring & Observability

### Logging
- Vercel provides built-in error logging
- View logs: `vercel logs [URL]`

### Metrics
- Vercel Analytics dashboard
- Supabase dashboard for database stats
- Browser DevTools for frontend performance

### Alerts
- Set up Vercel deployment alerts
- Supabase database alerts (Pro tier)

## Backup & Recovery

### Database Backups
- Supabase: Automatic daily backups (free tier)
- Access via Supabase dashboard

### Code Backups
- GitHub repository (version control)
- Vercel git history

### Recovery Procedures
1. **Database:** Restore from Supabase backup
2. **Code:** Revert to previous git commit
3. **Deployment:** Redeploy from Vercel dashboard

## Maintenance Schedule

| Task | Frequency | Responsible |
|------|-----------|-------------|
| Dependency updates | Monthly | Manual |
| Security patches | As needed | Automatic |
| Database backups | Daily | Supabase |
| Log cleanup | Monthly | Vercel |

## Known Limitations

1. **Free tier limits**
   - Vercel: 5GB bandwidth/month
   - Supabase: 500MB database

2. **eBay API**
   - Rate limited (contact eBay for details)
   - OAuth token expires (need refresh)
   - Sandbox vs production credentials required

3. **Card Detection**
   - Simple keyword matching (sports/pokemon)
   - No ML/image recognition (yet)

## Future Enhancements

- [ ] User authentication with NextAuth.js
- [ ] Secure token storage in database
- [ ] Transaction import via CSV
- [ ] Manual transaction entry
- [ ] Advanced filtering and search
- [ ] Export reports (PDF/Excel)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Multi-user support with teams
- [ ] AI-powered price recommendations

## Contact & Support

**Created:** 2026-03-22  
**Last Updated:** 2026-03-22  
**Maintainer:** CardTrack Team

For issues or questions, refer to:
- README.md for overview
- SETUP.md for local setup
- DEPLOY.md for production deployment
