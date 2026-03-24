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

      // Calculate card sale amount (totalDueSeller minus shipping passthrough)
      // Distribute equally across card items in this order
      const totalDueSeller = parseFloat(order.paymentSummary?.totalDueSeller?.value || '0');
      const deliveryCost = parseFloat(order.pricingSummary?.deliveryCost?.value || '0');
      const saleAmount = totalDueSeller - deliveryCost;
      const amountPerItem = saleAmount / cardLineItems.length;

      for (const item of cardLineItems) {
        const cardType = isCardItem(item.title);

        if (cardType) {
          cardTransactions.push({
            user_id: userId,
            transaction_type: 'sell',
            card_category: cardType,
            amount: amountPerItem,
            card_name: item.title,
            ebay_order_id: order.orderId,
          });
        }
      }
    }

    console.log(`Synced ${cardTransactions.length} card transactions for user ${userId}`);

    // Insert transactions with duplicate handling
    // The UNIQUE constraint on (user_id, ebay_order_id) prevents duplicates
    // Duplicates are expected on re-syncs and are harmless (ignored by database)
    if (cardTransactions.length > 0) {
      const { error, data } = await supabase
        .from('transactions')
        .insert(cardTransactions);

      if (error) {
        // Unique constraint violations (23505) are expected on re-syncs
        if (error.code === '23505') {
          console.log(`Duplicate constraint hit (expected on re-sync) for user ${userId}`);
          return NextResponse.json({
            success: true,
            transactionsAdded: 0,
            message: 'No new transactions (all orders already synced)',
          });
        }
        
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
