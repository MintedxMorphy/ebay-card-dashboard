import { getEbayAuthUrl } from '@/lib/ebay';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;
    const redirectUri = process.env.EBAY_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return new Response('eBay credentials not configured', { status: 500 });
    }

    const authUrl = getEbayAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('eBay auth error:', error);
    return new Response('Failed to initiate eBay login', { status: 500 });
  }
}
