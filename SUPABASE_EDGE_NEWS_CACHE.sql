-- Edge News Cache Table
-- Run this in Supabase SQL Editor to create the cache table

CREATE TABLE IF NOT EXISTS edge_news_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_items JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast ordering
CREATE INDEX IF NOT EXISTS idx_edge_news_cache_fetched_at ON edge_news_cache (fetched_at DESC);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE edge_news_cache ENABLE ROW LEVEL SECURITY;

-- Allow all reads (news is public)
CREATE POLICY "Allow public reads" ON edge_news_cache
  FOR SELECT USING (true);

-- Allow service role to write
CREATE POLICY "Allow service writes" ON edge_news_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Comment
COMMENT ON TABLE edge_news_cache IS 'Cache for Edge News AI-powered market intelligence. Refreshed every 15 minutes.';
