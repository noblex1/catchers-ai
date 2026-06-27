# Frontend Deployment Guide - Vercel

This guide covers deploying the Catchers AI frontend to Vercel.

## 🚀 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code should be in a GitHub repository
3. **Backend & ML Service URLs**: You need the deployed backend and ML service URLs

## 📦 Pre-Deployment Checklist

### 1. Verify Build Works Locally

```bash
cd frontend
npm install
npm run build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

### 2. Prepare Environment Variables

You'll need these URLs from your deployed services:
- **Backend API URL**: Your Render backend URL (e.g., `https://catchers-ai-backend.onrender.com`)
- **ML Service URL**: Your Render ML service URL (e.g., `https://catchers-ai-ml-service.onrender.com`)

## 🎯 Deployment Methods

### Method 1: Vercel CLI (Recommended for first deployment)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**:
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts**:
   ```
   ? Set up and deploy "~/catchers-ai/frontend"? [Y/n] y
   ? Which scope do you want to deploy to? [Your Account]
   ? Link to existing project? [y/N] n
   ? What's your project's name? catchers-ai-frontend
   ? In which directory is your code located? ./
   ```

5. **Configure Environment Variables**:
   During deployment, add:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard (Easiest)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Select the repository

2. **Configure Project**:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

3. **Environment Variables**:
   Add these in the Vercel dashboard:
   
   | Name | Value | Description |
   |------|-------|-------------|
   | `VITE_API_BASE_URL` | `https://your-backend.onrender.com` | Backend API URL |
   | `VITE_APP_NAME` | `Catchers AI` | App name |

   **Important**: Don't include trailing slashes in URLs.

4. **Deploy**:
   - Click **"Deploy"**
   - Vercel will build and deploy automatically
   - First deployment takes ~2-3 minutes

### Method 3: GitHub Integration (Continuous Deployment)

1. **Install Vercel GitHub App**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Connect your GitHub account
   - Install Vercel app for your repository

2. **Configure Auto-Deploy**:
   - Every push to `main` branch auto-deploys to production
   - Pull requests get preview deployments
   - Automatic rollback on errors

## 🔧 Post-Deployment Configuration

### 1. Get Your Frontend URL

After deployment, Vercel provides URLs like:
```
Production: https://catchers-ai-frontend.vercel.app
Preview: https://catchers-ai-frontend-git-[branch].vercel.app
```

### 2. Update Backend CORS

Update your backend's CORS configuration to allow your Vercel domain:

In `backend/src/server.ts`:
```typescript
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'https://catchers-ai-frontend.vercel.app',
    'https://*.vercel.app' // For preview deployments
  ],
  credentials: true
};
```

Redeploy your backend after updating CORS.

### 3. Test the Deployment

Visit your deployed URL and test:
- [ ] Homepage loads
- [ ] URL scanning works
- [ ] File scanning works
- [ ] History page works
- [ ] PDF export works
- [ ] PWA install prompt appears (on mobile)

### 4. Configure Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Enable automatic HTTPS

## 📊 Monitoring and Analytics

### Vercel Analytics

1. **Enable Analytics**:
   - Go to project settings in Vercel
   - Enable **"Vercel Analytics"**
   - Free tier includes: Web Vitals, page views, visitor data

2. **Speed Insights**:
   - Monitors Core Web Vitals
   - Real user metrics (RUM)
   - Performance scoring

### View Logs

1. Go to your project in Vercel Dashboard
2. Click **"Deployments"**
3. Select a deployment
4. View build logs and runtime logs

## ⚙️ Configuration Options

### Build Configuration

Edit `vercel.json` for advanced settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables by Environment

Set different values for different environments:

| Environment | When Used |
|-------------|-----------|
| Production | Main branch deployments |
| Preview | Pull request deployments |
| Development | Local development |

Example:
```
Production VITE_API_BASE_URL: https://api.catchers.ai
Preview VITE_API_BASE_URL: https://staging-api.catchers.ai
```

### Performance Optimization

**Already Configured**:
- ✅ Asset caching (1 year for static assets)
- ✅ Compression (Brotli/Gzip)
- ✅ CDN distribution (global edge network)
- ✅ Automatic HTTPS
- ✅ HTTP/2 & HTTP/3

**Additional Optimizations**:
1. **Enable Edge Caching**: Done via headers in `vercel.json`
2. **Image Optimization**: Use Vercel Image Optimization
3. **Serverless Functions**: For API routes (if needed)

## 🔄 Update Deployment

### Automatic Updates (Recommended)

With GitHub integration:
1. Push changes to your repository
2. Vercel automatically builds and deploys
3. Zero downtime deployment

### Manual Updates

Using Vercel CLI:
```bash
cd frontend
vercel --prod
```

### Rollback

If something goes wrong:
1. Go to **"Deployments"** in Vercel Dashboard
2. Find a previous working deployment
3. Click **"..."** → **"Promote to Production"**

## 🐛 Troubleshooting

### Issue: Build fails

**Error**: `Build failed with exit code 1`

**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure `package.json` scripts are correct
3. Verify all dependencies are in `dependencies` (not `devDependencies`)
4. Test build locally: `npm run build`

### Issue: Environment variables not working

**Error**: `VITE_API_BASE_URL is undefined`

**Solutions**:
1. Ensure variable name starts with `VITE_`
2. Redeploy after adding env vars (they're only loaded at build time)
3. Check variable is set in correct environment (Production/Preview)

### Issue: 404 on page refresh

**Error**: `404 Page Not Found` when refreshing `/scan` or `/history`

**Solution**: 
- Ensure `vercel.json` has the rewrite rule:
  ```json
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
  ```

### Issue: API calls failing (CORS errors)

**Error**: `Access to fetch at 'https://api...' has been blocked by CORS policy`

**Solutions**:
1. Update backend CORS to include Vercel domain
2. Ensure `VITE_API_BASE_URL` doesn't have trailing slash
3. Check backend is deployed and accessible

### Issue: Build works locally but fails on Vercel

**Solutions**:
1. Check Node version compatibility
2. Clear Vercel build cache: Redeploy with "Clear Cache and Deploy"
3. Ensure all imports use correct casing (Linux is case-sensitive)
4. Check for Windows-specific path separators

### Issue: Large bundle size warning

**Solutions**:
1. Enable code splitting in Vite config
2. Lazy load routes with React.lazy()
3. Analyze bundle: `npm run build -- --analyze`
4. Remove unused dependencies

## 💰 Cost Estimates

### Free Tier (Hobby)
- **Cost**: $0/month
- **Includes**:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Serverless functions (100GB-Hrs)
  - 6,000 build minutes/month

### Pro Plan
- **Cost**: $20/month
- **Includes**:
  - 1TB bandwidth/month
  - Advanced analytics
  - Password protection
  - Custom domains (unlimited)

**For Catchers AI Frontend**: Free tier is sufficient for most use cases.

## 🔐 Security Features

**Included by Default**:
- ✅ Automatic HTTPS/SSL
- ✅ DDoS protection
- ✅ Firewall rules
- ✅ Security headers (configured in `vercel.json`)

**Additional Security**:
1. **Password Protection** (Pro plan):
   - Protect preview deployments
   - Staging environment access control

2. **Environment Variables**:
   - Encrypted at rest
   - Never exposed in client bundle (unless prefixed with `VITE_`)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [React Router on Vercel](https://vercel.com/guides/deploying-react-with-vercel)

## ✅ Deployment Checklist

- [ ] Local build tested successfully
- [ ] Backend URL obtained and verified
- [ ] Vercel account created
- [ ] Project deployed via CLI or dashboard
- [ ] Environment variables configured
- [ ] Custom domain configured (optional)
- [ ] Backend CORS updated with Vercel domain
- [ ] End-to-end testing completed
- [ ] PWA features tested on mobile
- [ ] Analytics enabled
- [ ] GitHub integration configured for auto-deploy

## 🔗 Integration with Backend

### Update Backend to Accept Frontend

1. **Backend CORS Configuration**:
   ```typescript
   // backend/src/server.ts
   const corsOptions = {
     origin: [
       'http://localhost:8080',
       'https://catchers-ai-frontend.vercel.app',
       'https://*.vercel.app'
     ],
     credentials: true
   };
   ```

2. **Redeploy Backend**:
   ```bash
   git add backend/src/server.ts
   git commit -m "Update CORS for Vercel frontend"
   git push
   ```

3. **Test Integration**:
   - Scan a URL from deployed frontend
   - Check Network tab for API calls
   - Verify no CORS errors

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Frontend loads at Vercel URL
- ✅ Can scan URLs successfully
- ✅ Can upload and scan files
- ✅ History persists in localStorage
- ✅ PDF export works
- ✅ No console errors
- ✅ PWA installable on mobile devices
- ✅ Performance score >90 (Lighthouse)

---

**Need Help?** Check the [main deployment documentation](../README.md) or [Vercel Support](https://vercel.com/support).
