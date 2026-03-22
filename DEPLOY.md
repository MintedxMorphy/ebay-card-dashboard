# Deployment Guide - CardTrack

Deploy your eBay card dashboard to Vercel in 5 minutes.

## Prerequisites

- GitHub account with your code pushed
- Vercel account (free)
- All environment variables from SETUP.md

## Step 1: Update eBay Redirect URI

Before deploying, update your eBay app settings:

1. Go to eBay Developer Portal
2. Edit your application
3. Update **OAuth Token URL** to:
   ```
   https://yourdomain.vercel.app/api/auth/callback/ebay
   ```
   (Replace `yourdomain` with your actual Vercel domain)

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Fastest)

```bash
npm install -g vercel
vercel --prod
```

Follow the prompts and add your environment variables when asked.

### Option B: Using GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/ebay-card-dashboard.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New..." → "Project"

4. Select your GitHub repo

5. In "Environment Variables", add:
   ```
   EBAY_CLIENT_ID=your_ebay_client_id
   EBAY_CLIENT_SECRET=your_ebay_client_secret
   EBAY_REDIRECT_URI=https://yourdomain.vercel.app/api/auth/callback/ebay
   
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=https://yourdomain.vercel.app
   ```

6. Click "Deploy"

## Step 3: Verify Deployment

Once deployed:

1. Visit your Vercel domain
2. Click "Login with eBay"
3. Complete eBay OAuth flow
4. Check if dashboard loads

## Step 4: Update Your Domain

To use a custom domain:

1. In Vercel Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration steps
4. Update eBay redirect URI to your custom domain

## Troubleshooting

### 502/503 Errors
- Check that all environment variables are set
- Verify Supabase database is accessible
- Check Vercel logs: `vercel logs [URL]`

### OAuth Not Working
- Verify eBay Client ID/Secret are correct
- Ensure redirect URI matches exactly
- Check for typos in EBAY_REDIRECT_URI

### Database Errors
- Verify Supabase credentials
- Ensure schema is created
- Check Supabase is in the same region

## Monitoring

### Check Logs
```bash
vercel logs https://yourdomain.vercel.app
```

### View Real-time
```bash
vercel logs https://yourdomain.vercel.app --follow
```

## Cost Estimate

- **Vercel:** Free tier (5 GB bandwidth/month)
- **Supabase:** Free tier (500 MB database)
- **eBay API:** Free for authenticated requests

**Total: $0/month** ✨

## Performance Tips

1. **Enable Caching** - Vercel caches by default
2. **Optimize Images** - Use Next.js Image component
3. **Monitor Usage** - Check Supabase dashboard monthly
4. **Schedule Syncs** - Use cron jobs to sync off-peak

## Next Steps

1. ✅ Deploy to Vercel
2. ⬜ Add custom domain
3. ⬜ Enable Supabase backups
4. ⬜ Set up monitoring alerts
5. ⬜ Add Google Analytics

---

Your dashboard is now live! 🚀
