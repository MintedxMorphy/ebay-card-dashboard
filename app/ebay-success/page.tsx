'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EbaySuccess() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code and state from URL query params
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        console.log('eBay Success Page:', { code: code?.substring(0, 20), state, error });

        if (error) {
          setStatus(`Authorization failed: ${error}`);
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        if (!code) {
          setStatus('No authorization code received');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        // POST the code to our callback API route
        setStatus('Exchanging code for token...');
        const response = await fetch('/api/auth/callback/ebay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Token exchange failed');
        }

        setStatus('Success! Redirecting to dashboard...');
        // Redirect to dashboard after brief delay
        setTimeout(() => router.push('/dashboard'), 1000);
      } catch (err) {
        console.error('Error processing eBay callback:', err);
        setStatus(err instanceof Error ? err.message : 'An error occurred');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)',
      }}></div>

      <div className="relative z-10 text-center">
        <div className="text-6xl mb-8 animate-pulse">🚀</div>
        <h1 className="text-2xl font-mono font-bold text-[#00ff41] mb-4" style={{
          textShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
        }}>
          CardTrack x Gabriel
        </h1>
        <p className="text-lg font-mono text-gray-400 mb-8">
          {status}
        </p>
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-[#00ff41] border-t-[#ff006e] rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
