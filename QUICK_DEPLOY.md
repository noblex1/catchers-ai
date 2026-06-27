# Quick Deployment Reference

Fast reference for deploying ML Service and Frontend.

## 🚀 ML Service to Render - Quick Steps

```bash
# 1. Train model
cd ml-service
pip install -r requirements.txt
python -m app.train_model_improved

# 2. Verify deployment readiness
python check_deployment.py

# 3. Commit and push
git add app/models/
git add Dockerfile render.yaml
git commit -m "Deploy ML service to Render"
git push origin main

# 4. Deploy on Render
# - Go to https://dashboard.render.com
# - New + → Blueprint
# - Select repository
# - Apply

# 5. Get URL and test
# URL: https://catchers-ai-ml-service.onrender.com
curl https://catchers-ai-ml-service.onrender.com/health
```

## 🌐 Frontend to Vercel - Quick Steps

```bash
# 1. Test build
cd frontend
npm install
npm run build
npm run preview

# 2. Deploy
npx vercel

# 3. Add environment variables in Vercel dashboard
# VITE_API_BASE_URL=https://catchers-ai-backend.onrender.com

# 4. Deploy to production
npx vercel --prod
```

## 🔧 Update Backend

```bash
# 1. Update backend environment variable on Render
# ML_SERVICE_URL=https://catchers-ai-ml-service.onrender.com

# 2. Update CORS in backend/src/server.ts
# Add: 'https://catchers-ai-frontend.vercel.app'

# 3. Commit and push (Render auto-deploys)
git add backend/src/server.ts
git commit -m "Update CORS for Vercel"
git push
```

## ✅ Testing Commands

```bash
# Test ML Service
curl https://YOUR-ML-SERVICE.onrender.com/health

# Test Backend
curl https://YOUR-BACKEND.onrender.com/health

# Test Frontend
# Visit: https://YOUR-FRONTEND.vercel.app
```

## 🐛 Troubleshooting

### ML Service: Model not loaded
```bash
# Ensure model is committed
git add ml-service/app/models/phishing_detector.pkl
git commit -m "Add trained model"
git push
```

### Frontend: CORS errors
```bash
# Update backend CORS, add Vercel domain
# Redeploy backend
```

### Slow cold starts
```bash
# Upgrade to paid Render plan ($7/mo)
# Or setup health check pinger
```

## 📝 Environment Variables Quick Reference

### ML Service (Render)
```
ML_SERVICE_PORT=$PORT
ML_SERVICE_HOST=0.0.0.0
MODEL_PATH=app/models/phishing_detector.pkl
MODEL_VERSION=1.0.0
LOG_LEVEL=INFO
```

### Backend (Render)
```
ML_SERVICE_URL=https://catchers-ai-ml-service.onrender.com
MONGODB_URI=mongodb+srv://...
PORT=$PORT
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://catchers-ai-backend.onrender.com
VITE_APP_NAME=Catchers AI
```

## 🔗 Useful Links

- [Full Deployment Guide](DEPLOYMENT_GUIDE.md)
- [ML Service Details](ml-service/DEPLOYMENT.md)
- [Frontend Details](frontend/DEPLOYMENT.md)
- [Render Dashboard](https://dashboard.render.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
