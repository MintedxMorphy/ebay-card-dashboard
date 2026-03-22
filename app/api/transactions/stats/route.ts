import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Fetch all transactions for demo user
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', '550e8400-e29b-41d4-a716-446655440000')
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      sports_spent: 0,
      sports_revenue: 0,
      sports_profit: 0,
      pokemon_spent: 0,
      pokemon_revenue: 0,
      pokemon_profit: 0,
      total_profit: 0,
      transactions: transactions || [],
    };

    transactions?.forEach((tx: any) => {
      if (tx.card_category === 'sports') {
        if (tx.transaction_type === 'buy') {
          stats.sports_spent += tx.amount;
        } else {
          stats.sports_revenue += tx.amount;
        }
      } else if (tx.card_category === 'pokemon') {
        if (tx.transaction_type === 'buy') {
          stats.pokemon_spent += tx.amount;
        } else {
          stats.pokemon_revenue += tx.amount;
        }
      }
    });

    stats.sports_profit = stats.sports_revenue - stats.sports_spent;
    stats.pokemon_profit = stats.pokemon_revenue - stats.pokemon_spent;
    stats.total_profit = stats.sports_profit + stats.pokemon_profit;

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
