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
    const includeOther = request.nextUrl.searchParams.get('includeOther') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    console.log('Fetching transactions for userId:', userId, 'includeOther:', includeOther);

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

    // Filter transactions based on includeOther flag
    const filteredTransactions = !includeOther
      ? transactions?.filter((tx: any) => tx.card_category !== 'other') || []
      : transactions || [];

    // Calculate stats
    const stats = {
      sports_spent: 0,
      sports_revenue: 0,
      sports_profit: 0,
      sports_count: 0, // Track actual transaction count
      pokemon_spent: 0,
      pokemon_revenue: 0,
      pokemon_profit: 0,
      pokemon_count: 0, // Track actual transaction count
      total_profit: 0,
      transactions: filteredTransactions,
    };

    console.log(`[STATS] Starting calculation with ${transactions?.length || 0} total transactions, ${filteredTransactions.length} filtered transactions`);

    // Count and calculate stats from FILTERED transactions only (what's actually displayed)
    if (filteredTransactions && filteredTransactions.length > 0) {
      filteredTransactions.forEach((tx: any) => {
        if (tx.card_category === 'sports') {
          stats.sports_count++;
          if (tx.transaction_type === 'buy') {
            stats.sports_spent += tx.amount;
          } else {
            stats.sports_revenue += tx.amount;
          }
        } else if (tx.card_category === 'pokemon') {
          stats.pokemon_count++;
          if (tx.transaction_type === 'buy') {
            stats.pokemon_spent += tx.amount;
          } else {
            stats.pokemon_revenue += tx.amount;
          }
        }
        // Note: 'other' category is already excluded from filteredTransactions
      });
    }

    console.log(`[STATS] Final counts - Sports: ${stats.sports_count}, Pokemon: ${stats.pokemon_count}, Total: ${stats.sports_count + stats.pokemon_count}`);

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
