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

export const fetchSalesTransactions = async (accessToken: string, limit = 50) => {
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
          filter: 'fulfillmentStatus:{FULFILLED|IN_PROGRESS}',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('eBay sales fetch error:', error);
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

export const isCardItem = (title: string): 'sports' | 'pokemon' | null => {
  const lowerTitle = title.toLowerCase();

  // Pokemon cards
  if (
    lowerTitle.includes('pokemon') ||
    lowerTitle.includes('charizard') ||
    lowerTitle.includes('pikachu') ||
    lowerTitle.includes('psa') ||
    lowerTitle.includes('bgvg') ||
    lowerTitle.includes('tcg')
  ) {
    return 'pokemon';
  }

  // Sports cards
  if (
    lowerTitle.includes('graded') ||
    lowerTitle.includes('rookie card') ||
    lowerTitle.includes('autograph') ||
    lowerTitle.includes('sports card') ||
    lowerTitle.includes('nfl') ||
    lowerTitle.includes('nba') ||
    lowerTitle.includes('mlb') ||
    lowerTitle.includes('nhl')
  ) {
    return 'sports';
  }

  return null;
};
