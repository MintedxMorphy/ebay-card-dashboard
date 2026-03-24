import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, card_name, card_category, amount, transaction_date } = body;

    console.log(`[UPDATE] Request body:`, {
      transactionId,
      card_name,
      card_category,
      amount,
      transaction_date,
    });

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Update transaction in Supabase
    const { data, error } = await supabase
      .from('transactions')
      .update({
        card_name,
        card_category,
        amount: parseFloat(amount),
        transaction_date,
      })
      .eq('id', transactionId)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      return NextResponse.json(
        { error: `Failed to update transaction: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`Updated transaction ${transactionId}:`, data);

    return NextResponse.json({
      success: true,
      transaction: data?.[0] || null,
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
