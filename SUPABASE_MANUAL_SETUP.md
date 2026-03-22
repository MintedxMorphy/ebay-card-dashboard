# CardTrack - Supabase Manual Setup Guide

Since running scripts can be tricky, here's how to set up your Supabase database manually using the UI.

## Step 1: Create the Transactions Table

1. **Open your Supabase project** → `https://phcnyxuypsibyacxytrl.supabase.co`
2. **Click "SQL Editor"** (left sidebar)
3. **Click "New Query"**
4. **Copy + Paste this SQL:**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  card_category VARCHAR(20) NOT NULL CHECK (card_category IN ('sports', 'pokemon')),
  amount DECIMAL(10, 2) NOT NULL,
  card_name VARCHAR(255),
  card_description TEXT,
  transaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_category ON transactions(card_category);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
```

5. **Click "Run"** (or Cmd+Enter)
6. **You should see:** "Success. 4 rows affected"

## Step 2: Create Views (Optional but Helpful)

1. **Click "New Query"** again
2. **Copy + Paste this SQL:**

```sql
-- View for P&L summary
CREATE VIEW transaction_summary AS
SELECT 
  user_id,
  card_category,
  SUM(CASE WHEN transaction_type = 'buy' THEN amount ELSE 0 END) as total_spent,
  SUM(CASE WHEN transaction_type = 'sell' THEN amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN transaction_type = 'sell' THEN amount ELSE -amount END) as net_profit
FROM transactions
GROUP BY user_id, card_category;

-- Monthly P&L view
CREATE VIEW monthly_pnl AS
SELECT 
  user_id,
  DATE_TRUNC('month', transaction_date) as month,
  SUM(CASE WHEN transaction_type = 'sell' THEN amount ELSE -amount END) as monthly_profit
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;
```

3. **Click "Run"**
4. **Success!**

## Step 3: Insert Demo Transaction Data

1. **Click "New Query"** again
2. **Copy + Paste this SQL:**

```sql
INSERT INTO transactions (user_id, transaction_type, card_category, amount, card_name, card_description, transaction_date)
VALUES
  -- Sports Cards - Buy
  ('demo-user-001', 'buy', 'sports', 45.00, 'Tom Brady PSA 8', 'Classic 1995 rookie', NOW() - INTERVAL '25 days'),
  ('demo-user-001', 'buy', 'sports', 32.50, 'Michael Jordan 1986', 'Fleer #57', NOW() - INTERVAL '20 days'),
  ('demo-user-001', 'buy', 'sports', 78.00, 'LeBron James Auto', 'Signed rookie', NOW() - INTERVAL '15 days'),
  
  -- Sports Cards - Sell
  ('demo-user-001', 'sell', 'sports', 85.00, 'Tom Brady PSA 8', 'Sold at profit', NOW() - INTERVAL '10 days'),
  ('demo-user-001', 'sell', 'sports', 55.00, 'Patrick Mahomes RC', 'High demand', NOW() - INTERVAL '5 days'),
  
  -- Pokemon Cards - Buy
  ('demo-user-001', 'buy', 'pokemon', 25.00, 'Charizard Base Set', 'Holo rare', NOW() - INTERVAL '28 days'),
  ('demo-user-001', 'buy', 'pokemon', 15.50, 'Blastoise Base Set', 'Light play condition', NOW() - INTERVAL '22 days'),
  ('demo-user-001', 'buy', 'pokemon', 120.00, 'Pikachu Shadowless', 'First edition', NOW() - INTERVAL '18 days'),
  ('demo-user-001', 'buy', 'pokemon', 35.00, 'Mewtwo EX', 'Modern set', NOW() - INTERVAL '12 days'),
  
  -- Pokemon Cards - Sell
  ('demo-user-001', 'sell', 'pokemon', 40.00, 'Charizard Base Set', 'Sold', NOW() - INTERVAL '8 days'),
  ('demo-user-001', 'sell', 'pokemon', 180.00, 'Pikachu Shadowless', 'Premium sell', NOW() - INTERVAL '3 days'),
  ('demo-user-001', 'sell', 'pokemon', 55.00, 'Mewtwo EX', 'Good profit', NOW() - INTERVAL '1 day');
```

3. **Click "Run"**
4. **You should see:** "Success. 12 rows affected"

## Step 4: Verify Your Data

1. **Left sidebar** → Click **"Table Editor"**
2. **Click "transactions"** table
3. **You should see all 12 demo transactions**

## Step 5: Enable RLS (Optional but Recommended)

1. **Left sidebar** → **"Authentication"** → **"Policies"**
2. **Click "Enable RLS on transactions table"**
3. **Add policy:**
   - Name: `Users can see their own data`
   - USING: `auth.uid() = user_id`
   - WITH CHECK: `auth.uid() = user_id`

## ✅ Done!

Your Supabase database is now set up with:
- ✅ Transactions table
- ✅ Demo data (12 transactions)
- ✅ Indexes for fast queries
- ✅ Views for P&L calculations

**Next:** Update `.env` with your credentials and run the dashboard locally!

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## When eBay API Keys Arrive

Once you get your eBay API credentials:

1. **Update `.env`:**
   ```
   NEXT_PUBLIC_EBAY_CLIENT_ID=your_key_here
   EBAY_CLIENT_SECRET=your_secret_here
   ```

2. **Restart the dev server**
3. **Login with eBay OAuth**
4. **Real transactions will sync automatically!**

---

Need help? Check the main README.md
