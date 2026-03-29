import { NextResponse } from 'next/server';

interface NewsItem {
  headline: string;
  source_url: string;
  time_ago: string;
  impact: 'BULLISH' | 'BEARISH' | 'WATCH';
  category: 'SPORTS' | 'POKEMON';
  summary: string;
}

async function queryPerplexity(
  query: string,
  apiKey: string,
  category: string,
  maxTokens: number = 1200
): Promise<string> {
  try {
    console.log(`[EdgeNews] Fetching ${category} with max_tokens=${maxTokens}...`);
    
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
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EdgeNews] Perplexity ${category} error ${response.status}: ${errorText.slice(0, 200)}`);
      throw new Error(`Perplexity API error ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      citations?: string[];
    };

    const content = data.choices?.[0]?.message?.content ?? '';
    const citations: string[] = Array.isArray(data.citations) ? data.citations : [];

    console.log(
      `[EdgeNews] ${category} query success: ${content.length} chars, ${citations.length} citations, ` +
      `query="${query.slice(0, 60)}..."`
    );

    // Append citations so Claude can use real URLs
    const citationBlock = citations.length > 0
      ? `\n\nSOURCE URLs:\n${citations.map((url, i) => `[${i + 1}] ${url}`).join('\n')}`
      : '';

    return content + citationBlock;
  } catch (error) {
    console.error(`[EdgeNews] ${category} Perplexity query failed:`, error);
    throw error;
  }
}

async function classifyWithClaude(
  rawContent: string,
  category: 'SPORTS' | 'POKEMON',
  anthropicKey: string,
  minResults: number = 5
): Promise<NewsItem[]> {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `Today is ${today}. Below is breaking news content from a live web search.

Extract EXACTLY 8 relevant ${category} trading card news stories. You MUST return exactly 8 items (no more, no less).
For each story:
- headline: punchy trader-focused headline (max 80 chars)
- source_url: use a real URL from the SOURCE URLs list if available, else "https://example.com"
- time_ago: estimate like "2h ago", "Today", "Just now"
- impact: BULLISH (increases card values), BEARISH (decreases), or WATCH (unclear)
- category: "${category}"
- summary: 1-2 sentences on why this matters to card collectors/investors

If you don't have 8 distinct stories from the content, synthesize credible trading-relevant items from the context provided.

Raw content:
${rawContent}

Return ONLY a JSON array (no markdown, no explanation):
[{"headline":"...","source_url":"...","time_ago":"...","impact":"BULLISH","category":"${category}","summary":"..."}]`;

  console.log(`[EdgeNews] Claude: Classifying ${category} (expecting minimum ${minResults} results)...`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[EdgeNews] Claude ${category} error ${response.status}: ${errorText.slice(0, 200)}`);
    throw new Error(`Anthropic API error ${response.status}`);
  }

  const data = await response.json() as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text ?? '';

  console.log(`[EdgeNews] Claude ${category} response: ${text.length} chars`);

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.warn(`[EdgeNews] Claude ${category}: No JSON found in response`);
    return [];
  }

  let parsed: NewsItem[];
  try {
    parsed = JSON.parse(jsonMatch[0]) as NewsItem[];
  } catch (e) {
    console.error(`[EdgeNews] Claude ${category}: JSON parse failed`, e);
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.warn(`[EdgeNews] Claude ${category}: Parsed value is not an array`);
    return [];
  }

  const processed = parsed
    .filter((item) => item.headline && item.summary)
    .map((item) => ({
      headline: String(item.headline).slice(0, 80),
      source_url: String(item.source_url || 'https://example.com'),
      time_ago: String(item.time_ago || 'Today'),
      impact: (['BULLISH', 'BEARISH', 'WATCH'].includes(item.impact) ? item.impact : 'WATCH') as NewsItem['impact'],
      category: category,
      summary: String(item.summary).slice(0, 200),
    }))
    .slice(0, 8);

  console.log(`[EdgeNews] Claude ${category}: Extracted ${processed.length} items (requested minimum: ${minResults})`);

  return processed;
}

export async function GET() {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!perplexityKey) {
    console.warn('[EdgeNews] PERPLEXITY_API_KEY not set');
    return NextResponse.json({ news: [] });
  }

  if (!anthropicKey) {
    console.warn('[EdgeNews] ANTHROPIC_API_KEY not set');
    return NextResponse.json({ news: [] });
  }

  try {
    console.log('[EdgeNews] ========== Starting news fetch ==========');

    // Fetch sports and pokemon news in parallel
    // CRITICAL: Sports gets higher token limit (2000 vs 1200) to ensure more content
    const [sportsRaw, pokemonRaw] = await Promise.allSettled([
      queryPerplexity(
        'Breaking sports news today involving trading cards: NFL NBA MLB player cards trades injuries retirements milestones in last 24 hours. MUST return 8+ distinct stories.',
        perplexityKey,
        'SPORTS',
        2000 // Increased from 1200 to get more content
      ),
      queryPerplexity(
        'Pokemon TCG news today: new sets announcements tournament results bans reprints market trends in last 24 hours. MUST return 8+ distinct stories.',
        perplexityKey,
        'POKEMON',
        1500 // Slightly increased for consistency
      ),
    ]);

    const sportsContent = sportsRaw.status === 'fulfilled' ? sportsRaw.value : '';
    const pokemonContent = pokemonRaw.status === 'fulfilled' ? pokemonRaw.value : '';

    console.log(
      `[EdgeNews] Perplexity fetch complete: Sports=${sportsContent.length > 0 ? 'OK' : 'EMPTY'}, ` +
      `Pokemon=${pokemonContent.length > 0 ? 'OK' : 'EMPTY'}`
    );

    // Classify with Claude in parallel
    const [sportsStories, pokemonStories] = await Promise.allSettled([
      sportsContent
        ? classifyWithClaude(sportsContent, 'SPORTS', anthropicKey, 5)
        : Promise.resolve([]),
      pokemonContent
        ? classifyWithClaude(pokemonContent, 'POKEMON', anthropicKey, 5)
        : Promise.resolve([]),
    ]);

    const sports = sportsStories.status === 'fulfilled' ? sportsStories.value : [];
    const pokemon = pokemonStories.status === 'fulfilled' ? pokemonStories.value : [];

    console.log(
      `[EdgeNews] Claude extraction complete: Sports=${sports.length} items, Pokemon=${pokemon.length} items`
    );

    // CRITICAL: Ensure sports has minimum items, retry if needed
    if (sports.length < 5) {
      console.warn(`[EdgeNews] ALERT: Sports returned only ${sports.length} items, expected 5+. Retrying...`);
      try {
        const sportsRetry = await queryPerplexity(
          'List 10 RECENT sports card trading news stories from the last week: player trades injuries signings milestones rookie debuts retirement news. Include multiple distinct stories.',
          perplexityKey,
          'SPORTS_RETRY',
          2500 // Even higher for retry
        );

        const sportsRetryStories = await classifyWithClaude(sportsRetry, 'SPORTS', anthropicKey, 5);
        console.log(`[EdgeNews] Sports retry: ${sportsRetryStories.length} items recovered`);
        sports.push(...sportsRetryStories);
      } catch (retryError) {
        console.error('[EdgeNews] Sports retry failed:', retryError);
      }
    }

    const news: NewsItem[] = [...sports, ...pokemon];

    console.log(`[EdgeNews] ========== Final result: ${news.length} total items ==========`);

    return NextResponse.json({ news });
  } catch (error) {
    console.error('[EdgeNews] Fatal error:', error);
    return NextResponse.json({ news: [] });
  }
}
