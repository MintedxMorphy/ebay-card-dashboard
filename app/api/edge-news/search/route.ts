import { NextResponse } from 'next/server';

interface SearchResult {
  headline: string;
  category: 'SPORTS' | 'POKEMON' | 'MARKET';
  impact: 'BULLISH' | 'BEARISH' | 'WATCH';
  summary: string;
  source_url: string;
  relevance_score: number;
}

async function searchPerplexity(query: string, apiKey: string): Promise<string> {
  try {
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
            content: `You are a trading card market analyst. Answer queries about card values, player stats, sports news, Pokemon TCG, market trends, and trade impacts. Provide factual, current information with specific card prices, player achievements, and market analysis.`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        search_recency_filter: 'day',
        return_citations: true,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EdgeNewsSearch] Perplexity error ${response.status}: ${errorText.slice(0, 200)}`);
      throw new Error(`Perplexity API error ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      citations?: string[];
    };

    const content = data.choices?.[0]?.message?.content ?? '';
    const citations: string[] = Array.isArray(data.citations) ? data.citations : [];

    // Append citations
    const citationBlock = citations.length > 0
      ? `\n\nSOURCE URLs:\n${citations.map((url, i) => `[${i + 1}] ${url}`).join('\n')}`
      : '';

    return content + citationBlock;
  } catch (error) {
    console.error('[EdgeNewsSearch] Perplexity query failed:', error);
    throw error;
  }
}

async function classifySearchResults(
  rawContent: string,
  query: string,
  anthropicKey: string
): Promise<SearchResult[]> {
  const prompt = `You are analyzing search results for a trading card market platform. The user searched for: "${query}"

Based on this search result content, extract 3-5 relevant market insights. For each:
- headline: specific finding (e.g., "Tom Brady Rookie Card Up 25% This Quarter", "Charizard VMAX Reprinted")
- category: SPORTS (player cards/sports news), POKEMON (TCG/Pokemon), or MARKET (general trading/card market)
- impact: BULLISH (positive for card values), BEARISH (negative), or WATCH (monitor)
- summary: 1-2 sentences explaining the market implication
- source_url: best URL from SOURCE URLs list, or "#" if none
- relevance_score: 0-100 how relevant to the search query (80+ is highly relevant)

Raw content:
${rawContent}

Return ONLY a JSON array, no markdown fences:
[{"headline":"...","category":"SPORTS","impact":"BULLISH","summary":"...","source_url":"...","relevance_score":85}]`;

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

  const parsed = JSON.parse(jsonMatch[0]) as Array<{
    headline?: string;
    category?: string;
    impact?: string;
    summary?: string;
    source_url?: string;
    relevance_score?: number;
  }>;
  
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item) => item.headline && item.summary)
    .map((item) => ({
      headline: String(item.headline).slice(0, 100),
      category: (['SPORTS', 'POKEMON', 'MARKET'].includes(item.category as string) ? item.category as 'SPORTS' | 'POKEMON' | 'MARKET' : 'MARKET'),
      impact: (['BULLISH', 'BEARISH', 'WATCH'].includes(item.impact as string) ? item.impact as 'BULLISH' | 'BEARISH' | 'WATCH' : 'WATCH'),
      summary: String(item.summary).slice(0, 250),
      source_url: String(item.source_url || '#'),
      relevance_score: Math.min(100, Math.max(0, Number(item.relevance_score) || 75)),
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 5);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [], error: 'Query required' }, { status: 400 });
  }

  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!perplexityKey || !anthropicKey) {
    console.warn('[EdgeNewsSearch] Missing API keys');
    return NextResponse.json({ results: [] });
  }

  try {
    console.log(`[EdgeNewsSearch] Searching for: "${query}"`);

    // Search Perplexity for market-relevant information
    const searchContent = await searchPerplexity(query, perplexityKey);

    // Classify results with Claude
    const results = await classifySearchResults(searchContent, query, anthropicKey);

    console.log(`[EdgeNewsSearch] Found ${results.length} results`);

    return NextResponse.json({ results, query });
  } catch (error) {
    console.error('[EdgeNewsSearch] Error:', error);
    return NextResponse.json(
      { results: [], error: 'Search failed' },
      { status: 500 }
    );
  }
}
