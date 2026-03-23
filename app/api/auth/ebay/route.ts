import { getEbayAuthUrl } from '@/lib/ebay';
import { redirect } from 'next/navigation';

export async function GET() {
  try {
    const authUrl = getEbayAuthUrl();
    redirect(authUrl);
  } catch (error) {
    console.error('eBay auth initiation error:', error);
    return new Response('Failed to initiate eBay login', { status: 500 });
  }
}
