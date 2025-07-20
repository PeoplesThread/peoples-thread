# Google AdSense Setup Guide

Your AdSense integration is already implemented! Here's what you need to do to get ads showing:

## 🎯 Current Status
✅ AdSense script component created  
✅ AdBanner component implemented  
✅ Ad spots placed throughout the site  
✅ Environment variable fixed  

## 📋 Steps to Complete Setup

### 1. Get Your AdSense Client ID
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up or log into your account
3. Add your website domain
4. Wait for approval (can take 1-14 days)
5. Once approved, go to "Ads" → "By site" 
6. Find your Client ID (format: `ca-pub-xxxxxxxxxxxxxxxxx`)

### 2. Update Environment Variable
Replace the placeholder in `.env.local`:
```
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-your-actual-client-id-here
```

### 3. Create Ad Units (Optional but Recommended)
1. In AdSense dashboard, go to "Ads" → "By ad unit"
2. Create ad units for each slot:
   - `homepage-top`
   - `homepage-middle` 
   - `homepage-bottom`
   - `category-top`
   - `category-bottom`
   - `article-top`
   - `article-middle`
   - `article-bottom`
3. Copy the ad slot IDs and update your components if needed

## 🗺️ Current Ad Placements

### Homepage (`/`)
- Top banner after header
- Middle banner between featured articles
- Bottom banner before footer

### Category Pages (`/category/[category]`)
- Top banner after page title
- Bottom banner after articles list

### Article Pages (`/article/[slug]`)
- Top banner after article title
- Middle banner within article content
- Bottom banner after article content

## 🔧 Technical Details

### Components Used
- `AdSenseScript`: Loads Google AdSense JavaScript
- `AdBanner`: Renders individual ad units

### Environment Variables
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: Your AdSense client ID (must start with `NEXT_PUBLIC_` for client-side access)

## 🚀 Testing
1. Start your development server: `npm run dev`
2. Before AdSense approval: You'll see placeholder boxes
3. After AdSense approval: Real ads will appear

## 📊 Revenue Optimization Tips
1. **Ad Placement**: Current placements are optimized for user experience
2. **Responsive Design**: Ads automatically adapt to screen sizes
3. **Loading Performance**: Ads load after page interaction for better Core Web Vitals
4. **Content Policy**: Ensure your content complies with AdSense policies

## 🛠️ Troubleshooting

### Ads Not Showing?
1. Check if `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set correctly
2. Verify your site is approved in AdSense
3. Check browser console for errors
4. Ensure ad blockers are disabled during testing

### Performance Issues?
- Ads are loaded with `strategy="afterInteractive"` to minimize impact
- Consider implementing lazy loading for below-the-fold ads if needed

## 📈 Next Steps
1. Apply for AdSense approval
2. Monitor performance in AdSense dashboard
3. Experiment with ad sizes and placements
4. Consider implementing auto ads for additional revenue