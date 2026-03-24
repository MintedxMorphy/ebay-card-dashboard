import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Get userId from query params
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    console.log('Fetching transactions for userId:', userId);

    // Fetch all transactions for this user
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`Found ${transactions?.length || 0} transactions for user ${userId}`);

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

    if (transactions && transactions.length > 0) {
      transactions.forEach((tx: any) => {
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
    }

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
