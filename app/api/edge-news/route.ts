import { NextResponse } from 'next/server';

interface NewsItem {
  headline: string;
  source_url: string;
  time_ago: string;
  impact: 'BULLISH' | 'BEARISH' | 'WATCH';
  category: 'SPORTS' | 'POKEMON';
  summary: string;
}

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
          content: 'You are a real-time breaking news aggregator for trading card collectors and investors.',
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
    throw new Error(`Perplexity API error ${response.status}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    citations?: string[];
  };

  const content = data.choices?.[0]?.message?.content ?? '';
  const citations: string[] = Array.isArray(data.citations) ? data.citations : [];

  // Append citations so Claude can use real URLs
  const citationBlock = citations.length > 0
    ? `\n\nSOURCE URLs:\n${citations.map((url, i) => `[${i + 1}] ${url}`).join('\n')}`
    : '';

  return content + citationBlock;
}

async function classifyWithClaude(
  rawContent: string,
  category: 'SPORTS' | 'POKEMON',
  anthropicKey: string
): Promise<NewsItem[]> {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `Today is ${today}. Below is breaking news content from a live web search.

Extract up to 8 relevant ${category} trading card news stories. For each story:
- headline: punchy trader-focused headline (max 80 chars)
- source_url: use a real URL from the SOURCE URLs list if available, else "#"
- time_ago: estimate like "2h ago", "Today", "Just now"
- impact: BULLISH (increases card values), BEARISH (decreases), or WATCH (unclear)
- category: "${category}"
- summary: 1-2 sentences on why this matters to card collectors/investors

Raw content:
${rawContent}

Return ONLY a JSON array, no markdown fences:
[{"headline":"...","source_url":"...","time_ago":"...","impact":"BULLISH","category":"${category}","summary":"..."}]`;

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
  const text = data.content?.[0]?.text ?? '';

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  const parsed = JSON.parse(jsonMatch[0]) as NewsItem[];
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item) => item.headline && item.summary)
    .map((item) => ({
      headline: String(item.headline).slice(0, 80),
      source_url: String(item.source_url || '#'),
      time_ago: String(item.time_ago || 'Today'),
      impact: (['BULLISH', 'BEARISH', 'WATCH'].includes(item.impact) ? item.impact : 'WATCH') as NewsItem['impact'],
      category: category,
      summary: String(item.summary).slice(0, 200),
    }))
    .slice(0, 8);
}

export async function GET() {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!perplexityKey) {
    return NextResponse.json({ news: [] });
  }

  if (!anthropicKey) {
    return NextResponse.json({ news: [] });
  }

  try {
    // Fetch sports and pokemon news in parallel
    const [sportsRaw, pokemonRaw] = await Promise.allSettled([
      queryPerplexity(
        'Breaking sports news today: NBA NFL MLB player injuries trades retirements milestones in last 24 hours. Give 5+ distinct stories.',
        perplexityKey
      ),
      queryPerplexity(
        'Pokemon TCG news today: new sets announcements tournament results bans reprints in last 24 hours. Give 5+ distinct stories.',
        perplexityKey
      ),
    ]);

    const sportsContent = sportsRaw.status === 'fulfilled' ? sportsRaw.value : '';
    const pokemonContent = pokemonRaw.status === 'fulfilled' ? pokemonRaw.value : '';

    // Classify with Claude in parallel
    const [sportsStories, pokemonStories] = await Promise.allSettled([
      sportsContent ? classifyWithClaude(sportsContent, 'SPORTS', anthropicKey) : Promise.resolve([]),
      pokemonContent ? classifyWithClaude(pokemonContent, 'POKEMON', anthropicKey) : Promise.resolve([]),
    ]);

    const sports = sportsStories.status === 'fulfilled' ? sportsStories.value : [];
    const pokemon = pokemonStories.status === 'fulfilled' ? pokemonStories.value : [];

    const news: NewsItem[] = [...sports, ...pokemon];

    return NextResponse.json({ news });
  } catch (error) {
    console.error('[EdgeNews] Error:', error);
    return NextResponse.json({ news: [] });
  }
}
