import { getEbayAuthUrl } from '@/lib/ebay';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;
    const redirectUri = process.env.EBAY_REDIRECT_URI;

    console.log('=== eBay OAuth Debug ===');
    console.log('EBAY_CLIENT_ID:', clientId ? `${clientId.substring(0, 20)}...` : 'MISSING');
    console.log('EBAY_CLIENT_SECRET:', clientSecret ? 'SET' : 'MISSING');
    console.log('EBAY_REDIRECT_URI:', redirectUri);

    if (!clientId || !clientSecret || !redirectUri) {
      const missing = [
        !clientId && 'CLIENT_ID',
        !clientSecret && 'CLIENT_SECRET',
        !redirectUri && 'REDIRECT_URI'
      ].filter(Boolean).join(', ');
      console.error('Missing credentials:', missing);
      return new Response(`Missing: ${missing}`, { status: 500 });
    }

    const authUrl = getEbayAuthUrl();
    console.log('Generated OAuth URL:', authUrl);
    console.log('URL Length:', authUrl.length);
    
    // Also log individual params
    const url = new URL(authUrl);
    console.log('OAuth Params:');
    console.log('  client_id:', url.searchParams.get('client_id'));
    console.log('  redirect_uri:', url.searchParams.get('redirect_uri'));
    console.log('  response_type:', url.searchParams.get('response_type'));
    console.log('  scope:', url.searchParams.get('scope')?.substring(0, 100) + '...');
    console.log('  state:', url.searchParams.get('state'));
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('eBay auth error:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown'}`, { status: 500 });
  }
}
