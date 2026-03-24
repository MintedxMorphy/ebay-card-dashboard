# Diagnosing Missing eBay Sells

**Issue:** 9 eBay card sales exist, but only 8 showing on dashboard

## What Happened

When we ran the schema fix, we executed:
```sql
DELETE FROM transactions WHERE user_id = 'gabriel_ebay_account' AND ebay_order_id IS NULL;
```

This deleted all **manual** entries (Log a Buy/Sell) for Gabriel's account, but should NOT have deleted eBay synced orders (which have ebay_order_id set).

**Possible causes:**
1. One eBay order has `ebay_order_id = NULL` (missing from sync code originally)
2. One eBay order wasn't captured correctly during sync
3. Duplicate constraint issue during insert (one order failed to insert)

## Diagnosis SQL

Run this in Supabase SQL Editor to find the missing order:

```sql
-- Count transactions by type for gabriel
SELECT 
  COUNT(*) as total_count,
  COUNT(CASE WHEN ebay_order_id IS NOT NULL THEN 1 END) as ebay_synced,
  COUNT(CASE WHEN ebay_order_id IS NULL THEN 1 END) as manual_entries
FROM transactions
WHERE user_id = 'gabriel_ebay_account';

-- List all eBay order IDs in database
SELECT ebay_order_id, card_name, card_category, amount, transaction_date
FROM transactions
WHERE user_id = 'gabriel_ebay_account' AND ebay_order_id IS NOT NULL
ORDER BY transaction_date DESC;

-- Check for NULL ebay_order_ids (these shouldn't exist after delete)
SELECT id, ebay_order_id, card_name, amount, transaction_date
FROM transactions
WHERE user_id = 'gabriel_ebay_account' AND ebay_order_id IS NULL;
```

## Recovery Options

### Option A: Manual Sync (Best)
1. Go to dashboard
2. Click "Sync with eBay" again
3. Check server logs for `[SYNC]` messages showing which orders are being processed
4. Missing order should re-appear (or error will show why it's missing)

### Option B: Check Vercel Logs
1. Go to Vercel dashboard → ebay-card-dashboard → Deployments
2. Click latest deployment
3. Click "View Logs"
4. Search for `[SYNC]` to see what was processed
5. Look for any orders that show `Failed to insert`

### Option C: Restore from Backup (If Available)
If you have a Supabase backup from before the schema change:
1. Go to Supabase dashboard → Backups
2. Restore to a point before the ALTER TABLE
3. Re-run the schema changes more carefully (keep eBay orders intact)

## Code Changes (Just Deployed)

✅ **Fixed in commit:** Multiple improvements to prevent this:
1. **Better logging** — Sync now logs each order: `[SYNC] Order 123456: Found 2 card items`
2. **Creationdate tracking** — eBay order dates now stored (not all showing as "today")
3. **Error details** — If insert fails, error message shows why

## Next Steps

1. **Run the Diagnosis SQL above** to see what's in the database
2. **Re-sync with eBay** to try to recover the 9th order
3. **Check Vercel logs** if re-sync fails — they'll show the exact problem
4. **Report findings** — we can fix the sync code if needed

---

**Status:** Investigating. Deploy the code changes first, then run diagnostics.
