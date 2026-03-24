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
    console.log('=== RAW EBAY RESPONSE ===');
    console.log(JSON.stringify(salesData, null, 2));
    console.log('=== END EBAY RESPONSE ===');
    
    const orders = salesData.orders || [];
    console.log(`Total orders returned: ${orders.length}`);

    // Filter card items and store in Supabase
    const cardTransactions = [];

    for (const order of orders) {
      console.log('Processing order:', order.orderId);
      console.log('Order line items:', JSON.stringify(order.lineItems, null, 2));
      
      for (const item of order.lineItems || []) {
        console.log('Item title:', item.title);
        console.log('Item full object:', JSON.stringify(item, null, 2));
        
        const cardType = isCardItem(item.title);
        console.log('Detected card type:', cardType);

        if (cardType) {
          const amount = parseFloat(item.lineItemPrice?.value || '0');
          console.log('Extracted amount:', amount);
          
          cardTransactions.push({
            user_id: userId,
            transaction_type: 'sell',
            card_category: cardType,
            amount: amount,
          });
        }
      }
    }
    
    console.log(`Total card transactions to insert: ${cardTransactions.length}`);
    console.log('Card transactions:', JSON.stringify(cardTransactions, null, 2));

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
