import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = (() => {
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.warn('Supabase client initialization warning:', error);
    // Return a dummy client for build time
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
})();

export type Transaction = {
  id: string;
  user_id: string;
  transaction_type: 'buy' | 'sell';
  card_category: 'sports' | 'pokemon';
  amount: number;
  created_at?: string;
  updated_at?: string;
};
