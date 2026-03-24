import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/ebay';
import { supabase } from '@/lib/supabase';

async function handleCallback(code: string | null, error: string | null, isPost: boolean = false) {
  if (error) {
    if (isPost) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.redirect(new URL(`/?error=${error}`, 'https://ebay-card-dashboard.vercel.app'));
  }

  if (!code) {
    if (isPost) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }
    return NextResponse.redirect(new URL('/?error=no_code', 'https://ebay-card-dashboard.vercel.app'));
  }

  try {
    // Exchange code for access token
    const tokenData = await getAccessToken(code);
    console.log('Token data received:', {
      access_token: tokenData.access_token?.substring(0, 20) + '...',
      expires_in: tokenData.expires_in,
    });

    // Use a fixed userId for single-user setup (Gabriel)
    const userId = 'gabriel_ebay_account';
    const accessToken = tokenData.access_token;
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Store token in Supabase
    const { error: dbError } = await supabase
      .from('users')
      .upsert(
        {
          user_id: userId,
          ebay_access_token: accessToken,
          token_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (dbError) {
      console.error('Supabase user store error:', dbError);
      if (isPost) {
        return NextResponse.json(
          { error: 'Failed to store token' },
          { status: 500 }
        );
      }
      return NextResponse.redirect(new URL('/?error=db_error', 'https://ebay-card-dashboard.vercel.app'));
    }

    console.log('User token stored for:', userId);

    // Auto-sync transactions
    console.log('Calling transaction sync...');
    try {
      const syncResponse = await fetch(
        'https://ebay-card-dashboard.vercel.app/api/transactions/sync',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: accessToken,
            userId: userId,
          }),
        }
      );

      const syncData = await syncResponse.json();
      console.log('Sync result:', syncData);
    } catch (syncError) {
      console.error('Transaction sync error:', syncError);
    }

    // Return success response
    if (isPost) {
      return NextResponse.json({ success: true, userId });
    }

    // Redirect to dashboard on success (GET)
    const response = NextResponse.redirect(new URL('/dashboard', 'https://ebay-card-dashboard.vercel.app'));
    response.cookies.set('userId', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    if (isPost) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
    return NextResponse.redirect(new URL(`/?error=auth_failed`, 'https://ebay-card-dashboard.vercel.app'));
  }
}

export async function GET(request: NextRequest) {
  console.log('=== CALLBACK GET HIT ===', request.url);
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  return handleCallback(code, error);
}

export async function POST(request: NextRequest) {
  console.log('=== CALLBACK POST HIT ===');
  const body = await request.json();
  const { code, error } = body;

  return handleCallback(code, error, true);
}
