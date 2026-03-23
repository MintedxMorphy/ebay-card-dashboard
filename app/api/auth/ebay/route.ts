import { getEbayAuthUrl } from '@/lib/ebay';
import { redirect } from 'next/navigation';

export async function GET() {
  try {
    // Debug: Check if env vars exist
    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;
    const redirectUri = process.env.EBAY_REDIRECT_URI;

    console.log('eBay Auth Debug:');
    console.log('Client ID exists:', !!clientId);
    console.log('Client Secret exists:', !!clientSecret);
    console.log('Redirect URI:', redirectUri);

    if (!clientId || !clientSecret || !redirectUri) {
      return new Response('eBay credentials not configured. Missing: ' + 
        (!clientId ? 'CLIENT_ID ' : '') + 
        (!clientSecret ? 'CLIENT_SECRET ' : '') + 
        (!redirectUri ? 'REDIRECT_URI' : ''), 
        { status: 500 });
    }

    const authUrl = getEbayAuthUrl();
    console.log('Generated auth URL:', authUrl.substring(0, 100) + '...');
    
    redirect(authUrl);
  } catch (error) {
    console.error('eBay auth initiation error:', error);
    return new Response(`Failed to initiate eBay login: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
