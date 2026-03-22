# CardTrack 🎴

A modern web dashboard for tracking eBay sports & Pokemon card sales profit & loss.

Perfect for 11-year-old card collectors who want to understand their business! 📊

## Features

✨ **What's Included:**

- 📊 **Dashboard** - See total spent, revenue, and profit at a glance
- 📈 **P&L Charts** - Visualize profit/loss over time
- 🏆 **Category Breakdown** - Compare Sports vs Pokemon card performance
- 🔐 **eBay OAuth** - Secure login with your eBay account
- 💾 **Supabase Database** - Store and analyze transaction history
- 📱 **Mobile Responsive** - Works perfectly on MacBook, iPad, and phone
- ⚡ **Clean UI** - Simple, intuitive design that's easy to use

## Getting Started

### Quick Start

```bash
# 1. Clone and install
git clone <repo>
cd ebay-card-dashboard
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Run dev server
npm run dev

# 4. Open http://localhost:3000
```

### Full Setup

See [SETUP.md](./SETUP.md) for:
- eBay API credentials
- Supabase database setup
- Environment configuration

## Tech Stack

```
Frontend:    Next.js 14 + React + TypeScript
Styling:     Tailwind CSS
Charts:      Recharts
Backend:     Next.js API Routes
Database:    Supabase (PostgreSQL)
Auth:        eBay OAuth 2.0
Deployment:  Vercel
```

## Project Structure

```
ebay-card-dashboard/
├── app/
│   ├── page.tsx              # Login page
│   ├── dashboard/            # Main dashboard
│   │   └── page.tsx
│   └── api/
│       └── auth/             # OAuth callback
│       └── transactions/     # API routes
├── components/               # React components
│   ├── StatsCards.tsx
│   ├── ProfitChart.tsx
│   ├── CategoryBreakdown.tsx
│   └── Navigation.tsx
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── ebay.ts               # eBay API helpers
├── public/                   # Static assets
├── SETUP.md                  # Setup guide
├── DEPLOY.md                 # Deployment guide
└── package.json
```

## How It Works

1. **Login** - Click "Login with eBay" to authenticate
2. **Sync** - Dashboard fetches your eBay transactions
3. **Filter** - Automatically filters to sports & Pokemon cards only
4. **Analyze** - View profits, losses, and trends
5. **Improve** - Use insights to make better buying/selling decisions

## API Reference

### `/api/auth/callback/ebay`
Handles eBay OAuth callback. Called after user logs in.

### `/api/transactions/sync`
Fetches transactions from eBay and stores in database.

**Request:**
```json
{
  "accessToken": "ebay_token",
  "userId": "user_123"
}
```

### `/api/transactions/stats`
Returns dashboard statistics and charts data.

**Query:** `?userId=user_123`

## Environment Variables

Required variables in `.env.local`:

```env
# eBay
EBAY_CLIENT_ID=xxx
EBAY_CLIENT_SECRET=xxx
EBAY_REDIRECT_URI=http://localhost:3000/api/auth/callback/ebay

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Auth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
```

See [.env.example](./.env.example) for all options.

## Deployment

### Deploy to Vercel (Recommended)

See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions.

Quick deploy:
```bash
npm install -g vercel
vercel --prod
```

### Deploy Anywhere

Since it's a standard Next.js app, deploy to:
- ⭐ Vercel (recommended)
- AWS Amplify
- Netlify
- Docker container
- Your own server

## Performance

- ⚡ **Fast** - Next.js optimizations
- 📊 **Scalable** - Supabase handles growth
- 💰 **Cheap** - Free tier covers most use cases
- 🔒 **Secure** - OAuth + encrypted tokens

## Roadmap

- [ ] Advanced filtering (date range, min/max price)
- [ ] Transaction export (CSV/PDF)
- [ ] Multi-user support
- [ ] Mobile app (React Native)
- [ ] Inventory tracking
- [ ] Price prediction with ML
- [ ] Discord notifications
- [ ] API for integrations

## Troubleshooting

**Having issues?**

1. Check [SETUP.md](./SETUP.md#troubleshooting)
2. Check [DEPLOY.md](./DEPLOY.md#troubleshooting)
3. Review browser console (F12)
4. Check Supabase dashboard for data

## Contributing

Found a bug? Want a feature?

1. Create an issue
2. Fork and make changes
3. Submit a pull request

## License

MIT - Feel free to use for anything!

## Support

Questions? Issues? Reach out!

---

**Made with ❤️ for card collectors** 🎴

Happy tracking! Track your cards, understand your business, become a pro seller! 📈
