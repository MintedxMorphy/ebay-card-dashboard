# Add eBay Credentials to Vercel

**Date:** 2026-03-23  
**Status:** Ready to deploy

---

## eBay Credentials (See Zero Cool for actual values)

⚠️ **Credentials are stored securely in Vercel env variables only**  
(Not in git for security)

- **App ID (Client ID):** [See Zero Cool / .env.local]
- **Cert ID (Client Secret):** [See Zero Cool / .env.local]
- **Redirect URI:** `https://ebay-card-dashboard.vercel.app/api/auth/callback/ebay`

---

## Add to Vercel (5 minutes)

1. Go to: https://vercel.com/mintedxmorphys-projects/ebay-card-dashboard/settings/environment-variables

2. Add **3 new variables** (values from Zero Cool):

**Variable 1:**
```
Name: EBAY_CLIENT_ID
Value: [YOUR_APP_ID_FROM_EBAY_PORTAL]
Select: Production, Preview, Development
```

**Variable 2:**
```
Name: EBAY_CLIENT_SECRET
Value: [YOUR_CERT_ID_FROM_EBAY_PORTAL]
Select: Production, Preview, Development
```

**Variable 3:**
```
Name: EBAY_REDIRECT_URI
Value: https://ebay-card-dashboard.vercel.app/api/auth/callback/ebay
Select: Production, Preview, Development
```

3. Click **"Save"** after each

4. Go to **Deployments** tab

5. Find latest deployment → click **"..."** → **"Redeploy"**

6. Wait 30-60 seconds for rebuild

---

## Verify

Once redeployed:
- Visit: https://ebay-card-dashboard.vercel.app/
- You should see **"Login with eBay"** button on home page
- Click it → eBay login flow
- After auth → pulls your real eBay sales data

---

## Notes

- These are **sandbox credentials** (SBX prefix = Sandbox)
- Safe for testing eBay API without affecting real account
- Once tested & working, can upgrade to **production credentials** (no SBX prefix)
- Keep these credentials safe — never commit to git

---

## After Deployment

Zero Cool will:
1. ✅ Wire the "Login with eBay" button
2. ✅ Test the OAuth flow
3. ✅ Sync your actual eBay card sales
4. ✅ Display real P&L data on dashboard
