import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get all transactions for user
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      totalSpent: 0,
      totalRevenue: 0,
      netProfit: 0,
      sports: { spent: 0, revenue: 0, items: 0 },
      pokemon: { spent: 0, revenue: 0, items: 0 },
      overTime: [] as Array<{ date: string; profit: number; revenue: number; spent: number }>,
    };

    // Group by date for over-time chart
    const dateMap: Record<string, { profit: number; revenue: number; spent: number }> = {};

    for (const tx of transactions || []) {
      const date = new Date(tx.created_at).toLocaleDateString('en-US');

      if (!dateMap[date]) {
        dateMap[date] = { profit: 0, revenue: 0, spent: 0 };
      }

      if (tx.type === 'sell') {
        stats.totalRevenue += tx.amount * tx.quantity;
        dateMap[date].revenue += tx.amount * tx.quantity;

        if (tx.card_type === 'sports') {
          stats.sports.revenue += tx.amount * tx.quantity;
        } else if (tx.card_type === 'pokemon') {
          stats.pokemon.revenue += tx.amount * tx.quantity;
        }
      } else if (tx.type === 'buy') {
        stats.totalSpent += tx.amount * tx.quantity;
        dateMap[date].spent += tx.amount * tx.quantity;

        if (tx.card_type === 'sports') {
          stats.sports.spent += tx.amount * tx.quantity;
        } else if (tx.card_type === 'pokemon') {
          stats.pokemon.spent += tx.amount * tx.quantity;
        }
      }

      if (tx.card_type === 'sports') {
        stats.sports.items += tx.quantity;
      } else if (tx.card_type === 'pokemon') {
        stats.pokemon.items += tx.quantity;
      }
    }

    stats.netProfit = stats.totalRevenue - stats.totalSpent;
    stats.sports.spent = stats.sports.spent || 0;
    stats.sports.revenue = stats.sports.revenue || 0;
    stats.pokemon.spent = stats.pokemon.spent || 0;
    stats.pokemon.revenue = stats.pokemon.revenue || 0;

    // Convert dateMap to sorted array
    stats.overTime = Object.entries(dateMap)
      .map(([date, data]) => ({
        date,
        ...data,
        profit: data.revenue - data.spent,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate stats' },
      { status: 500 }
    );
  }
}
