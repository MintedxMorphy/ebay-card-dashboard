import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CACHE_TTL_MINUTES = 15;

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache (serverless module-level — survives within same instance)
// Fallback when Supabase cache is unavailable (e.g., missing service role key)
// ─────────────────────────────────────────────────────────────────────────────
let memCache: { data: { sports_stories: NewsItem[]; pokemon_stories: NewsItem[] }; fetchedAt: number } | null = null;

function getMemCache(): { sports_stories: NewsItem[]; pokemon_stories: NewsItem[] } | null {
  if (!memCache) return null;
  const ageMinutes = (Date.now() - memCache.fetchedAt) / 1000 / 60;
  if (ageMinutes < CACHE_TTL_MINUTES) return memCache.data;
  memCache = null;
  return null;
}

function setMemCache(data: { sports_stories: NewsItem[]; pokemon_stories: NewsItem[] }): void {
  const allItems = [...data.sports_stories, ...data.pokemon_stories];
  if (allItems.length > 0) {
    memCache = { data, fetchedAt: Date.now() };
  }
}

interface NewsItem {
  headline: string;
  source_url: string;
  time_ago: string;
  impact: 'BULLISH' | 'BEARISH' | 'WATCH';
  category: 'SPORTS' | 'POKEMON';
  summary: string;
  published_date?: string; // ISO string, used internally for filtering (legacy)
  event_date?: string;     // When the actual NEWS EVENT happened (YYYY-MM-DD)
  article_date?: string;   // When the article/story was published (YYYY-MM-DD)
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

async function getCachedNews(): Promise<{ sports_stories: NewsItem[]; pokemon_stories: NewsItem[] } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('edge_news_cache')
      .select('id, news_items, fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const fetchedAt = new Date(data.fetched_at);
    const now = new Date();
    const ageMinutes = (now.getTime() - fetchedAt.getTime()) / 1000 / 60;

    if (ageMinutes < CACHE_TTL_MINUTES) {
      const items = (data.news_items || []) as NewsItem[];
      if (items.length === 0) return null; // Don't serve empty cache
      return {
        sports_stories: items.filter((n) => n.category === 'SPORTS'),
        pokemon_stories: items.filter((n) => n.category === 'POKEMON'),
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function cacheNews(result: { sports_stories: NewsItem[]; pokemon_stories: NewsItem[] }): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const allItems = [...result.sports_stories, ...result.pokemon_stories];
  if (allItems.length === 0) return; // Never cache empty results

  try {
    await supabase.from('edge_news_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('edge_news_cache').insert({
      news_items: allItems,
      fetched_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('[EdgeNews][Cache] Write failed:', error.message);
    } else {
      console.log(`[EdgeNews][Cache] Wrote ${allItems.length} items to cache`);
    }
  } catch (err) {
    console.warn('[EdgeNews][Cache] Write exception:', err);
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
            'You are a real-time breaking news aggregator. Return ONLY factual breaking news where the actual EVENT happened in the last 24 hours. ' +
            'For each story include BOTH the event date (when the event actually occurred, YYYY-MM-DD) AND the article date (when published). ' +
            'Do NOT fabricate or hallucinate stories. Do NOT include stories where the underlying event is older than 24 hours, even if a new article was written about an old event today.',
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
  anthropicKey: string,
  targetCategory?: 'SPORTS' | 'POKEMON'
): Promise<NewsItem[]> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const cutoffISO = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const citationList =
    citations.length > 0
      ? `\n\nAVAILABLE SOURCE URLs (use these for source_url):\n${citations.map((url, i) => `[${i + 1}] ${url}`).join('\n')}`
      : '';

  const categoryInstruction = targetCategory
    ? `All stories must have category: "${targetCategory}". Return at least 5 stories if the content supports it.`
    : 'Categorize each as SPORTS or POKEMON. Return at least 5 sports stories and 5 Pokemon stories if content supports it.';

  const prompt = `Today is ${today} (UTC cutoff: ${cutoffISO}).

Below are real breaking news results from a live web search about trading cards, sports, and Pokemon.

For each story you MUST extract TWO separate dates:
1. "event_date": When did the actual EVENT happen? (e.g., when the player retired, when the set was announced, when the trade happened). This is what the news is ABOUT.
2. "article_date": When was this article/story PUBLISHED? (may be today even if the event happened weeks ago).

FILTERING RULE: Prefer stories where the event is recent (within 24h). Use today's date (${today}) as event_date if the article is clearly about something happening now/today and you cannot extract a specific event date.
- If the actual EVENT clearly happened weeks or months ago, REJECT the story.
- Example: Chris Paul retirement was announced February 2026 → event_date = Feb 2026 → REJECT.
- Example: LeBron James injury happened today → event_date = today → ACCEPT.
- If you cannot determine a specific event_date but the article appears recent, use "${today}" as event_date.

${categoryInstruction}

For each valid story, classify as:
- BULLISH: Will likely INCREASE card values
- BEARISH: Will likely DECREASE card values  
- WATCH: Monitor but unclear impact

Raw search results:
${rawResults}${citationList}

Return a JSON array of up to 10 news items that pass the filter:
[
  {
    "headline": "Punchy trader-focused headline max 80 chars",
    "source_url": "https://real-url-from-citations-list.com",
    "time_ago": "X hours ago",
    "impact": "BULLISH",
    "category": "SPORTS",
    "summary": "1-2 sentences on why this matters to card collectors/investors",
    "event_date": "YYYY-MM-DD",
    "article_date": "YYYY-MM-DD"
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
    // Primary: use event_date (when the actual news happened)
    // Fallback: try to extract from text, then article_date as last resort
    const eventDateStr =
      item.event_date ??
      extractDateFromText(item.headline + ' ' + item.summary) ??
      item.article_date ??
      item.published_date;

    if (!eventDateStr) {
      // No date found — default to accepting with article_date = today
      console.log(`[EdgeNews][Filter] ACCEPTED (no event_date, assuming recent): "${item.headline}"`);
      const todayISO = new Date().toISOString().split('T')[0];
      filtered.push({
        headline: String(item.headline || '').slice(0, 80),
        source_url: String(item.source_url || '#'),
        time_ago: 'Today',
        impact: (['BULLISH', 'BEARISH', 'WATCH'].includes(item.impact) ? item.impact : 'WATCH') as NewsItem['impact'],
        category: (['SPORTS', 'POKEMON'].includes(item.category) ? item.category : 'SPORTS') as NewsItem['category'],
        summary: String(item.summary || '').slice(0, 200),
        event_date: todayISO,
        article_date: todayISO,
        published_date: todayISO,
      });
      continue;
    }

    const eventDate = new Date(eventDateStr);
    if (isNaN(eventDate.getTime()) || eventDate < cutoffDate) {
      console.log(
        `[EdgeNews][Filter] REJECTED (event too old: event_date=${eventDateStr}, article_date=${item.article_date ?? 'unknown'}): "${item.headline}"`
      );
      continue;
    }

    // Compute a human-readable time_ago based on event_date (not article_date)
    const eventHoursAgo = Math.floor((Date.now() - eventDate.getTime()) / 1000 / 60 / 60);
    const eventMinsAgo = Math.floor((Date.now() - eventDate.getTime()) / 1000 / 60);
    let timeAgo: string;
    if (eventMinsAgo < 60) {
      timeAgo = eventMinsAgo <= 1 ? 'Just now' : `${eventMinsAgo}m ago`;
    } else if (eventHoursAgo < 24) {
      timeAgo = `${eventHoursAgo}h ago`;
    } else {
      timeAgo = 'Today';
    }

    console.log(
      `[EdgeNews][Filter] ACCEPTED (event_date=${eventDateStr}, article_date=${item.article_date ?? 'unknown'}): "${item.headline}"`
    );
    filtered.push({
      headline: String(item.headline || '').slice(0, 80),
      source_url: String(item.source_url || '#'),
      time_ago: timeAgo,
      impact: (['BULLISH', 'BEARISH', 'WATCH'].includes(item.impact) ? item.impact : 'WATCH') as NewsItem['impact'],
      category: (['SPORTS', 'POKEMON'].includes(item.category) ? item.category : 'SPORTS') as NewsItem['category'],
      summary: String(item.summary || '').slice(0, 200),
      event_date: eventDateStr,
      article_date: String(item.article_date || eventDateStr),
      published_date: eventDateStr, // keep for legacy compat
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

interface FetchedNewsResult {
  sports_stories: NewsItem[];
  pokemon_stories: NewsItem[];
}

async function fetchLiveNews(): Promise<FetchedNewsResult> {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!perplexityKey) {
    console.warn('[EdgeNews] PERPLEXITY_API_KEY not set — returning empty news');
    return { sports_stories: [], pokemon_stories: [] };
  }

  const now = new Date();
  console.log(`[EdgeNews] Fetching live news at ${now.toISOString()}`);
  console.log(`[EdgeNews] 24h cutoff: ${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()}`);

  const todayStr = now.toISOString().split('T')[0];

  // Run sports and pokemon queries in parallel (2 queries each for more stories)
  const sportsQueries = [
    `Breaking sports news ${todayStr}: NBA NFL MLB player injury trade retirement announcement in the last 24 hours. Give me at least 5 distinct stories.`,
    `Sports card collecting news ${todayStr}: PSA BGS grading breakthrough athlete milestone rookie card news last 24 hours. Give me 5 stories.`,
  ];
  const pokemonQueries = [
    `Pokemon card news today ${todayStr}: new set announcement reprint ban tournament results breaking last 24 hours. Give 5 stories.`,
    `Pokemon TCG competitive news ${todayStr}: tournament winners banned cards new promo announcements last 24 hours. Give 5 stories.`,
  ];

  const [sportsResults, pokemonResults] = await Promise.all([
    Promise.allSettled(sportsQueries.map((q) => queryPerplexity(q, perplexityKey))),
    Promise.allSettled(pokemonQueries.map((q) => queryPerplexity(q, perplexityKey))),
  ]);

  const sportsFulfilled = sportsResults.filter(
    (r): r is PromiseFulfilledResult<PerplexityResponse> => r.status === 'fulfilled'
  );
  const pokemonFulfilled = pokemonResults.filter(
    (r): r is PromiseFulfilledResult<PerplexityResponse> => r.status === 'fulfilled'
  );

  const sportsCombined = sportsFulfilled.map((r) => r.value.content).join('\n\n---\n\n');
  const pokemonCombined = pokemonFulfilled.map((r) => r.value.content).join('\n\n---\n\n');
  const sportsCitations = [...new Set(sportsFulfilled.flatMap((r) => r.value.citations))];
  const pokemonCitations = [...new Set(pokemonFulfilled.flatMap((r) => r.value.citations))];

  if (!anthropicKey || anthropicKey === 'your_anthropic_api_key_here') {
    return {
      sports_stories: [{
        headline: '📰 Breaking news available — Claude key needed to classify',
        source_url: '#',
        time_ago: 'Just now',
        impact: 'WATCH',
        category: 'SPORTS',
        summary: 'Set ANTHROPIC_API_KEY to enable AI-powered news classification.',
      }],
      pokemon_stories: [],
    };
  }

  const [sportsStories, pokemonStories] = await Promise.all([
    sportsCombined.trim()
      ? classifyWithClaude(sportsCombined, sportsCitations, anthropicKey, 'SPORTS').catch((err) => {
          console.error('[EdgeNews] Sports Claude classification failed:', err);
          return [] as NewsItem[];
        })
      : Promise.resolve([] as NewsItem[]),
    pokemonCombined.trim()
      ? classifyWithClaude(pokemonCombined, pokemonCitations, anthropicKey, 'POKEMON').catch((err) => {
          console.error('[EdgeNews] Pokemon Claude classification failed:', err);
          return [] as NewsItem[];
        })
      : Promise.resolve([] as NewsItem[]),
  ]);

  console.log(`[EdgeNews] Final: ${sportsStories.length} sports, ${pokemonStories.length} pokemon stories`);

  return {
    sports_stories: sportsStories,
    pokemon_stories: pokemonStories,
  };
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
      // Check Supabase cache first, then in-memory fallback
      const cached = await getCachedNews() ?? getMemCache();
      if (cached) {
        const allNews = [...cached.sports_stories, ...cached.pokemon_stories];
        return NextResponse.json({
          news: allNews,
          sports_stories: cached.sports_stories,
          pokemon_stories: cached.pokemon_stories,
          cached: true,
          next_refresh: CACHE_TTL_MINUTES + ' minutes',
          count: allNews.length,
        });
      }
    }

    const result = await fetchLiveNews();
    const allNews = [...result.sports_stories, ...result.pokemon_stories];

    // Cache results (Supabase + in-memory fallback)
    if (allNews.length > 0) {
      setMemCache(result); // Always set in-memory cache
      await cacheNews(result); // Best-effort Supabase cache
    }

    const responsePayload: Record<string, unknown> = {
      news: allNews,
      sports_stories: result.sports_stories,
      pokemon_stories: result.pokemon_stories,
      cached: false,
      fetched_at: new Date().toISOString(),
      next_refresh: CACHE_TTL_MINUTES + ' minutes',
      count: allNews.length,
    };

    if (debug) {
      responsePayload.date_debug = allNews.map((n) => ({
        headline: n.headline,
        event_date: n.event_date ?? 'unknown',
        article_date: n.article_date ?? 'unknown',
        published_date: n.published_date ?? 'unknown',
      }));
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('[EdgeNews] Route error:', error);
    return NextResponse.json(
      {
        news: [],
        sports_stories: [],
        pokemon_stories: [],
        cached: false,
        error: 'Failed to fetch live news. Check PERPLEXITY_API_KEY.',
      },
      { status: 500 }
    );
  }
}
