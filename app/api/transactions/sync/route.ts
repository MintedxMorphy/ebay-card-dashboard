import { NextRequest, NextResponse } from 'next/server';
import { fetchSalesTransactions, isCardItem } from '@/lib/ebay';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, userId } = await request.json();

    if (!accessToken || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch sales from eBay
    const salesData = await fetchSalesTransactions(accessToken);
    const orders = salesData.orders || [];

    // Filter card items and store in Supabase
    const cardTransactions = [];

    for (const order of orders) {
      for (const item of order.lineItems || []) {
        const cardType = isCardItem(item.title);

        if (cardType) {
          cardTransactions.push({
            user_id: userId,
            ebay_transaction_id: order.orderId,
            type: 'sell',
            card_type: cardType,
            title: item.title,
            amount: parseFloat(item.lineItemPrice?.value || '0'),
            quantity: item.quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    // Upsert transactions
    if (cardTransactions.length > 0) {
      const { error } = await supabase
        .from('transactions')
        .upsert(cardTransactions, {
          onConflict: 'ebay_transaction_id',
        });

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json(
          { error: 'Failed to store transactions' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      transactionsAdded: cardTransactions.length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    );
  }
}
