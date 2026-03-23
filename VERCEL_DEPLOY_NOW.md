# 🚀 Deploy CardTrack to Vercel NOW

**Status:** Ready to go live with Supabase configured

---

## What You Need to Do (5 minutes)

### Step 1: Add Supabase to Vercel Environment

1. Go to: https://vercel.com/mintedxmorphys-projects/ebay-card-dashboard/settings/environment-variables

2. Click "Add New Environment Variable" and add these two:

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://phcnyxuypsibyacxytrl.supabase.co
Select: Production, Preview, Development
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_ADn9oVJCUqlTfn1KP7WCVg_KsSJ1N5m
Select: Production, Preview, Development
```

3. Click "Save"

### Step 2: Redeploy

1. Go to: https://vercel.com/mintedxmorphys-projects/ebay-card-dashboard/deployments

2. Find the latest deployment (top of the list)

3. Click the three dots (...) on the right

4. Select "Redeploy"

5. Wait 30-60 seconds for the new deployment

### Step 3: Verify

1. Visit: https://ebay-card-dashboard.vercel.app/

2. The dashboard should load without errors

3. You'll see the home page with the neon green/pink aesthetic

---

## That's It!

Once those 2 environment variables are in Vercel and you redeploy, the app will:
- ✅ Connect to Supabase database
- ✅ Load demo card data
- ✅ Show P&L charts
- ✅ Display stats cards

---

## What Happens Next

Once live, we'll add:
1. **eBay OAuth** - When you provide eBay credentials
2. **Real eBay Data Sync** - Pull actual card sales
3. **Gamification** - XP, badges, ranks
4. **AI Card Vision** - Photo identification

---

## Questions?

If you get an error after redeploy:
- Check Supabase is accessible: https://phcnyxuypsibyacxytrl.supabase.co
- Verify keys are exactly as provided (no extra spaces)
- Check Vercel logs: https://vercel.com/mintedxmorphys-projects/ebay-card-dashboard/logs
