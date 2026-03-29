-- Fix edge_news_cache RLS to allow anon key writes
-- The cache table stores non-sensitive news data; allowing public writes is safe
-- Run this in Supabase SQL Editor: https://phcnyxuypsibyacxytrl.supabase.co

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Allow service writes" ON edge_news_cache;
DROP POLICY IF EXISTS "Allow public reads" ON edge_news_cache;

-- Allow all operations from any role (cache is public non-sensitive data)
CREATE POLICY "Allow public reads" ON edge_news_cache
  FOR SELECT USING (true);

CREATE POLICY "Allow public writes" ON edge_news_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public deletes" ON edge_news_cache
  FOR DELETE USING (true);

-- Alternatively, disable RLS entirely for this table (simpler):
-- ALTER TABLE edge_news_cache DISABLE ROW LEVEL SECURITY;
