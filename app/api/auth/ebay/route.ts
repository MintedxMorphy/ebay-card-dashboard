import { getEbayAuthUrl } from '@/lib/ebay';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.EBAY_CLIENT_ID?.trim();
    const clientSecret = process.env.EBAY_CLIENT_SECRET?.trim();
    const redirectUri = process.env.EBAY_REDIRECT_URI?.trim();

    console.log('=== eBay OAuth Init Debug ===');
    console.log('EBAY_CLIENT_ID:', clientId ? `${clientId.substring(0, 20)}...` : 'MISSING');
    console.log('EBAY_CLIENT_SECRET:', clientSecret ? 'SET' : 'MISSING');
    console.log('EBAY_REDIRECT_URI (RuName):', redirectUri);

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
    console.log('\n📍 FULL OAUTH URL BEING SENT TO EBAY:');
    console.log(authUrl);
    console.log('\n📊 Parsed OAuth Parameters:');
    
    // Parse and log individual params
    const url = new URL(authUrl);
    console.log('  client_id:', url.searchParams.get('client_id'));
    console.log('  redirect_uri:', url.searchParams.get('redirect_uri'));
    console.log('  response_type:', url.searchParams.get('response_type'));
    console.log('  scope:', url.searchParams.get('scope'));
    console.log('  state:', url.searchParams.get('state'));
    console.log('\n⚡ Redirecting user to eBay auth...\n');
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('eBay auth error:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown'}`, { status: 500 });
  }
}
