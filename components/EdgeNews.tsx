'use client';

import { useEffect, useState, useCallback } from 'react';

interface NewsItem {
  headline: string;
  source_url: string;
  time_ago: string;
  impact: 'BULLISH' | 'BEARISH' | 'WATCH';
  category: 'SPORTS' | 'POKEMON';
  summary: string;
}

interface EdgeNewsData {
  news?: NewsItem[];
  sports_stories?: NewsItem[];
  pokemon_stories?: NewsItem[];
  cached?: boolean;
}

const IMPACT_STYLES: Record<NewsItem['impact'], { bg: string; text: string; glow: string; label: string }> = {
  BULLISH: {
    bg: 'bg-[#00ff41]/10',
    text: 'text-[#00ff41]',
    glow: 'border-[#00ff41]/40',
    label: '▲ BULLISH',
  },
  BEARISH: {
    bg: 'bg-[#ff006e]/10',
    text: 'text-[#ff006e]',
    glow: 'border-[#ff006e]/40',
    label: '▼ BEARISH',
  },
  WATCH: {
    bg: 'bg-yellow-400/10',
    text: 'text-yellow-400',
    glow: 'border-yellow-400/40',
    label: '◆ WATCH',
  },
};

const CATEGORY_STYLES: Record<NewsItem['category'], { bg: string; text: string; icon: string }> = {
  SPORTS: {
    bg: 'bg-[#00ffff]/10',
    text: 'text-[#00ffff]',
    icon: '🏈',
  },
  POKEMON: {
    bg: 'bg-[#8b00ff]/10',
    text: 'text-[#8b00ff]',
    icon: '⚡',
  },
};

type Category = 'SPORTS' | 'POKEMON';

export default function EdgeNews() {
  const [sportsStories, setSportsStories] = useState<NewsItem[]>([]);
  const [pokemonStories, setPokemonStories] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cached, setCached] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('SPORTS');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const url = forceRefresh ? '/api/edge-news?refresh=true' : '/api/edge-news';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: EdgeNewsData = await res.json();

      // Support both old {news:[]} and new {sports_stories:[], pokemon_stories:[]} formats
      if (data.sports_stories || data.pokemon_stories) {
        setSportsStories(data.sports_stories || []);
        setPokemonStories(data.pokemon_stories || []);
      } else {
        // Legacy: split combined news array by category
        const allNews = data.news || [];
        setSportsStories(allNews.filter((n) => n.category === 'SPORTS'));
        setPokemonStories(allNews.filter((n) => n.category === 'POKEMON'));
      }

      setCached(data.cached || false);
      setLastUpdated(new Date());
    } catch {
      // Keep existing news on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(true), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const mins = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1m ago';
    return `${mins}m ago`;
  };

  // Get stories for active category, filtered by search
  const activeStories = activeCategory === 'SPORTS' ? sportsStories : pokemonStories;
  const filteredStories = searchQuery.trim()
    ? activeStories.filter(
        (item) =>
          item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeStories;

  return (
    <div
      className="rounded-xl bg-black border border-[#00ff41]/30 overflow-hidden"
      style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.08), inset 0 0 40px rgba(0, 255, 65, 0.02)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-[#00ff41]/20"
        style={{ background: 'linear-gradient(90deg, rgba(0,255,65,0.05) 0%, transparent 100%)' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-2xl font-black font-mono tracking-wider"
            style={{ color: '#00ff41', textShadow: '0 0 15px rgba(0,255,65,0.6), 0 0 30px rgba(0,255,65,0.3)' }}
          >
            ⚡ EDGE NEWS
          </span>
          {cached && (
            <span className="text-xs text-gray-500 font-mono bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700">
              CACHED
            </span>
          )}
          {lastUpdated && (
            <span className="text-xs text-gray-600 font-mono">
              {formatLastUpdated()}
            </span>
          )}
        </div>
        <button
          onClick={() => fetchNews(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#00ff41]/30 text-[#00ff41] text-xs font-mono font-bold transition hover:bg-[#00ff41]/10 hover:border-[#00ff41]/60 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: refreshing ? 'none' : '0 0 8px rgba(0,255,65,0.2)' }}
          title="Refresh news"
        >
          <span className={refreshing ? 'animate-spin' : ''}>↻</span>
          {refreshing ? 'SCANNING...' : 'REFRESH'}
        </button>
      </div>

      {/* Search + Toggle Controls */}
      <div className="px-5 pt-3 pb-2 border-b border-[#00ff41]/10 flex flex-col gap-2">
        {/* Search Field */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setExpandedIndex(null);
          }}
          placeholder={activeCategory === 'SPORTS' ? 'Search player, team, sport... (e.g. Mahomes)' : 'Search card, set, Pokémon... (e.g. Charizard)'}
          className="w-full bg-black border border-[#00ff41]/20 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff41]/60 focus:ring-1 focus:ring-[#00ff41]/20 transition"
        />

        {/* Toggle Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveCategory('SPORTS'); setSearchQuery(''); setExpandedIndex(null); }}
            className={`flex-1 py-1.5 rounded border text-xs font-mono font-bold tracking-wider transition ${
              activeCategory === 'SPORTS'
                ? 'bg-[#00ffff]/15 border-[#00ffff]/60 text-[#00ffff]'
                : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-400'
            }`}
            style={activeCategory === 'SPORTS' ? { boxShadow: '0 0 10px rgba(0,255,255,0.2)' } : {}}
          >
            🏈 SPORTS
            <span className="ml-1.5 text-[10px] opacity-60">({sportsStories.length})</span>
          </button>
          <button
            onClick={() => { setActiveCategory('POKEMON'); setSearchQuery(''); setExpandedIndex(null); }}
            className={`flex-1 py-1.5 rounded border text-xs font-mono font-bold tracking-wider transition ${
              activeCategory === 'POKEMON'
                ? 'bg-[#8b00ff]/20 border-[#8b00ff]/60 text-[#c084fc]'
                : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-400'
            }`}
            style={activeCategory === 'POKEMON' ? { boxShadow: '0 0 10px rgba(139,0,255,0.25)' } : {}}
          >
            ⚡ POKEMON
            <span className="ml-1.5 text-[10px] opacity-60">({pokemonStories.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div
              className="text-3xl mb-3 animate-pulse"
              style={{ color: '#00ff41', textShadow: '0 0 10px rgba(0,255,65,0.5)' }}
            >
              ⚡
            </div>
            <p className="text-[#00ff41]/60 font-mono text-sm">SCANNING MARKET SIGNALS...</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#00ff41]/10 max-h-[520px] overflow-y-auto">
          {filteredStories.length === 0 ? (
            <div className="py-10 text-center text-gray-500 font-mono text-sm">
              {searchQuery.trim()
                ? `No signals matching "${searchQuery}"`
                : 'No signals detected. Try refreshing.'}
            </div>
          ) : (
            filteredStories.map((item, index) => {
              const impact = IMPACT_STYLES[item.impact];
              const cat = CATEGORY_STYLES[item.category];
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={index}
                  className={`px-5 py-3.5 transition-all cursor-pointer hover:bg-white/[0.02] ${isExpanded ? 'bg-white/[0.03]' : ''}`}
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                >
                  <div className="flex items-start gap-3">
                    {/* Impact badge */}
                    <div className="flex-shrink-0 mt-0.5">
                      <span
                        className={`inline-block text-[10px] font-black font-mono px-1.5 py-0.5 rounded border ${impact.bg} ${impact.text} ${impact.glow}`}
                        style={{ letterSpacing: '0.05em' }}
                      >
                        {impact.label}
                      </span>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-white text-sm font-mono font-semibold leading-snug line-clamp-2">
                          {item.headline}
                        </p>
                      </div>

                      {/* Expanded summary */}
                      {isExpanded && (
                        <p className="text-gray-400 text-xs font-mono mt-1.5 mb-2 leading-relaxed">
                          {item.summary}
                        </p>
                      )}

                      {/* Footer row */}
                      <div className="flex items-center gap-2 mt-1.5">
                        {/* Category tag */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${cat.bg} ${cat.text}`}
                        >
                          {cat.icon} {item.category}
                        </span>

                        {/* Time */}
                        <span className="text-gray-600 text-[10px] font-mono">
                          {item.time_ago}
                        </span>

                        {/* Source link */}
                        {item.source_url && item.source_url !== '#' && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#00ffff]/50 text-[10px] font-mono hover:text-[#00ffff] transition ml-auto"
                          >
                            SOURCE →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-2.5 border-t border-[#00ff41]/10 bg-black/40">
        <p className="text-[10px] text-gray-700 font-mono">
          AI-POWERED MARKET SIGNALS • AUTO-REFRESHES EVERY 15 MIN • NOT FINANCIAL ADVICE
        </p>
      </div>
    </div>
  );
}
