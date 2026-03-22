# CardTrack - Setup Instructions

A modern dashboard for tracking eBay sports & Pokemon card sales P&L.

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript
- **Backend:** Next.js API routes
- **Database:** Supabase (PostgreSQL)
- **Charts:** Recharts
- **Styling:** Tailwind CSS

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- eBay Developer account with API credentials

## 1. Get eBay API Credentials

1. Visit [eBay Developer Portal](https://developer.ebay.com/)
2. Create an application to get:
   - **Client ID** (App ID)
   - **Client Secret**
3. Set your redirect URI to: `http://localhost:3000/api/auth/callback/ebay`
   - For production: `https://yourdomain.com/api/auth/callback/ebay`

## 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Copy your project URL and anon key from Project Settings > API

### Create Database Schema

Run this SQL in Supabase's SQL Editor:

```sql
CREATE TABLE transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id VARCHAR(255) NOT NULL,
  ebay_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('buy', 'sell')),
  card_type VARCHAR(50) NOT NULL CHECK (card_type IN ('sports', 'pokemon')),
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_id ON transactions(user_id);
CREATE INDEX idx_card_type ON transactions(card_type);
CREATE INDEX idx_type ON transactions(type);
```

## 3. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```
EBAY_CLIENT_ID=your_ebay_client_id
EBAY_CLIENT_SECRET=your_ebay_client_secret
EBAY_REDIRECT_URI=http://localhost:3000/api/auth/callback/ebay

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXTAUTH_SECRET=generate_a_random_secret
NEXTAUTH_URL=http://localhost:3000
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

## 4. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and click "Login with eBay".

## 5. Deploy to Vercel

### Simple Deployment

```bash
npm install -g vercel
vercel
```

### Manual Steps

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables in Project Settings
5. Deploy!

## Features

✅ **eBay OAuth Integration** - Secure login  
✅ **Transaction Sync** - Fetch sales from eBay  
✅ **Card Filtering** - Only Sports & Pokemon cards  
✅ **P&L Charts** - Visualize profit/loss over time  
✅ **Category Breakdown** - Compare Sports vs Pokemon  
✅ **Mobile Responsive** - Works on all devices  
✅ **Clean UI** - Simple and intuitive design  

## API Endpoints

### POST `/api/auth/callback/ebay`
Handles eBay OAuth callback.

### POST `/api/transactions/sync`
Fetches transactions from eBay and stores in Supabase.
```json
{
  "accessToken": "ebay_access_token",
  "userId": "user_id"
}
```

### GET `/api/transactions/stats`
Returns dashboard statistics.
```
?userId=user_id
```

## Troubleshooting

**"eBay API error"**
- Check your Client ID and Secret in `.env.local`
- Verify redirect URI matches exactly

**"Database connection error"**
- Check Supabase credentials
- Ensure schema is created
- Verify anon key has table access

**"No transactions syncing"**
- Check eBay credentials scopes
- Verify items have "sports" or "pokemon" in title
- Check browser console for detailed errors

## Next Steps

- [ ] Add user authentication (NextAuth.js)
- [ ] Store access tokens securely in database
- [ ] Add transaction history table
- [ ] Implement manual transaction entry
- [ ] Add notifications/alerts
- [ ] Support more card categories
- [ ] Analytics dashboard

## Support

For issues or questions:
1. Check `.env.local` configuration
2. Review browser console for errors
3. Check Supabase dashboard for data

---

**Happy card tracking!** 🎴
