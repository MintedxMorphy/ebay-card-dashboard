-- FIX FOR DUPLICATE TRANSACTIONS
-- Run this in Supabase SQL Editor BEFORE deploying code changes

-- 1. Add ebay_order_id column (if it doesn't exist)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS ebay_order_id VARCHAR(50);

-- 2. Add UNIQUE constraint on (user_id, ebay_order_id)
-- This prevents the same eBay order from being inserted twice
ALTER TABLE transactions ADD CONSTRAINT unique_user_order UNIQUE (user_id, ebay_order_id);

-- 3. Clear duplicate manual entries for gabriel_ebay_account
-- (Keep only the ones from eBay syncs which will have ebay_order_id)
DELETE FROM transactions WHERE user_id = 'gabriel_ebay_account' AND ebay_order_id IS NULL;

-- Verify the schema is correct
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
