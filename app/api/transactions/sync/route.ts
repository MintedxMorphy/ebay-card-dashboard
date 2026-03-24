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
      const cardLineItems = (order.lineItems || []).filter((item: any) => isCardItem(item.title));
      
      if (cardLineItems.length === 0) continue;

      // Use the net amount Gabriel received (paymentSummary.totalDueSeller)
      // Distribute equally across card items in this order
      const totalDueSeller = parseFloat(order.paymentSummary?.totalDueSeller?.value || '0');
      const amountPerItem = totalDueSeller / cardLineItems.length;

      for (const item of cardLineItems) {
        const cardType = isCardItem(item.title);

        if (cardType) {
          cardTransactions.push({
            user_id: userId,
            transaction_type: 'sell',
            card_category: cardType,
            amount: amountPerItem,
            card_name: item.title,
          });
        }
      }
    }

    console.log(`Synced ${cardTransactions.length} card transactions for user ${userId}`);

    // Insert transactions (no upsert key since we don't have unique identifier from eBay)
    if (cardTransactions.length > 0) {
      const { error } = await supabase
        .from('transactions')
        .insert(cardTransactions);

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
