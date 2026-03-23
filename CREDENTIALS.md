# CardTrack Credentials & Configuration

**Last Updated:** 2026-03-23  
**Status:** Active

---

## Supabase Configuration

### Project Details
- **Project URL:** https://phcnyxuypsibyacxytrl.supabase.co
- **Project ID:** phcnyxuypsibyacxytrl

### API Keys
- **Publishable/Anon Key:** `sb_publishable_ADn9oVJCUqlTfn1KP7WCVg_KsSJ1N5m`
  - Used for: Frontend requests to Supabase
  - Stored in: `.env.local` (NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - Visibility: Public (safe to expose in frontend)

### Database Connection
- **Connection String:** `postgresql://postgres:[YOUR-PASSWORD]@db.phcnyxuypsibyacxytrl.supabase.co:5432/postgres`
- **Host:** db.phcnyxuypsibyacxytrl.supabase.co
- **Port:** 5432
- **Database:** postgres
- **SSL:** Required
- **Status:** Active

---

## eBay Configuration

### Status: ✅ ACTIVE (Sandbox)
- **App ID (Client ID):** [Stored in .env.local + Vercel]
- **Cert ID (Client Secret):** [Stored in .env.local + Vercel]
- **Redirect URI:** `https://ebay-card-dashboard.vercel.app/api/auth/callback/ebay`
- **Environment:** Sandbox (SBX prefix = safe for testing)
- **Note:** Credentials stored securely, not in git

### Deployment Status
- ✅ `.env.local` updated (local development)
- ⏳ Vercel environment variables (pending manual add - see VERCEL_EBAY_SETUP.md)
- ✅ eBay Developer Portal (configured)

---

## Vercel Deployment

### Project
- **Name:** ebay-card-dashboard
- **Project ID:** prj_O4ANnDXphkJfZse0L5LX3FZWUFyB
- **Org ID:** team_S0ZEj6gwKegcWqeLY73RWwPp
- **URL:** https://ebay-card-dashboard.vercel.app/
- **Status:** Active

### Environment Variables (Vercel)
To deploy, ensure these are set in Vercel Dashboard (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL = https://phcnyxuypsibyacxytrl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_ADn9oVJCUqlTfn1KP7WCVg_KsSJ1N5m
EBAY_CLIENT_ID = [PENDING]
EBAY_CLIENT_SECRET = [PENDING]
EBAY_REDIRECT_URI = https://ebay-card-dashboard.vercel.app/api/auth/callback/ebay
```

---

## GitHub Repository

- **Repo:** https://github.com/MintedxMorphy/ebay-card-dashboard
- **Branch:** main
- **Status:** Synced

---

## Next Steps

1. ✅ Supabase credentials configured locally
2. ⏳ Push Supabase env vars to Vercel (Gregory via Vercel Dashboard)
3. ⏳ Provide eBay Client ID & Secret
4. ⏳ Update Vercel with eBay credentials
5. ⏳ Test OAuth flow
6. ⏳ Verify transaction sync

---

## Security Notes

- ⚠️ Supabase publishable key is intentionally public (frontend use only)
- ⚠️ Service role key should only be stored in backend/Vercel
- ⚠️ Never commit `.env.local` to git (already in .gitignore)
- ✅ All secrets are environment-variable based (not hardcoded)
