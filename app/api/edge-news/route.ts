import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CACHE_TTL_MINUTES = 15;

interface NewsItem {
  headline: string;
  source_url: string;
  time_ago: string;
  impact: 'BULLISH' | 'BEARISH' | 'WATCH';
  category: 'SPORTS' | 'POKEMON';
  summary: string;
  published_date?: string; // ISO string, used internally for filtering
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase helpers
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Date utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if dateStr is within the last `maxHours` hours (default 24). */
function isWithin24Hours(dateStr: string | undefined | null, maxHours = 24): boolean {
  if (!dateStr) return false;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return false;
  const cutoff = new Date(Date.now() - maxHours * 60 * 60 * 1000);
  return parsed >= cutoff;
}

/** Try to extract an ISO date from common snippet patterns like "Mar 27, 2026" or "2026-03-27". */
function extractDateFromText(text: string): string | null {
  // ISO format: 2026-03-27
  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  // Month Day, Year: March 27, 2026 or Mar 27, 2026
  const longMatch = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\b/i
  );
  if (longMatch) {
    const parsed = new Date(`${longMatch[1]} ${longMatch[2]}, ${longMatch[3]}`);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }

  // Day Month Year: 27 March 2026
  const dmyMatch = text.match(
    /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/i
  );
  if (dmyMatch) {
    const parsed = new Date(`${dmyMatch[2]} ${dmyMatch[1]}, ${dmyMatch[3]}`);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Perplexity query
// ─────────────────────────────────────────────────────────────────────────────

interface PerplexityResponse {
  content: string;
  citations: string[];
  raw: unknown; // full response for debug logging
}

async function queryPerplexity(query: string, apiKey: string): Promise<PerplexityResponse> {
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
          content:
            'You are a real-time breaking news aggregator. Return ONLY factual breaking news from TODAY (last 24 hours). ' +
            'For each story include the publication date (YYYY-MM-DD) in your response. ' +
            'Do NOT fabricate or hallucinate stories. Do NOT include stories older than 24 hours.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      search_recency_filter: 'day',
      return_citations: true,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${err}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    citations?: string[];
  };

  const content = data.choices?.[0]?.message?.content ?? '';
  const citations: string[] = Array.isArray(data.citations) ? data.citations : [];

  // Debug: log the full Perplexity response structure
  console.log('[EdgeNews][Perplexity] Query:', query.slice(0, 80));
  console.log('[EdgeNews][Perplexity] Content length:', content.length);
  console.log('[EdgeNews][Perplexity] Citations count:', citations.length);
  if (citations.length > 0) {
    console.log('[EdgeNews][Perplexity] Citations:', citations.slice(0, 5));
  }
  // Log any dates found in the raw content
  const datesInContent = [...content.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g)].map((m) => m[0]);
  const longDates = [...content.matchAll(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/gi)].map((m) => m[0]);
  console.log('[EdgeNews][Perplexity] Dates found in content:', [...datesInContent, ...longDates].slice(0, 10));

  return { content, citations, raw: data };
}

// ─────────────────────────────────────────────────────────────────────────────
// Claude classification
// ─────────────────────────────────────────────────────────────────────────────

async function classifyWithClaude(
  rawResults: string,
  citations: string[],
  anthropicKey: string
): Promise<NewsItem[]> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const cutoffISO = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const citationList =
    citations.length > 0
      ? `\n\nAVAILABLE SOURCE URLs (use these for source_url):\n${citations.map((url, i) => `[${i + 1}] ${url}`).join('\n')}`
      : '';

  const prompt = `Today is ${today} (UTC cutoff: ${cutoffISO}).

Below are real breaking news results from a live web search about trading cards, sports, and Pokemon.

STRICT RULE: Only include stories whose publication date is AFTER ${cutoffISO}.
- If you can identify a publish date and it is OLDER than 24 hours, SKIP that story entirely.
- If you cannot find any date clue for a story, SKIP it (assume it's old).
- Include the detected publication date in the "published_date" field (YYYY-MM-DD).

For each valid story, classify as:
- BULLISH: Will likely INCREASE card values
- BEARISH: Will likely DECREASE card values  
- WATCH: Monitor but unclear impact

Raw search results:
${rawResults}${citationList}

Return a JSON array of up to 8 news items that pass the 24-hour filter:
[
  {
    "headline": "Punchy trader-focused headline max 80 chars",
    "source_url": "https://real-url-from-citations-list.com",
    "time_ago": "X hours ago",
    "impact": "BULLISH",
    "category": "SPORTS",
    "summary": "1-2 sentences on why this matters to card collectors/investors",
    "published_date": "YYYY-MM-DD"
  }
]

Return ONLY the JSON array. No markdown fences.`;

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

  const data = await response.json() as { content?: Array<{ text?: string }> };
  const text: string = data.content?.[0]?.text ?? '';

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.warn('[EdgeNews][Claude] No JSON array found in response');
    return [];
  }

  const parsed = JSON.parse(jsonMatch[0]) as NewsItem[];
  if (!Array.isArray(parsed)) return [];

  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const filtered: NewsItem[] = [];
  for (const item of parsed) {
    const pub = item.published_date ?? extractDateFromText(item.headline + ' ' + item.summary);

    if (!pub) {
      console.log(`[EdgeNews][Filter] REJECTED (no date): "${item.headline}"`);
      continue;
    }

    const pubDate = new Date(pub);
    if (isNaN(pubDate.getTime()) || pubDate < cutoffDate) {
      console.log(
        `[EdgeNews][Filter] REJECTED (too old: ${pub}): "${item.headline}"`
      );
      continue;
    }

    console.log(`[EdgeNews][Filter] ACCEPTED (${pub}): "${item.headline}"`);
    filtered.push({
      headline: String(item.headline || '').slice(0, 80),
      source_url: String(item.source_url || '#'),
      time_ago: String(item.time_ago || 'Today'),
      impact: (['BULLISH', 'BEARISH', 'WATCH'].includes(item.impact) ? item.impact : 'WATCH') as NewsItem['impact'],
      category: (['SPORTS', 'POKEMON'].includes(item.category) ? item.category : 'SPORTS') as NewsItem['category'],
      summary: String(item.summary || '').slice(0, 200),
      published_date: pub,
    });
  }

  console.log(
    `[EdgeNews][Filter] Summary: ${filtered.length} accepted / ${parsed.length - filtered.length} rejected out of ${parsed.length} total`
  );

  return filtered.slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main fetch
// ─────────────────────────────────────────────────────────────────────────────

async function fetchLiveNews(): Promise<NewsItem[]> {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!perplexityKey) {
    console.warn('[EdgeNews] PERPLEXITY_API_KEY not set — returning empty news');
    return [];
  }

  const now = new Date();
  console.log(`[EdgeNews] Fetching live news at ${now.toISOString()}`);
  console.log(`[EdgeNews] 24h cutoff: ${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()}`);

  // Three targeted breaking-news queries with explicit date anchoring
  const todayStr = now.toISOString().split('T')[0]; // e.g. "2026-03-28"
  const queries = [
    `Breaking sports news ${todayStr}: NBA NFL MLB player injury trade retirement announcement in the last 24 hours site:espn.com OR site:nba.com OR site:nfl.com OR site:mlb.com OR site:reuters.com OR site:apnews.com`,
    `Pokemon card news today ${todayStr}: new set announcement reprint ban tournament results breaking last 24 hours`,
    `PSA grading BGS CGC sports card news ${todayStr}: turnaround time population report announcement breaking last 24 hours`,
  ];

  const results = await Promise.allSettled(
    queries.map((q) => queryPerplexity(q, perplexityKey))
  );

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'rejected') {
      console.error(`[EdgeNews] Query ${i} failed:`, r.reason);
    }
  }

  const fulfilledResults = results.filter(
    (r): r is PromiseFulfilledResult<PerplexityResponse> => r.status === 'fulfilled'
  );

  if (fulfilledResults.length === 0) {
    console.error('[EdgeNews] All Perplexity queries failed');
    return [];
  }

  const combined = fulfilledResults.map((r) => r.value.content).join('\n\n---\n\n');
  const allCitations = [...new Set(fulfilledResults.flatMap((r) => r.value.citations))];

  console.log(`[EdgeNews] Combined content length: ${combined.length} chars`);
  console.log(`[EdgeNews] Total unique citations: ${allCitations.length}`);

  if (!combined.trim()) {
    return [];
  }

  if (anthropicKey && anthropicKey !== 'your_anthropic_api_key_here') {
    try {
      return await classifyWithClaude(combined, allCitations, anthropicKey);
    } catch (err) {
      console.error('[EdgeNews] Claude classification failed:', err);
    }
  }

  // Fallback
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

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  const debug = searchParams.get('debug') === 'true';

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

    const responsePayload: Record<string, unknown> = {
      news,
      cached: false,
      fetched_at: new Date().toISOString(),
      next_refresh: CACHE_TTL_MINUTES + ' minutes',
      count: news.length,
    };

    if (debug) {
      responsePayload.published_dates = news.map((n) => ({
        headline: n.headline,
        published_date: n.published_date ?? 'unknown',
      }));
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('[EdgeNews] Route error:', error);
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
