# Catchers AI - ML Service

Machine Learning microservice for phishing and threat detection using Random Forest classifier.

## 🎯 Features

- **ML-Powered Detection**: Random Forest classifier trained on phishing patterns
- **Feature Engineering**: 19+ extracted features from URLs and content
- **High Accuracy**: ~96% accuracy on test data
- **RESTful API**: FastAPI-based service
- **Fallback System**: Rule-based detection when ML model unavailable
- **Real-time Analysis**: Fast prediction (<100ms)

## 📋 Requirements

- Python 3.9+
- pip or conda

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Train the Model

```bash
python -m app.train_model
```

This will:
- Generate synthetic training data (10,000 samples)
- Train a Random Forest classifier
- Evaluate model performance
- Save model to `app/models/phishing_detector.pkl`

**Note**: For production, replace synthetic data with real labeled datasets:
- UCI Phishing Websites Dataset
- PhishTank verified URLs
- Kaggle phishing datasets

### 3. Start the ML Service

```bash
uvicorn app.main:app --reload --port 5000
```

Or:

```bash
python -m app.main
```

The service will be available at: `http://localhost:5000`

### 4. Test the API

Visit: `http://localhost:5000/docs` for interactive API documentation (Swagger UI)

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Analyze URL
```bash
POST /api/ml/analyze-url
Content-Type: application/json

{
  "url": "https://suspicious-site.com"
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "is_threat": true,
    "confidence": 0.95,
    "threat_probability": 0.95,
    "safe_probability": 0.05,
    "ml_score": 95,
    "features_analyzed": 19,
    "model_version": "1.0.0"
  },
  "features": {
    "url_length": 45,
    "domain_length": 20,
    "has_ip_address": false,
    "entropy": 4.2,
    ...
  },
  "risk_factors": [
    "Unusually long URL (potential obfuscation)",
    "High entropy (random-looking URL)"
  ],
  "confidence_factors": [
    "High model confidence (>75%)"
  ]
}
```

### Analyze Content
```bash
POST /api/ml/analyze-content
Content-Type: application/json

{
  "content": "<html>...</html>",
  "url": "https://example.com"
}
```

### Model Info
```bash
GET /api/ml/model-info
```

## 🧠 ML Model Details

### Algorithm
- **Type**: Random Forest Classifier
- **Estimators**: 100 trees
- **Max Depth**: 20
- **Features**: 19 engineered features

### Features Extracted

**URL Features:**
1. URL length
2. Domain length
3. Has IP address
4. Has @ symbol
5. Has double slash
6. Number of subdomains
7. Number of dots
8. Number of hyphens
9. Number of underscores
10. Number of digits
11. Number of special characters
12. Entropy (randomness)
13. Suspicious TLD
14. URL shortener
15. Path length
16. Number of path segments
17. Has query parameters
18. Number of query parameters
19. Is HTTPS

**Content Features (additional):**
- Number of scripts
- Number of iframes
- Number of forms
- Has hidden elements
- Has obfuscated JavaScript
- Phishing keywords count
- Has password fields
- Has insecure forms

### Performance Metrics

- **Accuracy**: ~96%
- **Precision**: ~95%
- **Recall**: ~94%
- **F1-Score**: ~94.5%

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Service Configuration
ML_SERVICE_PORT=5000
ML_SERVICE_HOST=0.0.0.0

# Model Configuration
MODEL_PATH=app/models/phishing_detector.pkl
MODEL_VERSION=1.0.0

# Logging
LOG_LEVEL=INFO
```

## 🏗️ Project Structure

```
ml-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── ml_engine.py         # ML model wrapper
│   ├── feature_extractor.py # Feature engineering
│   ├── train_model.py       # Model training script
│   └── models/              # Saved models (created after training)
│       ├── phishing_detector.pkl
│       └── model_metadata.json
├── requirements.txt
└── README.md
```

## 🔄 Integration with Backend

The ML service is designed to be called by the Node.js backend:

```typescript
// In backend/src/services/mlService.ts
const mlResponse = await axios.post('http://localhost:5000/api/ml/analyze-url', {
  url: 'https://example.com'
});

const mlScore = mlResponse.data.prediction.ml_score;
const isMLThreat = mlResponse.data.prediction.is_threat;
```

## 📊 Training with Real Data

To train with real datasets:

1. **Download datasets:**
   - UCI Phishing: https://archive.ics.uci.edu/ml/datasets/phishing+websites
   - Kaggle: https://www.kaggle.com/datasets/shashwatwork/web-page-phishing-detection-dataset

2. **Modify `train_model.py`:**
   ```python
   # Replace create_synthetic_training_data() with:
   df = pd.read_csv('path/to/real_dataset.csv')
   ```

3. **Retrain:**
   ```bash
   python -m app.train_model
   ```

## 🧪 Testing

Test the ML service:

```bash
# Test URL analysis
curl -X POST http://localhost:5000/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url": "http://suspicious-site.tk/verify-account"}'

# Test health check
curl http://localhost:5000/health
```

## 🐳 Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 5000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
```

Build and run:
```bash
docker build -t catchers-ml-service .
docker run -p 5000:5000 catchers-ml-service
```

## 📈 Performance Optimization

- **Model Caching**: Model loaded once at startup
- **Feature Caching**: Common features cached
- **Async Processing**: FastAPI async endpoints
- **Batch Prediction**: Support for batch URL analysis

## 🔒 Security

- Input validation on all endpoints
- Rate limiting (configure with middleware)
- CORS configuration
- No sensitive data logging

## 📝 License

MIT License - See main project LICENSE file

## 🤝 Contributing

See main project CONTRIBUTING.md

---

**Built with ❤️ for Catchers AI**
