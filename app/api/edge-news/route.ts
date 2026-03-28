import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const CACHE_TTL_MINUTES = 15;

interface NewsItem {
  headline: string;
  source_url: string;
  time_ago: string;
  impact: 'BULLISH' | 'BEARISH' | 'WATCH';
  category: 'SPORTS' | 'POKEMON';
  summary: string;
}

interface CachedNews {
  id?: string;
  news_items: NewsItem[];
  fetched_at: string;
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
    // Delete old entries and insert new
    await supabase.from('edge_news_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('edge_news_cache').insert({
      news_items: items,
      fetched_at: new Date().toISOString(),
    });
  } catch {
    // Cache write failure is non-fatal
  }
}

async function fetchNewsWithClaude(): Promise<NewsItem[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    // Return demo data when no API key
    return getDemoNews();
  }

  const client = new Anthropic({ apiKey });

  const prompt = `You are a sports card and trading card market intelligence analyst. Search for the LATEST breaking news (last 24-48 hours) relevant to trading card collectors and investors.

Search for news about:
1. SPORTS CARDS: NBA/NFL/MLB/NHL player injuries, trades, retirements, championships, record-breaking performances, Hall of Fame announcements, rookie breakouts
2. POKEMON CARDS: New Pokemon game announcements, set releases, card reprints, tournament results, banned cards, promo announcements, Pokemon Go events
3. GRADING: PSA/BGS/CGC grading news, turnaround time changes, authentication issues, population report milestones

For each story, analyze:
- BULLISH: This will likely INCREASE card values (injury to star → their rookie cards spike; championship win → player cards spike; limited reprint → demand up)
- BEARISH: This will likely DECREASE card values (retirement → market saturation; scandal; reprint → supply up)
- WATCH: Monitor but unclear impact yet

Return EXACTLY 8 news items as a JSON array with this structure:
[
  {
    "headline": "Brief compelling headline (max 80 chars)",
    "source_url": "https://actual-news-url.com/article",
    "time_ago": "2 hours ago",
    "impact": "BULLISH",
    "category": "SPORTS",
    "summary": "1-2 sentence explanation of why this matters to card collectors"
  }
]

Only return the JSON array, nothing else. Make headlines punchy and trader-focused.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    return getDemoNews();
  }

  try {
    // Extract JSON from response
    const text = content.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return getDemoNews();
    
    const parsed = JSON.parse(jsonMatch[0]) as NewsItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return getDemoNews();
    
    // Validate and clean items
    return parsed.slice(0, 8).map((item) => ({
      headline: String(item.headline || '').slice(0, 80),
      source_url: String(item.source_url || '#'),
      time_ago: String(item.time_ago || 'Recently'),
      impact: (['BULLISH', 'BEARISH', 'WATCH'].includes(item.impact) ? item.impact : 'WATCH') as NewsItem['impact'],
      category: (['SPORTS', 'POKEMON'].includes(item.category) ? item.category : 'SPORTS') as NewsItem['category'],
      summary: String(item.summary || '').slice(0, 200),
    }));
  } catch {
    return getDemoNews();
  }
}

function getDemoNews(): NewsItem[] {
  return [
    {
      headline: '🏀 LeBron James Injury Update: Right Ankle',
      source_url: 'https://www.espn.com',
      time_ago: '1 hour ago',
      impact: 'BULLISH',
      category: 'SPORTS',
      summary: 'LeBron\'s injury absence typically spikes demand for his rookie PSA 10 cards as collectors buy the dip.',
    },
    {
      headline: '⚡ Scarlet & Violet Set 7 Full Card List Leaked',
      source_url: 'https://www.serebii.net',
      time_ago: '3 hours ago',
      impact: 'WATCH',
      category: 'POKEMON',
      summary: 'New set reveals could shake up sealed market — watch for pre-order pricing on boxes.',
    },
    {
      headline: '🏈 Patrick Mahomes Wins 4th Super Bowl MVP',
      source_url: 'https://www.nfl.com',
      time_ago: '6 hours ago',
      impact: 'BULLISH',
      category: 'SPORTS',
      summary: 'Championship wins drive massive spikes in rookie card values. Mahomes PSA 10s up 40% post-game.',
    },
    {
      headline: '📊 PSA Drops Turnaround to 20 Business Days',
      source_url: 'https://www.psacard.com',
      time_ago: '12 hours ago',
      impact: 'BULLISH',
      category: 'SPORTS',
      summary: 'Faster grading means more supply hitting market soon — get ungraded cards in NOW before the flood.',
    },
    {
      headline: '⚡ Charizard ex Alt Art Hits $800 in Auctions',
      source_url: 'https://www.ebay.com',
      time_ago: '4 hours ago',
      impact: 'BULLISH',
      category: 'POKEMON',
      summary: 'Alt art Charizard variants continue to dominate. High-grade copies setting new records weekly.',
    },
    {
      headline: '🏀 Victor Wembanyama Named Defensive Player of Year',
      source_url: 'https://www.nba.com',
      time_ago: '8 hours ago',
      impact: 'BULLISH',
      category: 'SPORTS',
      summary: 'Wemby award recognition continuing to push rookie card prices to new highs across all grades.',
    },
    {
      headline: '⚡ Pokemon GO Fest 2025 Dates Announced',
      source_url: 'https://pokemongolive.com',
      time_ago: '14 hours ago',
      impact: 'WATCH',
      category: 'POKEMON',
      summary: 'GO Fest usually introduces new Pokemon — watch for promo card announcements alongside the event.',
    },
    {
      headline: '🏈 Aaron Rodgers Retirement Announcement',
      source_url: 'https://www.nfl.com',
      time_ago: '18 hours ago',
      impact: 'BEARISH',
      category: 'SPORTS',
      summary: 'Retirement typically causes short-term selling pressure as investors lock in gains on high-grade copies.',
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

    // Fetch fresh news
    const news = await fetchNewsWithClaude();

    // Cache the results
    await cacheNews(news);

    return NextResponse.json({
      news,
      cached: false,
      next_refresh: CACHE_TTL_MINUTES + ' minutes',
    });
  } catch (error) {
    console.error('Edge news error:', error);
    // Return demo data on error
    return NextResponse.json({
      news: getDemoNews(),
      cached: false,
      error: 'Using cached demo data',
    });
  }
}
