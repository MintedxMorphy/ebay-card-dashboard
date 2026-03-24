import axios from 'axios';

const EBAY_API_BASE = 'https://api.ebay.com';
const EBAY_AUTH_URL = 'https://auth.ebay.com/oauth2/authorize';
const EBAY_TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';

export const getEbayAuthUrl = () => {
  const clientId = process.env.EBAY_CLIENT_ID?.trim();
  const redirectUri = process.env.EBAY_REDIRECT_URI?.trim();
  const scopes = [
    'https://api.ebay.com/oauth/api_scope',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
  ];

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri || '',
    response_type: 'code',
    scope: scopes.join(' '),
    state: Math.random().toString(36).substring(7),
  });

  return `${EBAY_AUTH_URL}?${params.toString()}`;
};

export const getAccessToken = async (code: string) => {
  const clientId = process.env.EBAY_CLIENT_ID?.trim();
  const clientSecret = process.env.EBAY_CLIENT_SECRET?.trim();
  const redirectUri = process.env.EBAY_REDIRECT_URI?.trim();

  console.log('=== Token Exchange Debug ===');
  console.log('Client ID:', clientId?.substring(0, 20) + '...');
  console.log('Redirect URI:', redirectUri);
  console.log('Code:', code?.substring(0, 20) + '...');

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const bodyStr = `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`;

  console.log('Token URL:', EBAY_TOKEN_URL);
  console.log('Body:', bodyStr.substring(0, 100) + '...');

  try {
    const response = await axios.post(
      EBAY_TOKEN_URL,
      bodyStr,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('✓ Token received successfully');
    return response.data;
  } catch (error) {
    console.error('❌ eBay token error:', error instanceof Error ? error.message : error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const fetchSalesTransactions = async (accessToken: string, limit = 10) => {
  try {
    const response = await axios.get(
      `${EBAY_API_BASE}/sell/fulfillment/v1/order`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Language': 'en-US',
        },
        params: {
          limit,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('eBay sales fetch error:', error);
    console.log('eBay errors:', JSON.stringify((error as any)?.response?.data?.errors));
    throw error;
  }
};

export const fetchBuyingHistory = async (accessToken: string) => {
  try {
    const response = await axios.get(
      `${EBAY_API_BASE}/buy/order_v2/order`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Language': 'en-US',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('eBay buying history error:', error);
    throw error;
  }
};

export const getItemDetailsFromBrowseAPI = async (itemId: string, accessToken: string): Promise<{ description: string; category: string } | null> => {
  try {
    // Use the Browse API to fetch full item details
    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item/${itemId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Language': 'en-US',
        },
      }
    );

    if (!response.ok) {
      console.log(`[Browse API] Failed to fetch item ${itemId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      description: data.description || '',
      category: data.categoryPath || '',
    };
  } catch (error) {
    console.error(`[Browse API] Error fetching ${itemId}:`, error);
    return null;
  }
};

export const isCardItem = (title: string, description?: string): 'sports' | 'pokemon' | 'other' | null => {
  const searchText = (description ? `${title} ${description}` : title).toLowerCase();

  // Sports cards - CHECK FIRST (Panini Prizm should be sports, not pokemon)
  const sportsBrands = [
    'topps',
    'panini',
    'prizm',
    'upper deck',
    'bowman',
    'donruss',
    'fleer',
    'graded',
    'nfl',
    'nba',
    'mlb',
    'nhl',
    'sports card',
  ];

  const sportsKeywords = [
    'rookie',
    'rookie card',
    'rc',
    'refractor',
    'holo',
    'holographic',
    'chrome',
    'parallel',
    'auto',
    'autograph',
    'autographed',
    'patch',
    '/99',
    '/50',
    '/25',
    '/10',
    '/5',
  ];

  // Check sports brands
  if (sportsBrands.some(brand => searchText.includes(brand))) {
    return 'sports';
  }

  // Check sports-specific keywords
  if (sportsKeywords.some(keyword => searchText.includes(keyword))) {
    return 'sports';
  }

  // Pokemon cards - check after sports to avoid false positives
  if (
    searchText.includes('pokemon') ||
    searchText.includes('charizard') ||
    searchText.includes('pikachu') ||
    searchText.includes('psa') ||
    searchText.includes('bgvg') ||
    searchText.includes('tcg')
  ) {
    return 'pokemon';
  }

  // ULTIMATE FALLBACK: Check for obvious non-card exclusion keywords
  // If the item doesn't match these, assume it's a sports card by default
  const nonCardKeywords = [
    'reel',
    'saddle',
    'bike',
    'bicycle',
    'fishing',
    'furniture',
    'shoes',
    'clothing',
    'shirt',
    'hat',
    'jacket',
    'pants',
    'electronics',
    'phone',
    'computer',
    'tv',
    'headphones',
  ];

  if (!nonCardKeywords.some(keyword => searchText.includes(keyword))) {
    // Not explicitly a non-card item, and contains 'card' or looks like a card
    if (searchText.includes('card')) {
      return 'sports'; // Default to sports if unclear
    }
  }

  // If title contains 'card' but is explicitly non-card, classify as 'other'
  if (searchText.includes('card')) {
    return 'other';
  }

  return null;
};
