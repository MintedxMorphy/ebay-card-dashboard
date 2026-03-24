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

    console.log(`[SYNC] Found ${orders.length} total orders from eBay for user ${userId}`);

    // Filter card items and store in Supabase
    const cardTransactions = [];

    for (const order of orders) {
      const cardLineItems = (order.lineItems || []).filter((item: any) => isCardItem(item.title));
      
      if (cardLineItems.length === 0) {
        console.log(`[SYNC] Order ${order.orderId}: ${(order.lineItems || []).length} items, none are cards`);
        continue;
      }

      console.log(`[SYNC] Order ${order.orderId}: Found ${cardLineItems.length} card items`);

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
            transaction_date: order.creationDate || new Date().toISOString(),
          });
        }
      }
    }

    console.log(`[SYNC] Processing ${cardTransactions.length} card transactions for user ${userId}`);

    // Insert transactions with duplicate handling
    // The UNIQUE constraint on (user_id, ebay_order_id) prevents duplicates
    // Duplicates are expected on re-syncs and are safe to ignore
    if (cardTransactions.length > 0) {
      const { error, data, status } = await supabase
        .from('transactions')
        .insert(cardTransactions);

      if (error) {
        // Unique constraint violations (23505) are expected on re-syncs
        // This happens when trying to insert an order that already exists
        if (error.code === '23505') {
          console.log(`[SYNC] ✓ Duplicate constraint (expected on re-sync) — ${cardTransactions.length} orders already in database`);
          return NextResponse.json({
            success: true,
            transactionsAdded: 0,
            message: `No new transactions. All ${cardTransactions.length} orders already synced.`,
          });
        }
        
        console.error(`[SYNC] ✗ Insert error (code: ${error.code}):`, error.message);
        console.error(`[SYNC] Error details:`, error.details);
        return NextResponse.json(
          { error: `Failed to store transactions: ${error.message}` },
          { status: 500 }
        );
      }

      console.log(`[SYNC] ✓ Successfully inserted ${cardTransactions.length} transactions`);
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
