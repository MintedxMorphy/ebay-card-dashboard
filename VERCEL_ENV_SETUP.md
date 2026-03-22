# Vercel Environment Variables Setup

The dashboard needs your Supabase credentials in Vercel to work.

## Quick Setup (5 minutes)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/mintedxmorphys-projects
   - Click on "ebay-card-dashboard"
   - Click "Settings" → "Environment Variables"

2. **Add these environment variables:**

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://phcnyxuypsibyacxytrl.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_aF5ly5VbBmjqre_noPyxOg_03D8_LG1
   ```

3. **Click "Save"**

4. **Redeploy:**
   - Go to "Deployments" tab
   - Click the "..." on the latest deployment
   - Select "Redeploy"
   - Wait 30 seconds for new build

5. **Refresh the dashboard** - should load now!

---

## What These Do

- `NEXT_PUBLIC_SUPABASE_URL` - Tells the app where your Supabase database lives
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key for accessing Supabase (safe to expose)

Both are needed for the dashboard to fetch your demo card data.

---

That's it! Dashboard will be live once Vercel redeploys with these variables.
