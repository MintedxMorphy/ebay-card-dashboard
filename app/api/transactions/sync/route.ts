import { NextRequest, NextResponse } from 'next/server';
import { fetchSalesTransactions, isCardItem, getItemDetailsFromBrowseAPI, classifyFromItemSpecifics } from '@/lib/ebay';
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



      // Calculate card sale amount (totalDueSeller minus shipping passthrough)
      const totalDueSeller = parseFloat(order.paymentSummary?.totalDueSeller?.value || '0');
      const deliveryCost = parseFloat(order.pricingSummary?.deliveryCost?.value || '0');
      const saleAmount = totalDueSeller - deliveryCost;

      // Process ALL items (not just filtered ones) — try Browse API for items that fail initial check
      const allLineItems = order.lineItems || [];
      let cardItemsInOrder = 0;

      // First pass: identify all card items (including those needing Browse API)
      const identifiedCardItems = [];
      for (const item of allLineItems) {
        let cardType = isCardItem(item.title);

        // If title check failed, ALWAYS try Browse API with Item Specifics (localizedAspects)
        if (!cardType && item.legacyItemId) {
          console.log(`[SYNC] ${item.title} - Title keyword check failed, trying Browse API...`);
          const itemDetails = await getItemDetailsFromBrowseAPI(item.legacyItemId, accessToken);
          if (itemDetails) {
            // First try Item Specifics (most reliable)
            if (itemDetails.localizedAspects && itemDetails.localizedAspects.length > 0) {
              cardType = classifyFromItemSpecifics(itemDetails.localizedAspects);
              console.log(`[SYNC] ${item.title} - Item Specifics result: ${cardType || 'no match'}`);
            }
            
            // Fallback to description if Item Specifics didn't classify it
            if (!cardType && itemDetails.description) {
              cardType = isCardItem(item.title, itemDetails.description);
              console.log(`[SYNC] ${item.title} - Description fallback result: ${cardType || 'no match'}`);
            }
          }
        }

        if (cardType) {
          identifiedCardItems.push({ item, cardType });
          console.log(`[SYNC] ✅ ACCEPTED: ${item.title}`);
          console.log(`  - Category: ${cardType}`);
        } else {
          console.log(`[SYNC] ❌ REJECTED: ${item.title}`);
          console.log(`  - Title keyword check: null`);
          console.log(`  - Browse API check: null`);
          console.log(`  - Reason: Not identified as sports or pokemon card`);
        }
      }

      // Only log summary and insert if we found card items
      if (identifiedCardItems.length > 0) {
        console.log(`[SYNC] Order ${order.orderId}: Found ${identifiedCardItems.length} card items out of ${allLineItems.length}`);
        
        // Calculate amount per item based on actual card items found
        const amountPerItem = saleAmount / identifiedCardItems.length;

        // Second pass: add transactions for identified cards
        for (const { item, cardType } of identifiedCardItems) {
          const finalDate = order.creationDate || new Date().toISOString();
          cardTransactions.push({
            user_id: userId,
            transaction_type: 'sell',
            card_category: cardType,
            amount: amountPerItem,
            card_name: item.title,
            ebay_order_id: order.orderId,
            transaction_date: finalDate,
          });
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
      console.log(`[SYNC] Upserting ${cardTransactions.length} transactions into Supabase...`);
      const { error, count } = await supabase
        .from('transactions')
        .upsert(cardTransactions, {
          onConflict: 'user_id,ebay_order_id',
          ignoreDuplicates: true,
        });

      if (error) {
        console.error(`[SYNC] ✗ Upsert error (code: ${error.code}):`, error.message);
        console.error(`[SYNC] Error details:`, error.details);
        return NextResponse.json(
          { error: `Failed to store transactions: ${error.message}` },
          { status: 500 }
        );
      }

      console.log(`[SYNC] ✓ Upsert complete — duplicates skipped, new records inserted`);
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
