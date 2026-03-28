import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CACHE_TTL_MINUTES = 15;

interface PerplexityResult {
  title: string;
  url: string;
  snippet: string;
  published_date?: string;
}

interface NewsItem {
  headline: string;
  source_url: string;
  time_ago: string;
  impact: 'BULLISH' | 'BEARISH' | 'WATCH';
  category: 'SPORTS' | 'POKEMON';
  summary: string;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || key === 'your_supabase_service_role_key_here') {
    return null;
  }
  return createClient(url, key);
}

async function getCachedNews(): Promise<NewsItem[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('edge_news_cache')
      .select('*')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const fetchedAt = new Date(data.fetched_at);
    const now = new Date();
    const ageMinutes = (now.getTime() - fetchedAt.getTime()) / 1000 / 60;

    if (ageMinutes < CACHE_TTL_MINUTES) {
      return data.news_items as NewsItem[];
    }
    return null;
  } catch {
    return null;
  }
}

async function cacheNews(items: NewsItem[]): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    await supabase.from('edge_news_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('edge_news_cache').insert({
      news_items: items,
      fetched_at: new Date().toISOString(),
    });
  } catch {
    // Cache write failure is non-fatal
  }
}

/**
 * Query Perplexity with recency_filter: "day" to get truly fresh results.
 * Returns the raw text content from the response.
 */
async function queryPerplexity(query: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a real-time news aggregator. Return ONLY factual breaking news from the last 24 hours. Do NOT fabricate or hallucinate stories. If there are no relevant stories from today, say so clearly.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      search_recency_filter: 'day',
      return_citations: true,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/**
 * Use Claude to classify and structure the raw Perplexity results into NewsItems.
 */
async function classifyWithClaude(rawResults: string, anthropicKey: string): Promise<NewsItem[]> {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `Today is ${today}. Below are real breaking news results (last 24 hours only) from live web search about trading cards, sports, and Pokemon.

IMPORTANT: Only include stories that are genuinely from today or the last 24 hours. If a story appears to be older or has no clear date, SKIP IT.

For each real story, classify as:
- BULLISH: Will likely INCREASE card values (injury to a star → rookie cards spike; championship win; limited reprint; new record)
- BEARISH: Will likely DECREASE card values (retirement + market saturation; card reprint increasing supply; scandal)
- WATCH: Monitor but unclear impact

Raw search results:
${rawResults}

Return a JSON array of up to 8 news items. Each item must be REAL (from the search results above), not fabricated:
[
  {
    "headline": "Punchy trader-focused headline max 80 chars",
    "source_url": "https://actual-url-from-results.com",
    "time_ago": "X hours ago",
    "impact": "BULLISH",
    "category": "SPORTS",
    "summary": "1-2 sentences on why this matters to card collectors/investors"
  }
]

If there are fewer than 8 real stories, return only what's real. Return ONLY the JSON array.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error ${response.status}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? '';

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  const parsed = JSON.parse(jsonMatch[0]) as NewsItem[];
  if (!Array.isArray(parsed)) return [];

  return parsed.slice(0, 8).map((item) => ({
    headline: String(item.headline || '').slice(0, 80),
    source_url: String(item.source_url || '#'),
    time_ago: String(item.time_ago || 'Today'),
    impact: (['BULLISH', 'BEARISH', 'WATCH'].includes(item.impact) ? item.impact : 'WATCH') as NewsItem['impact'],
    category: (['SPORTS', 'POKEMON'].includes(item.category) ? item.category : 'SPORTS') as NewsItem['category'],
    summary: String(item.summary || '').slice(0, 200),
  }));
}

async function fetchLiveNews(): Promise<NewsItem[]> {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!perplexityKey) {
    console.warn('PERPLEXITY_API_KEY not set — returning empty news');
    return [];
  }

  // Run 3 targeted breaking-news queries in parallel
  const queries = [
    'Breaking sports news today: NBA NFL MLB player injury trade retirement announcement last 24 hours',
    'Pokemon card news today: new set announcement reprint ban tournament results last 24 hours',
    'PSA grading BGS CGC sports card news today: turnaround time population report announcement last 24 hours',
  ];

  const results = await Promise.allSettled(
    queries.map((q) => queryPerplexity(q, perplexityKey))
  );

  const combined = results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map((r) => r.value)
    .join('\n\n---\n\n');

  if (!combined.trim()) {
    return [];
  }

  // Use Claude to classify if available, otherwise do basic parsing
  if (anthropicKey && anthropicKey !== 'your_anthropic_api_key_here') {
    try {
      return await classifyWithClaude(combined, anthropicKey);
    } catch (err) {
      console.error('Claude classification failed:', err);
    }
  }

  // Fallback: return raw results as a single WATCH item
  return [
    {
      headline: '📰 Breaking news available — Claude key needed to classify',
      source_url: '#',
      time_ago: 'Just now',
      impact: 'WATCH',
      category: 'SPORTS',
      summary: 'Set ANTHROPIC_API_KEY to enable AI-powered news classification.',
    },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    // Try cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await getCachedNews();
      if (cached) {
        return NextResponse.json({
          news: cached,
          cached: true,
          next_refresh: CACHE_TTL_MINUTES + ' minutes',
        });
      }
    }

    const news = await fetchLiveNews();

    // Only cache if we got real results
    if (news.length > 0) {
      await cacheNews(news);
    }

    return NextResponse.json({
      news,
      cached: false,
      fetched_at: new Date().toISOString(),
      next_refresh: CACHE_TTL_MINUTES + ' minutes',
    });
  } catch (error) {
    console.error('Edge news error:', error);
    return NextResponse.json(
      {
        news: [],
        cached: false,
        error: 'Failed to fetch live news. Check PERPLEXITY_API_KEY.',
      },
      { status: 500 }
    );
  }
}
