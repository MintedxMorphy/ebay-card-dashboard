-- SUPABASE SCHEMA FIX - Run this in Supabase SQL Editor
-- This fixes the UUID type issues and ensures columns match the sync code

-- 1. Change users.user_id from UUID to text
ALTER TABLE users ALTER COLUMN user_id SET DATA TYPE text USING user_id::text;

-- 2. Change transactions.user_id from UUID to text  
ALTER TABLE transactions ALTER COLUMN user_id SET DATA TYPE text USING user_id::text;

-- 3. Clean up bad data (rows with 550e8400 UUID that can't convert to text properly)
DELETE FROM transactions WHERE user_id ~ '^550e8400';

-- Verify the schema is correct
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name IN ('users', 'transactions') 
ORDER BY table_name, ordinal_position;
