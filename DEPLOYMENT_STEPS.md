# Deployment Steps — Duplicate Transactions Fix

**Commit:** a28a1b7
**Status:** Ready to deploy

## What Changed

1. ✅ Added `ebay_order_id` column to track eBay orders uniquely
2. ✅ Added UNIQUE constraint on `(user_id, ebay_order_id)` to prevent duplicates
3. ✅ Updated sync endpoint to use `order.orderId` from eBay API
4. ✅ Improved error handling in manual buy form endpoint

## Steps to Deploy

### Step 1: Run Schema Update in Supabase (FIRST)

**⚠️ Do this BEFORE redeploying the app**

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Create New Query**
4. **Copy + Paste this:**

```sql
-- FIX FOR DUPLICATE TRANSACTIONS
-- Add ebay_order_id column
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS ebay_order_id VARCHAR(50);

-- Add UNIQUE constraint on (user_id, ebay_order_id)
ALTER TABLE transactions ADD CONSTRAINT unique_user_order UNIQUE (user_id, ebay_order_id);

-- Clear duplicate manual entries for gabriel_ebay_account
DELETE FROM transactions WHERE user_id = 'gabriel_ebay_account' AND ebay_order_id IS NULL;

-- Verify the schema is correct
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
```

5. **Click Run**
6. **You should see "Success"**

### Step 2: Deploy App

**Run this after Supabase schema is updated:**

```bash
cd /tmp/ebay-card-dashboard
vercel deploy --prod --yes
```

**What happens:**
- Fresh build (code commit a28a1b7)
- App will now store `ebay_order_id` for eBay syncs
- Manual buys/sells will have `ebay_order_id = NULL` (expected)
- Re-syncing eBay orders won't create duplicates

### Step 3: Test

1. **Log a Buy:**
   - Click "Log a Buy" in dashboard
   - Fill form
   - Click "Add Buy"
   - Check browser console for errors
   - Should appear in Recent Transactions within seconds

2. **Sync eBay Orders:**
   - Connect eBay OAuth
   - Sync should pull eBay orders
   - Re-syncing should NOT create duplicates

## Debugging

If "Log a Buy" still doesn't save:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Try logging a buy again**
4. **Look for error messages** — should show the actual API error
5. **Check Network tab** — see response from `/api/transactions/create`

Common errors:
- **"Missing required fields"** — form not sending all data
- **"Failed to create transaction"** — database error (check Supabase)
- **Type mismatch** — column type doesn't match (shouldn't happen after schema update)

## Rollback (If Needed)

If something breaks:

```sql
-- Revert: Remove the constraint and column
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS unique_user_order;
ALTER TABLE transactions DROP COLUMN IF EXISTS ebay_order_id;

-- Restore deleted transactions (if you want)
-- (No automatic restore available - they're permanently deleted)
```

Then redeploy without the code changes.

---

**Next:** Run Step 1, then Step 2 above.
