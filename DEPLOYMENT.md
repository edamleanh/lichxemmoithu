# Deployment Guide for Esports Calendar

## 🚀 Quick Deploy to Vercel

### 1. Environment Variables Setup

You need to set up environment variables in Vercel dashboard:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add the following variables:

```
Name: VITE_FOOTBALL_API_KEY
Value: your_football_data_org_api_key
Environment: Production, Preview, Development
```

### 2. Get Football API Key

1. Visit https://www.football-data.org/
2. Click "Register" to create free account
3. Verify your email
4. Go to your dashboard to get API token
5. Copy the token and paste it in Vercel environment variables

**Note:** Free tier allows 10 requests per minute, which is sufficient for this app.

### 3. Deploy

Once environment variables are set:

```bash
git push origin main
```

Vercel will automatically deploy when you push to main branch.

### 4. Verify Deployment

Check these endpoints work:
- `https://your-app.vercel.app/api/football/competitions`
- `https://your-app.vercel.app/api/lol`
- `https://your-app.vercel.app/api/valorant?q=live_score`

## 🔧 Local Development

### 1. Clone and Setup

```bash
git clone https://github.com/edamleanh/lichxemmoithu.git
cd lichxemmoithu
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env and add your API key
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Test APIs Locally

```bash
node test-api.js
```

## 🛠️ Troubleshooting

### Common Issues

**1. "Football API key not configured"**
- Solution: Add `VITE_FOOTBALL_API_KEY` to Vercel environment variables
- Make sure to redeploy after adding env vars

**2. "LoL API error: 500"**
- This is expected - LoL API is often unstable
- App automatically falls back to sample data
- No action needed

**3. "Valorant API timeout"**
- VLR.gg API can be slow sometimes
- App has 5-second timeout and fallback
- No action needed

### Vercel Function Logs

To debug API issues:
1. Go to Vercel dashboard
2. Click on "Functions" tab
3. Click on individual function to see logs
4. Look for console.log outputs

### Rate Limits

**Football API (free tier):**
- 10 requests per minute
- 10 requests per day for competitions
- App caches data and uses sample fallback

**Other APIs:**
- No rate limits
- May have occasional downtime
- Auto-fallback to sample data

## 📊 Monitoring

### Check API Health

The app includes built-in monitoring:
- APIs timeout after 5-10 seconds
- Automatic fallback to sample data
- Error logging in browser console
- Graceful degradation

### Performance

- Initial load: ~2-3 seconds
- API calls: ~1-2 seconds each
- Fallback activation: ~5-8 seconds
- UI remains responsive throughout

## 🎯 Production Tips

1. **Monitor Vercel function logs** for API errors
2. **Check environment variables** are set correctly  
3. **Verify API key validity** periodically
4. **Sample data fallback** ensures app always works
5. **Rate limit awareness** for football API

## 🔄 Updates

To update the app:
1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to main
4. Vercel auto-deploys
5. Check production logs if issues occur

## ✅ Success Checklist

- [ ] Environment variables set in Vercel
- [ ] Football API key obtained and configured
- [ ] App deploys without errors
- [ ] All sports categories show data (real or sample)
- [ ] Mobile responsive design works
- [ ] No console errors in production