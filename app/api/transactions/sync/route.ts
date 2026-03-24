import { NextRequest, NextResponse } from 'next/server';
import { fetchSalesTransactions, isCardItem, getItemDetailsFromBrowseAPI } from '@/lib/ebay';
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

    // Fetch sales from eBay (now with pagination)
    const salesData = await fetchSalesTransactions(accessToken);
    const orders = salesData.orders || [];
    const totalAvailable = salesData.total || 0;

    console.log(`[SYNC] eBay API returned ${orders.length} orders (${totalAvailable} total available in account)`);
    console.log(`[SYNC] Processing ${orders.length} orders for user ${userId}`);

    // Filter card items and store in Supabase
    const cardTransactions = [];

    for (const order of orders) {
      // Log EVERY order at the start
      const firstItemTitle = order.lineItems?.[0]?.title || 'NO ITEMS';
      console.log(`[SYNC] ========== Order ${order.orderId} ==========`);
      console.log(`[SYNC] Total line items in order: ${(order.lineItems || []).length}`);
      console.log(`[SYNC] First item title: ${firstItemTitle}`);

      const cardLineItems = (order.lineItems || []).filter((item: any) => isCardItem(item.title));
      
      if (cardLineItems.length === 0) {
        console.log(`[SYNC] Order ${order.orderId}: No card items detected (checked all ${(order.lineItems || []).length} items)`);
        // Log each item that was rejected
        (order.lineItems || []).forEach((item: any, idx: number) => {
          console.log(`[SYNC]   Item ${idx}: "${item.title}" - isCardItem returned null`);
        });
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
        let cardType = isCardItem(item.title);

        // If title check failed, try Browse API with full item description
        if (!cardType && item.legacyItemId) {
          console.log(`[SYNC] ${item.title} - Initial check failed, trying Browse API...`);
          const itemDetails = await getItemDetailsFromBrowseAPI(item.legacyItemId, accessToken);
          if (itemDetails) {
            cardType = isCardItem(item.title, itemDetails.description);
            console.log(`[SYNC] ${item.title} - Browse API result: ${cardType || 'still null'}`);
          }
        }

        if (cardType) {
          const finalDate = order.creationDate || new Date().toISOString();
          console.log(`[SYNC] Order ${order.orderId}:`);
          console.log(`  - Item: ${item.title}`);
          console.log(`  - Category: ${cardType}`);
          console.log(`  - order.creationDate value: ${order.creationDate}`);
          console.log(`  - Final transaction_date being inserted: ${finalDate}`);
          console.log(`  - Type of creationDate: ${typeof order.creationDate}`);
          
          cardTransactions.push({
            user_id: userId,
            transaction_type: 'sell',
            card_category: cardType,
            amount: amountPerItem,
            card_name: item.title,
            ebay_order_id: order.orderId,
            transaction_date: finalDate,
          });
        } else {
          console.log(`[SYNC] Order ${order.orderId} - ${item.title} - DROPPED (not identified as card)`);
        }
      }
    }

    console.log(`[SYNC] Summary:`);
    console.log(`  - Total orders processed: ${orders.length}`);
    console.log(`  - Card transactions ready to insert: ${cardTransactions.length}`);

    // Insert transactions with duplicate handling
    // The UNIQUE constraint on (user_id, ebay_order_id) prevents duplicates
    // Duplicates are expected on re-syncs and are safe to ignore
    if (cardTransactions.length > 0) {
      console.log(`[SYNC] Inserting ${cardTransactions.length} transactions into Supabase...`);
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
