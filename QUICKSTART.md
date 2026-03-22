# 🚀 Quick Start - 5 Minutes to Dashboard

Get CardTrack running locally in under 5 minutes.

## 1. Prerequisites (2 min)

You need:
- Node.js 18+ ([download](https://nodejs.org/))
- An eBay Developer account ([get one free](https://developer.ebay.com/))
- A Supabase account ([free](https://supabase.com/))

## 2. Clone & Install (1 min)

```bash
cd ebay-card-dashboard
npm install
```

## 3. Get Your Credentials (1 min)

### eBay
1. Go to [eBay Developer Portal](https://developer.ebay.com/)
2. Create an app (or use existing)
3. Copy:
   - **Client ID** (App ID)
   - **Client Secret**

### Supabase
1. Create a project at [supabase.com](https://supabase.com/)
2. Go to Project Settings → API
3. Copy:
   - **Project URL**
   - **anon key**
   - **service_role key**

## 4. Configure Environment (1 min)

Copy the template:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials:
```env
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_secret
EBAY_REDIRECT_URI=http://localhost:3000/api/auth/callback/ebay

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
```

**Generate a secret:**
```bash
openssl rand -base64 32
```

## 5. Set Up Database (1 min)

In Supabase dashboard, go to **SQL Editor** and run:

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

## 6. Run It! 

```bash
npm run dev
```

Visit: **http://localhost:3000** 🎉

## What's Next?

1. **Click "Login with eBay"** on the home page
2. **Complete OAuth** - You'll be redirected to eBay login
3. **See Dashboard** - Click "Sync Transactions" to fetch your sales
4. **View Charts** - P&L, category breakdown, and totals will appear

## Troubleshooting

### "Invalid eBay credentials"
- Double-check Client ID and Secret
- Make sure redirect URI matches exactly

### "Database connection error"
- Verify Supabase URL and keys
- Check that you ran the SQL schema
- Ensure your connection is online

### "No transactions showing"
- Make sure you have sales on eBay with "sports" or "pokemon" in title
- Click "Sync Transactions" again
- Check browser console (F12) for errors

## Next: Deploy to Production

Ready to go live? See [DEPLOY.md](./DEPLOY.md)

```bash
# One-line deploy to Vercel
vercel --prod
```

---

**Done! Enjoy tracking your card profits!** 📊
