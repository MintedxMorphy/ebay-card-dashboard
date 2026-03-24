# CardTrack — Session Context

**Live URL:** https://ebay-card-dashboard.vercel.app  
**Repo:** github.com/MintedxMorphy/ebay-card-dashboard  
**Stack:** Next.js, Supabase, Vercel, eBay Fulfillment API, eBay Browse API

---

## Working Features

✅ eBay OAuth fully connected (Production)  
✅ All 9 eBay sales syncing correctly with pagination  
✅ Correct card names, amounts, dates, categories  
✅ Sports/Pokemon categorization with Browse API fallback + Item Specifics  
✅ Collector keywords: case hit, sonic boom, sb-, refractor, RC, 1/1 etc.  
✅ Log a Buy form (manual entry)  
✅ Log a Sell form (manual entry)  
✅ Edit any transaction by clicking it  
✅ Profit Over Time chart working  
✅ Category Breakdown charts working  
✅ Include Other Sales toggle  

---

## Critical Warnings — DO NOT:

⚠️ **Drop or recreate the transactions table** — all data will be lost  
⚠️ **Change user_id column type** — VARCHAR not UUID. Changing this breaks everything  
⚠️ **Touch the eBay portal RuName config** — production OAuth depends on it  
⚠️ **Add ebay_transaction_id back** — removed for good reason; use ebay_order_id instead  

---

## Supabase Schema

### transactions table
```
id: UUID PRIMARY KEY
user_id: VARCHAR(255) NOT NULL
transaction_type: VARCHAR (buy|sell)
card_category: VARCHAR (sports|pokemon|other)
amount: DECIMAL(10,2)
card_name: VARCHAR(255)
ebay_order_id: VARCHAR(50) UNIQUE with user_id
transaction_date: TIMESTAMP (actual date of transaction, not insertion date)
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### users table
```
user_id: VARCHAR(255) PRIMARY KEY = 'gabriel_ebay_account'
ebay_access_token: TEXT
token_expires_at: TIMESTAMP
```

---

## Key Implementation Details

### Card Detection Logic (Priority Order)
1. **Title keywords** — Fast check for obvious cards (topps, panini, rookie, refractor, etc.)
2. **Collector keywords** — case hit, sonic boom, sb-, sp, ssp, 1/1, case break
3. **Browse API fallback** — If keyword checks fail, fetch item from eBay Browse API
4. **Item Specifics** — Parse localizedAspects array (Type, Sport, Game, Category fields)
5. **Description fallback** — Search item description for card keywords

### eBay API Integration
- **Fulfillment API** — Fetch sales orders (GET /sell/fulfillment/v1/order)
- **Browse API** — Fetch item details & localizedAspects (GET /buy/browse/v1/item/{itemId})
- **Pagination** — Automatically fetches all pages if total > 10 orders
- **Authentication** — App-level OAuth token (not user token)

### Date Handling
- Manual entries: User picks date in form → stored as transaction_date
- eBay syncs: order.creationDate → stored as transaction_date
- Display: Recent Transactions shows transaction_date, not created_at
- Charts: Aggregate by transaction_date for accurate profit tracking

### Transaction Editing
- Click any transaction in Recent Transactions list
- Modal opens pre-filled with card_name, category, amount, transaction_date
- PATCH /api/transactions/update updates existing row (no duplicates)

---

## Next Priorities

1. **Gamification** — XP system, trader ranks, badges
2. **AI card photo valuation** — Claude Vision API for condition/value assessment
3. **Inventory manager** — Track cards in collection, organize by set/sport
4. **Wishlist + price alerts** — Watch cards, alert when prices drop
5. **Weekly recap screen** — Profit summary, best performers, trends

---

## Last Commit

**7981b3d** — Browse API fallback + collector keywords fix  
Date: Tue Mar 24 12:43:01 2026 -0500

### What Was Fixed
- Browse API now fires for ANY item that fails isCardItem keyword check
- Added collector keywords (case hit, sonic boom, sb-, sp, ssp, case break, 1/1)
- Item Specifics parsing (localizedAspects) for structured card classification
- Stats query fixed to count only filtered transactions accurately
- eBay sync pagination added to fetch all orders beyond first page

---

## Session Protocol for Next Time

**BEFORE TOUCHING ANY CODE:**

1. Fetch and read: https://raw.githubusercontent.com/MintedxMorphy/zero-cool-brain/main/PROJECTS.md
2. Read CONTEXT.md in the current project repo (this file)
3. Summarize what you know about the project state
4. Ask what needs to be worked on
5. **DO NOT** modify any code until current state is confirmed

This ensures continuity and prevents stale assumptions.
