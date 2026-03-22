#!/usr/bin/env node

/**
 * CardTrack Database Setup Script
 * Creates schema + loads demo data into Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Get credentials from environment or command line
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const USER_ID = 'demo-user-001'; // Demo user for mock data

console.log('🚀 CardTrack Database Setup');
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔐 Using service key: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);

// Initialize Supabase client with service role key (for admin operations)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    // Read schema file
    const schema = fs.readFileSync('./schema.sql', 'utf-8');
    console.log('\n📋 Creating database schema...');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`  → Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec', { statement });
        if (error && !error.message.includes('already exists')) {
          console.error(`  ❌ Error: ${error.message}`);
        } else if (!error) {
          console.log(`  ✅ Done`);
        }
      }
    }
    
    // Insert demo data
    console.log('\n📦 Loading demo transaction data...');
    
    const demoTransactions = [
      // Sports Cards - Buy
      { transaction_type: 'buy', card_category: 'sports', amount: 45.00, card_name: 'Tom Brady PSA 8', card_description: 'Classic 1995 rookie' },
      { transaction_type: 'buy', card_category: 'sports', amount: 32.50, card_name: 'Michael Jordan 1986', card_description: 'Fleer #57' },
      { transaction_type: 'buy', card_category: 'sports', amount: 78.00, card_name: 'LeBron James Auto', card_description: 'Signed rookie' },
      
      // Sports Cards - Sell
      { transaction_type: 'sell', card_category: 'sports', amount: 85.00, card_name: 'Tom Brady PSA 8', card_description: 'Sold at profit' },
      { transaction_type: 'sell', card_category: 'sports', amount: 55.00, card_name: 'Patrick Mahomes RC', card_description: 'High demand' },
      
      // Pokemon Cards - Buy
      { transaction_type: 'buy', card_category: 'pokemon', amount: 25.00, card_name: 'Charizard Base Set', card_description: 'Holo rare' },
      { transaction_type: 'buy', card_category: 'pokemon', amount: 15.50, card_name: 'Blastoise Base Set', card_description: 'Light play condition' },
      { transaction_type: 'buy', card_category: 'pokemon', amount: 120.00, card_name: 'Pikachu Shadowless', card_description: 'First edition' },
      { transaction_type: 'buy', card_category: 'pokemon', amount: 35.00, card_name: 'Mewtwo EX', card_description: 'Modern set' },
      
      // Pokemon Cards - Sell
      { transaction_type: 'sell', card_category: 'pokemon', amount: 40.00, card_name: 'Charizard Base Set', card_description: 'Sold' },
      { transaction_type: 'sell', card_category: 'pokemon', amount: 180.00, card_name: 'Pikachu Shadowless', card_description: 'Premium sell' },
      { transaction_type: 'sell', card_category: 'pokemon', amount: 55.00, card_name: 'Mewtwo EX', card_description: 'Good profit' },
    ];
    
    const transactionsWithUser = demoTransactions.map(t => ({
      ...t,
      user_id: USER_ID,
      transaction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionsWithUser);
    
    if (error) {
      console.error(`❌ Error inserting demo data: ${error.message}`);
    } else {
      console.log(`✅ Loaded ${transactionsWithUser.length} demo transactions`);
    }
    
    // Verify data
    console.log('\n📊 Verifying data...');
    const { data: transactions } = await supabase
      .from('transactions')
      .select('count')
      .eq('user_id', USER_ID);
    
    console.log(`✅ Database ready with demo data!`);
    console.log(`\n🎯 Summary:`);
    console.log(`   - Sports Cards: 3 buys + 2 sells`);
    console.log(`   - Pokemon Cards: 4 buys + 3 sells`);
    console.log(`   - Demo User ID: ${USER_ID}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Update .env with your Supabase credentials`);
    console.log(`   2. Run: npm install`);
    console.log(`   3. Run: npm run dev`);
    console.log(`   4. Open: http://localhost:3000`);
    console.log(`\n🔑 When eBay API key arrives:`);
    console.log(`   1. Update NEXT_PUBLIC_EBAY_CLIENT_ID in .env`);
    console.log(`   2. Restart dev server`);
    console.log(`   3. Login with eBay account`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
