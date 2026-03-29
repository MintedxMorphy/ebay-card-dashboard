CREATE TABLE IF NOT EXISTS edge_news_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_items JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edge_news_cache_fetched_at ON edge_news_cache (fetched_at DESC);

ALTER TABLE edge_news_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public reads" ON edge_news_cache
  FOR SELECT USING (true);

CREATE POLICY "Allow service writes" ON edge_news_cache
  FOR ALL USING (auth.role() = 'service_role');
