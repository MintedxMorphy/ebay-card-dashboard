import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/ebay';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
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
      return NextResponse.redirect(new URL('/?error=db_error', request.url));
    }

    console.log('User token stored for:', userId);

    // Auto-sync transactions
    console.log('Calling transaction sync...');
    try {
      const syncResponse = await fetch(
        new URL('/api/transactions/sync', request.url),
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
      // Don't fail — still redirect to dashboard even if sync fails
    }

    // Redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Also store userId in cookie for client-side reference
    response.cookies.set('userId', userId, {
      httpOnly: false, // Allow JavaScript to read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    console.log('Redirecting to dashboard');
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL(`/?error=auth_failed&msg=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url));
  }
}
