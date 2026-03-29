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
✅ All Transactions displayed (no limit — shows entire history with scrolling)  

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

## Status Update (March 28, 2026 — LATEST)

**✅ Completed Today (March 28):**
- ✅ Home page branding refresh (removed Gabriel, cleaned up logo)
- ✅ Edge News feature with Sports/Pokemon toggle buttons
- ✅ Edge News search field (local feed search, not web search yet)
- ✅ 12 articles minimum (6 sports + 6 pokemon) showing in feed
- ✅ All deployed and live

**⚠️ Known Limitation:**
- Search function only searches local headlines in feed, not the web at large
- Tom Brady search returns nothing because he's not in the current feed headlines
- **Next session:** Enhance search to query web (Perplexity API) for real-time player/card info

**Production Status:** 🟢 STABLE AND LIVE
- All existing features working (eBay sync, P&L, charts, transactions)
- Edge News widget fully integrated with toggles + local search
- No data loss risk

---

## Recent Commits (March 28)

**6434da5** — Add Sports/Pokemon toggle + search field to Edge News  
**c01bd34** — Simplify API, remove aggressive date filtering  
**Latest merge** — Full integration tested, 12 articles showing

---

## Next Priorities

1. **Edge News Web Search** — Search player/card names via Perplexity to show real-time market intel + impact
2. **Gamification** — XP system, trader ranks, badges
3. **AI card photo valuation** — Claude Vision API for condition/value assessment
4. **Inventory manager** — Track cards in collection, organize by set/sport
5. **Wishlist + price alerts** — Watch cards, alert when prices drop

---

## Session Protocol for Next Time

**BEFORE TOUCHING ANY CODE:**

1. Fetch and read: https://raw.githubusercontent.com/MintedxMorphy/zero-cool-brain/main/PROJECTS.md
2. Read CONTEXT.md in the current project repo (this file)
3. Summarize what you know about the project state
4. Ask what needs to be worked on
5. **DO NOT** modify any code until current state is confirmed

This ensures continuity and prevents stale assumptions.
