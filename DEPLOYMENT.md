# Deployment Guide

## Overview

This guide covers deploying Contact Outreach Pro to production. The app can be deployed to multiple platforms.

---

## Prerequisites

Before deploying, ensure:
- ✅ App runs locally with `npm run dev`
- ✅ All tests pass
- ✅ Environment variables are configured
- ✅ Database is set up in Supabase
- ✅ Code is pushed to GitHub (recommended)

---

## Option 1: Vercel (Recommended)

### Why Vercel?
- Easiest deployment
- Automatic HTTPS
- Free tier available
- Optimal performance
- Built for Next.js/React apps
- Auto-deploys on GitHub push

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/contact-outreach-pro.git

# Push
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Click **"Import"**

### Step 3: Add Environment Variables

In Vercel project settings:
1. Go to **Settings** > **Environment Variables**
2. Add these variables:
   - **VITE_SUPABASE_URL**: Your Supabase URL
   - **VITE_SUPABASE_ANON_KEY**: Your Supabase Anon Key
3. Click **"Save"**

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-3 minutes)
3. Get your URL (e.g., https://my-app.vercel.app)

### Step 5: Set Custom Domain (Optional)

1. In Vercel: Settings > Domains
2. Add your domain
3. Follow DNS instructions
4. Wait for verification (15-30 minutes)

### Auto-Deploy on Push

After setup, Vercel automatically:
- Watches GitHub repository
- Deploys on every push to main
- Builds and tests automatically
- Shows deployment status

---

## Option 2: Netlify

### Step 1: Build the Project

```bash
npm run build
```

This creates a `dist/` folder with the production build.

### Step 2: Deploy to Netlify

#### Method A: Drag & Drop

1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in
3. Drag the `dist/` folder onto the deploy area
4. Done! You have a live site

#### Method B: GitHub Integration

1. Go to [netlify.com](https://netlify.com)
2. Click **"New site from Git"**
3. Select GitHub
4. Choose your repository
5. Set build command: `npm run build`
6. Set publish directory: `dist`
7. Add environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
8. Click **"Deploy"**

### Step 3: Add Custom Domain

1. In Netlify: Domain settings
2. Add your domain
3. Update DNS records
4. Enable HTTPS (automatic)

---

## Option 3: AWS Amplify

### Step 1: Connect GitHub

1. Go to [AWS Amplify](https://console.aws.amazon.com/amplify)
2. Click **"New app"** > **"Host web app"**
3. Select GitHub
4. Authorize Amplify
5. Choose your repository
6. Select branch (main)

### Step 2: Configure Build

1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Add environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

### Step 3: Deploy

1. Click **"Save and deploy"**
2. Wait for build (3-5 minutes)
3. Get your domain

---

## Option 4: Docker + Cloud Run (Google Cloud)

### Step 1: Create Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create nginx.conf

```nginx
events {
  worker_connections 1024;
}

http {
  server {
    listen 80;
    location / {
      root /usr/share/nginx/html;
      try_files $uri /index.html;
    }
  }
}
```

### Step 3: Build & Push

```bash
# Build Docker image
docker build -t contact-outreach-pro .

# Test locally
docker run -p 8080:80 contact-outreach-pro

# Push to Docker Hub
docker tag contact-outreach-pro YOUR_USERNAME/contact-outreach-pro
docker push YOUR_USERNAME/contact-outreach-pro
```

### Step 4: Deploy to Cloud Run

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click **"Create Service"**
3. Select your Docker image
4. Set environment variables
5. Deploy

---

## Environment Variables for Production

### Required Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Variables

```
# Analytics
VITE_ANALYTICS_ID=google-analytics-id

# API
VITE_API_BASE_URL=https://api.example.com

# Features
VITE_ENABLE_INTEGRATIONS=true
VITE_ENABLE_ANALYTICS=true
```

---

## Pre-Deployment Checklist

- [ ] All code committed to Git
- [ ] Environment variables set
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Database migrations applied
- [ ] Test user created in Supabase
- [ ] Email templates configured
- [ ] Analytics configured (optional)
- [ ] HTTPS enabled
- [ ] Domain configured (optional)

---

## Post-Deployment Verification

After deploying:

1. **Visit your URL** - Should see login page
2. **Create account** - Test registration
3. **Add contact** - Test database write
4. **Create template** - Test features
5. **Send test email** - Verify functionality
6. **Check logs** - No errors in console

---

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm install -g source-map-explorer
source-map-explorer 'dist/**/*.js'
```

### Database Optimization

- Ensure indexes are created (already done)
- Monitor slow queries
- Archive old data periodically
- Use pagination for large lists

### Caching

- Enable Supabase caching
- Use HTTP caching headers
- Configure CDN caching

---

## Monitoring & Logging

### Vercel Monitoring
- Go to Dashboard > Monitoring
- View performance metrics
- Check error logs

### Netlify Monitoring
- Go to Analytics
- View traffic
- Check build logs

### Supabase Monitoring
- Go to Database > Usage
- View connection count
- Check query performance

---

## Continuous Integration

### GitHub Actions (Auto-Deploy)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run lint
      
      # Deploy to Vercel
      - name: Deploy to Vercel
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## Troubleshooting Deployments

### Build Fails

**Problem**: Build fails with error

**Solutions**:
- Check Node.js version (need v16+)
- Check environment variables are set
- Check package.json exists
- Run `npm install` locally first

### App Shows Blank Page

**Problem**: Deployed app shows blank page

**Solutions**:
- Check VITE_SUPABASE_URL is correct
- Check VITE_SUPABASE_ANON_KEY is correct
- Check browser console for errors
- Verify Supabase project is active

### Database Connection Error

**Problem**: "Cannot connect to Supabase"

**Solutions**:
- Verify credentials in environment
- Check Supabase project is active (not paused)
- Check API is accessible from your region
- Test connection in Supabase dashboard

### Performance Issues

**Problem**: App loads slowly

**Solutions**:
- Check build size: `npm run build` should be < 500KB
- Enable database indexes
- Configure CDN caching
- Optimize images

---

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Set strong password for Supabase
- [ ] Enable 2FA on accounts
- [ ] Configure CORS if needed
- [ ] Review RLS policies
- [ ] Set up backup schedule
- [ ] Monitor activity logs

---

## Backup & Recovery

### Automated Backups (Supabase)

Supabase automatically backs up daily. To restore:
1. Go to Supabase Settings > Backups
2. Select backup date
3. Click restore
4. Confirm

### Manual Backups

```bash
# Export data from Supabase
# In Supabase: SQL Editor > select all data > export
```

---

## Scaling Considerations

### When Your App Grows

As you scale, consider:
- Upgrade Supabase plan
- Enable database replication
- Use caching layer (Redis)
- Implement API rate limiting
- Optimize database queries
- Increase server resources

### Supabase Plans

- **Free**: Up to 500 MB storage
- **Pro**: Unlimited storage, advanced features
- **Enterprise**: Custom requirements

---

## Cost Estimates

### Vercel
- Free tier: Perfect for testing
- Hobby: $20/month (more bandwidth)
- Pro: $20/month + usage

### Netlify
- Free tier: Perfect for testing
- Starter: $19/month
- Pro: $99/month

### Supabase
- Free: 500 MB storage
- Pro: $25/month + usage
- Pay as you go for excess

### Total Monthly Cost
- **Free**: $0 (great for learning)
- **Basic**: $25-50
- **Production**: $50-200+

---

## Domain Setup

### Vercel
1. Settings > Domains
2. Add your domain
3. Update nameservers at registrar
4. Wait for verification

### Netlify
1. Domain settings
2. Add your domain
3. Update nameservers
4. Wait for verification

### Using Subdomains

```
main-app.example.com → Vercel
api.example.com → Server
static.example.com → CDN
```

---

## SSL/HTTPS

All major platforms provide automatic HTTPS:
- ✅ Vercel: Automatic
- ✅ Netlify: Automatic
- ✅ AWS: Automatic with ACM
- ✅ Docker: Configure in nginx

---

## Rollback & Updates

### Vercel Rollback
1. Deployments page
2. Select previous deployment
3. Click "Redeploy"

### Netlify Rollback
1. Deploy history
2. Select previous deployment
3. Click "Publish deploy"

### Update Process
1. Make code changes
2. Test locally
3. Commit to Git
4. Platform auto-deploys
5. Verify in production

---

## Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **AWS Docs**: https://docs.aws.amazon.com
- **Supabase Docs**: https://supabase.com/docs

---

## Next Steps

1. **Choose platform** - Vercel (recommended) or another
2. **Follow steps** - Deploy your app
3. **Verify** - Test all features
4. **Configure** - Add custom domain
5. **Monitor** - Watch performance metrics
6. **Celebrate!** - You're live! 🎉

---

**Your app is now live!** 🚀
