import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, card_name, card_category, amount, created_at, transaction_type } = body;

    if (!userId || !card_name || !card_category || amount === undefined || !transaction_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert transaction into Supabase
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          card_name: card_name,
          card_category: card_category,
          amount: parseFloat(amount),
          created_at: created_at,
          transaction_type: transaction_type,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    console.log(`Created ${transaction_type} transaction for ${userId}:`, data);

    return NextResponse.json({
      success: true,
      transaction: data?.[0] || null,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
