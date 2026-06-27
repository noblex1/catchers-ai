# Catchers AI - Complete Deployment Guide

This is the master deployment guide for deploying the complete Catchers AI system.

## 🏗️ Architecture Overview

The Catchers AI system consists of three separate services:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Devices                        │
│                    (Browsers, Mobile)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                        │
│              React + Vite + TailwindCSS                     │
│           https://catchers-ai.vercel.app                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Render)                         │
│              Node.js + Express + MongoDB                    │
│       https://catchers-ai-backend.onrender.com              │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             │ REST API                  │ Database
             ▼                           ▼
┌────────────────────────┐    ┌──────────────────────┐
│   ML Service (Render)  │    │  MongoDB Atlas       │
│   Python + FastAPI     │    │  (Database)          │
│   Scikit-learn         │    │                      │
└────────────────────────┘    └──────────────────────┘
```

## 📋 Prerequisites

Before starting deployment:

- [ ] GitHub account with repository access
- [ ] Render account ([render.com](https://render.com))
- [ ] Vercel account ([vercel.com](https://vercel.com))
- [ ] MongoDB Atlas account (already setup - backend deployed)
- [ ] Git installed locally
- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed

## 🎯 Deployment Order

**IMPORTANT**: Deploy in this specific order:

1. ✅ **Backend** - Already deployed on Render
2. 🔄 **ML Service** - Deploy to Render (this guide)
3. 🔄 **Frontend** - Deploy to Vercel (this guide)

## 📦 Step 1: Prepare ML Service for Deployment

### 1.1 Train the Model

The ML model must be trained before deployment:

```bash
cd ml-service
pip install -r requirements.txt
python -m app.train_model_improved
```

This creates:
- `app/models/phishing_detector.pkl` (~5-50MB)
- `app/models/model_metadata.json`

### 1.2 Verify Model Exists

```bash
ls -lh app/models/
# You should see:
# phishing_detector.pkl
# model_metadata.json
```

### 1.3 Test Locally

```bash
# Start ML service
uvicorn app.main:app --reload --port 5000

# In another terminal, test
curl http://localhost:5000/health
curl -X POST http://localhost:5000/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 1.4 Commit Model to Repository

```bash
git add ml-service/app/models/
git add ml-service/Dockerfile
git add ml-service/render.yaml
git add ml-service/.dockerignore
git commit -m "Prepare ML service for Render deployment"
git push origin main
```

## 🚀 Step 2: Deploy ML Service to Render

### Option A: Using Blueprint (render.yaml) - Recommended

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create New Blueprint**:
   - Click **"New +"** → **"Blueprint"**
   - Select **"Connect a repository"**
   - Choose your GitHub repository
   - Render will detect `ml-service/render.yaml`

3. **Review Configuration**:
   - Service name: `catchers-ai-ml-service`
   - Plan: Starter (Free) or Standard ($7/mo)
   - Click **"Apply"**

4. **Wait for Deployment** (~5-10 minutes):
   - Monitor build logs
   - Wait for "Live" status

5. **Get ML Service URL**:
   ```
   https://catchers-ai-ml-service.onrender.com
   ```

### Option B: Manual Setup

See detailed instructions in `ml-service/DEPLOYMENT.md`

### 2.1 Verify ML Service Deployment

```bash
# Test health endpoint
curl https://catchers-ai-ml-service.onrender.com/health

# Should return:
# {
#   "status": "healthy",
#   "model_loaded": true,
#   "model_version": "1.0.0"
# }

# Test analysis endpoint
curl -X POST https://catchers-ai-ml-service.onrender.com/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 🔧 Step 3: Update Backend with ML Service URL

### 3.1 Update Backend Environment Variables

1. Go to your backend service in Render Dashboard
2. Click **"Environment"** tab
3. Add/Update environment variable:
   ```
   ML_SERVICE_URL=https://catchers-ai-ml-service.onrender.com
   ```
4. Click **"Save Changes"**
5. Backend will automatically redeploy

### 3.2 Verify Backend Integration

```bash
# Test backend health
curl https://catchers-ai-backend.onrender.com/health

# Test threat analysis (should now use ML service)
curl -X POST https://catchers-ai-backend.onrender.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://suspicious-site.tk"}'

# Check response includes ML predictions
```

## 🌐 Step 4: Deploy Frontend to Vercel

### 4.1 Prepare Frontend

```bash
cd frontend

# Test build locally
npm install
npm run build
npm run preview

# Visit http://localhost:4173 to verify
```

### 4.2 Deploy to Vercel

#### Using Vercel CLI:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Set up new project
# - Name: catchers-ai-frontend
# - Settings: Accept defaults

# Deploy to production
vercel --prod
```

#### Using Vercel Dashboard:

1. **Go to Vercel**: https://vercel.com/dashboard

2. **Import Project**:
   - Click **"Add New..."** → **"Project"**
   - Select your GitHub repository
   - Click **"Import"**

3. **Configure Build**:
   - Framework: Vite (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**:
   ```
   VITE_API_BASE_URL=https://catchers-ai-backend.onrender.com
   VITE_APP_NAME=Catchers AI
   ```
   
   **Important**: No trailing slash in URL!

5. **Deploy**: Click **"Deploy"**

6. **Wait for Deployment** (~2-3 minutes)

### 4.3 Get Frontend URL

After deployment:
```
https://catchers-ai-frontend.vercel.app
```

Or your custom domain if configured.

## 🔐 Step 5: Configure CORS

### 5.1 Update Backend CORS Settings

Your backend needs to allow requests from the Vercel frontend:

```typescript
// backend/src/server.ts
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://catchers-ai-frontend.vercel.app',
    'https://*.vercel.app' // For preview deployments
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 5.2 Update ML Service CORS (Optional)

If you want ML service to be directly accessible from frontend:

```python
# ml-service/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://catchers-ai-frontend.vercel.app",
        "https://catchers-ai-backend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5.3 Redeploy Backend

```bash
git add backend/src/server.ts
git commit -m "Update CORS for Vercel frontend"
git push origin main

# Render will auto-deploy if connected to GitHub
# Or manually trigger deployment in Render dashboard
```

## ✅ Step 6: End-to-End Testing

### 6.1 Test Frontend

Visit your Vercel URL: `https://catchers-ai-frontend.vercel.app`

Test all features:
- [ ] Homepage loads correctly
- [ ] URL scanning works
- [ ] Results display ML predictions
- [ ] File upload works
- [ ] History page works
- [ ] PDF export works
- [ ] PWA install prompt (mobile)
- [ ] No console errors

### 6.2 Test Backend Integration

Open browser DevTools (Network tab):
- [ ] API calls go to correct backend URL
- [ ] No CORS errors
- [ ] Responses include ML predictions
- [ ] Error handling works

### 6.3 Test ML Service Integration

Check a scan result includes:
- [ ] `ml_score` field
- [ ] `ml_confidence` field
- [ ] `ml_prediction` field
- [ ] High accuracy predictions

### 6.4 Performance Testing

Test with Lighthouse (Chrome DevTools):
- [ ] Performance: >90
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >90

## 📊 Step 7: Monitoring Setup

### 7.1 Render Monitoring

For both ML Service and Backend:
1. Enable notifications in Render dashboard
2. Set up alerts for downtime
3. Monitor resource usage

### 7.2 Vercel Analytics

1. Go to Vercel project settings
2. Enable **"Analytics"** (free)
3. Enable **"Speed Insights"** (free)
4. Monitor Web Vitals

### 7.3 Error Tracking (Optional)

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **PostHog** for product analytics

## 🔄 Step 8: Continuous Deployment

### 8.1 GitHub Integration

Both Render and Vercel support auto-deployment:

**Render (Backend & ML Service)**:
1. In Render dashboard, go to each service
2. Enable **"Auto-Deploy"**
3. Connect to GitHub branch (main)

**Vercel (Frontend)**:
1. Auto-enabled by default
2. Every push to `main` deploys to production
3. Pull requests get preview deployments

### 8.2 Deployment Workflow

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Automatic deployments:
# 1. Vercel builds and deploys frontend (~2 min)
# 2. Render redeploys backend if changed (~5 min)
# 3. Render redeploys ML service if changed (~5 min)
```

## 💰 Cost Summary

### Current Setup Costs

| Service | Platform | Plan | Cost/Month |
|---------|----------|------|------------|
| Frontend | Vercel | Hobby (Free) | $0 |
| Backend | Render | Starter (Free) | $0 |
| ML Service | Render | Starter (Free) | $0 |
| MongoDB | Atlas | Free Tier | $0 |
| **Total** | | | **$0/month** |

### Recommended Production Setup

| Service | Platform | Plan | Cost/Month |
|---------|----------|------|------------|
| Frontend | Vercel | Pro | $20 |
| Backend | Render | Standard | $7-25 |
| ML Service | Render | Standard | $7-25 |
| MongoDB | Atlas | M10 | $57 |
| **Total** | | | **~$100/month** |

### When to Upgrade

**Free Tier Limitations**:
- Services sleep after 15 min inactivity
- Cold starts: 10-30 seconds
- Limited resources (512MB RAM)

**Upgrade When**:
- Getting consistent traffic
- Need <1s response times
- Want always-on availability
- Require more than 750 hours/month

## 🐛 Troubleshooting

### Issue: ML Service shows "model not loaded"

**Solutions**:
1. Check model file was committed to git
2. Verify build logs in Render
3. Ensure model path is correct in env vars
4. Redeploy with manual trigger

### Issue: Frontend can't reach backend (CORS)

**Solutions**:
1. Check CORS origins in backend
2. Ensure no trailing slashes in URLs
3. Verify environment variables in Vercel
4. Check browser console for specific error

### Issue: Slow cold starts

**Solutions**:
1. Upgrade to paid Render plans
2. Keep services warm with health checks
3. Use Render's cron jobs for periodic pings
4. Consider serverless alternatives for frontend API

### Issue: Build fails on Vercel

**Solutions**:
1. Check build logs in Vercel dashboard
2. Test build locally: `npm run build`
3. Verify all dependencies in `package.json`
4. Clear build cache and redeploy

### Issue: ML predictions not showing

**Solutions**:
1. Check ML service is healthy
2. Verify backend ML_SERVICE_URL is correct
3. Test ML service endpoint directly
4. Check backend logs for ML service errors

## 📚 Documentation Links

- [ML Service Deployment](ml-service/DEPLOYMENT.md)
- [Frontend Deployment](frontend/DEPLOYMENT.md)
- [Backend README](backend/README.md)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)

## 🔐 Security Checklist

- [ ] Environment variables configured (no secrets in code)
- [ ] CORS properly configured
- [ ] HTTPS enabled everywhere (automatic)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Security headers configured
- [ ] Dependencies up to date
- [ ] Error messages don't expose sensitive info

## ✅ Final Deployment Checklist

### ML Service
- [ ] Model trained and committed
- [ ] Deployed to Render
- [ ] Health endpoint returns "healthy"
- [ ] Can analyze URLs successfully
- [ ] Metrics endpoint working

### Backend
- [ ] ML_SERVICE_URL environment variable updated
- [ ] CORS updated for Vercel domain
- [ ] Redeployed after changes
- [ ] Health endpoint working
- [ ] Can scan URLs with ML integration

### Frontend
- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] Build successful
- [ ] All pages accessible
- [ ] API integration working
- [ ] No console errors
- [ ] PWA features working

### Integration
- [ ] Frontend → Backend working
- [ ] Backend → ML Service working
- [ ] Backend → MongoDB working
- [ ] End-to-end URL scan working
- [ ] File upload working
- [ ] History saving working

### Monitoring
- [ ] Render notifications enabled
- [ ] Vercel analytics enabled
- [ ] Error tracking configured (optional)
- [ ] Health checks scheduled (optional)

## 🎉 Success!

If all checks pass, your Catchers AI system is fully deployed! 🚀

**Your Live URLs**:
- Frontend: `https://catchers-ai-frontend.vercel.app`
- Backend API: `https://catchers-ai-backend.onrender.com`
- ML Service: `https://catchers-ai-ml-service.onrender.com`

## 📞 Need Help?

- Create an issue on GitHub
- Check service status pages:
  - [Render Status](https://status.render.com)
  - [Vercel Status](https://www.vercel-status.com)
- Review service logs in respective dashboards

---

**Built with ❤️ - Catchers AI Deployment Team**
