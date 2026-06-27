# ML Service Deployment Guide - Render

This guide covers deploying the Catchers AI ML Service to Render.

## 🚀 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **Pre-trained Model**: Ensure you have a trained model file
3. **GitHub Repository**: Code should be in a GitHub repository

## 📦 Pre-Deployment Checklist

### 1. Train the Model Locally

Before deploying, you **must** train and save the model:

```bash
cd ml-service
pip install -r requirements.txt
python -m app.train_model_improved
```

This creates `app/models/phishing_detector.pkl` and `app/models/model_metadata.json`.

### 2. Commit the Model to Git

The trained model needs to be included in your repository:

```bash
git add app/models/phishing_detector.pkl
git add app/models/model_metadata.json
git commit -m "Add pre-trained ML model"
git push
```

**Note**: The model file is ~5-50MB depending on training data. Ensure your `.gitignore` doesn't exclude it.

## 🎯 Deployment Methods

### Method 1: Using render.yaml (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare ML service for Render deployment"
   git push
   ```

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click **"Apply"**

3. **Configure Environment** (if needed):
   - Render will use the settings from `render.yaml`
   - All environment variables are pre-configured

### Method 2: Manual Setup

1. **Create New Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the repository branch

2. **Configure Build Settings**:
   - **Name**: `catchers-ai-ml-service`
   - **Region**: Choose closest to your backend
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `ml-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**:
   Add these in the Render dashboard:
   ```
   PYTHON_VERSION=3.11.0
   MODEL_PATH=app/models/phishing_detector.pkl
   MODEL_VERSION=1.0.0
   LOG_LEVEL=INFO
   ```

4. **Plan Selection**:
   - Start with **Starter** (free tier)
   - Upgrade to **Standard** if you need more resources

5. **Deploy**:
   - Click **"Create Web Service"**
   - Render will build and deploy automatically

## 🔧 Post-Deployment Configuration

### 1. Get Your ML Service URL

After deployment, Render provides a URL like:
```
https://catchers-ai-ml-service.onrender.com
```

### 2. Update Backend Configuration

Update your main backend's `.env` file:

```env
ML_SERVICE_URL=https://catchers-ai-ml-service.onrender.com
```

Then redeploy your backend on Render (if already deployed).

### 3. Test the Deployment

Test the ML service endpoints:

```bash
# Health check
curl https://catchers-ai-ml-service.onrender.com/health

# Analyze URL
curl -X POST https://catchers-ai-ml-service.onrender.com/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Model info
curl https://catchers-ai-ml-service.onrender.com/api/ml/model-info
```

## 📊 Monitoring and Logs

### View Logs

1. Go to your service in Render Dashboard
2. Click **"Logs"** tab
3. Monitor for errors and performance

### Health Checks

Render automatically monitors the `/health` endpoint:
- Service is marked unhealthy if health check fails
- Automatic restarts on failures

## ⚙️ Configuration Options

### Scaling

To handle more traffic:

1. Upgrade plan (Starter → Standard → Pro)
2. Enable auto-scaling in Render dashboard
3. Adjust instance count

### Performance Optimization

**Model Loading**:
- Model is loaded once at startup
- Uses memory caching for fast predictions

**Response Times**:
- Cold start: ~10-30 seconds (free tier)
- Warm requests: <100ms
- Upgrade to paid plan to reduce cold starts

### Environment Variables

Available configuration options:

| Variable | Default | Description |
|----------|---------|-------------|
| `ML_SERVICE_PORT` | `$PORT` | Port (Render auto-sets) |
| `ML_SERVICE_HOST` | `0.0.0.0` | Host binding |
| `MODEL_PATH` | `app/models/phishing_detector.pkl` | Path to model |
| `MODEL_VERSION` | `1.0.0` | Model version |
| `LOG_LEVEL` | `INFO` | Logging level |

## 🔄 Updating the Model

To deploy a new trained model:

1. **Train locally**:
   ```bash
   python -m app.train_model_improved
   ```

2. **Commit and push**:
   ```bash
   git add app/models/phishing_detector.pkl
   git commit -m "Update ML model"
   git push
   ```

3. **Automatic deployment**:
   - Render auto-deploys on push (if enabled)
   - Or manually trigger in dashboard

## 🐛 Troubleshooting

### Issue: Model not found

**Error**: `FileNotFoundError: Model not found at app/models/phishing_detector.pkl`

**Solution**:
1. Ensure model is trained locally
2. Commit model file to repository
3. Check `.gitignore` doesn't exclude `.pkl` files

### Issue: Build fails

**Error**: `ERROR: Could not install packages due to an OSError`

**Solution**:
1. Check Python version compatibility
2. Verify all dependencies in `requirements.txt`
3. Check build logs for specific errors

### Issue: Service crashes on startup

**Error**: `Application failed to start`

**Solution**:
1. Check logs for import errors
2. Verify all dependencies installed
3. Ensure model file exists in build

### Issue: High memory usage

**Solution**:
1. Upgrade to Standard plan (512MB → 2GB RAM)
2. Optimize model size
3. Implement model pruning

### Issue: Slow cold starts

**Solution**:
1. Upgrade to paid plan (reduces cold start frequency)
2. Keep service warm with periodic health checks
3. Use Render's always-on instances (paid plans)

## 💰 Cost Estimates

### Free Tier (Starter)
- **Cost**: $0/month
- **Specs**: 512MB RAM, 0.1 CPU
- **Limitations**: 
  - Spins down after 15 minutes of inactivity
  - Cold starts ~10-30 seconds
  - 750 hours/month free

### Paid Plans

| Plan | RAM | CPU | Cost/Month | Best For |
|------|-----|-----|------------|----------|
| Starter (Free) | 512MB | 0.1 | $0 | Development/Testing |
| Standard | 2GB | 1.0 | $7-25 | Production (low traffic) |
| Pro | 4GB+ | 2.0+ | $25+ | Production (high traffic) |

## 🔐 Security Considerations

1. **CORS Configuration**: 
   - Update `allow_origins` in `main.py` for production
   - Don't use `["*"]` in production

2. **Rate Limiting**:
   - Consider adding rate limiting middleware
   - Prevent abuse of ML endpoints

3. **API Authentication**:
   - Add API key authentication if needed
   - Secure communication between backend and ML service

## 📚 Additional Resources

- [Render Python Docs](https://render.com/docs/python)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [ML Service README](./README.md)

## ✅ Deployment Checklist

- [ ] Model trained and saved locally
- [ ] Model committed to repository
- [ ] `requirements.txt` is up to date
- [ ] Render account created
- [ ] Service deployed via Blueprint or manual
- [ ] Health check endpoint working
- [ ] ML Service URL obtained
- [ ] Backend `.env` updated with ML_SERVICE_URL
- [ ] Backend redeployed with new ML_SERVICE_URL
- [ ] End-to-end testing completed

---

**Need Help?** Check the [main deployment documentation](../README.md) or [open an issue](https://github.com/yourusername/catchers-ai/issues).
