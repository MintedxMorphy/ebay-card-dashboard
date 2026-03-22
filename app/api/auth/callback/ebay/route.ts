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

    // Store token in session/database
    // For now, we'll redirect with the token (in production, use secure storage)
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('ebay_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
    });

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
