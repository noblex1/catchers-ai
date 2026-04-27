"""
Catchers AI - ML Service
FastAPI-based machine learning service for threat detection
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import logging

from app.ml_engine import MLEngine
from app.feature_extractor import FeatureExtractor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Catchers AI - ML Service",
    description="Machine Learning API for Phishing and Threat Detection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML engine and feature extractor
ml_engine = MLEngine()
feature_extractor = FeatureExtractor()


# Request/Response Models
class URLAnalysisRequest(BaseModel):
    url: str = Field(..., description="URL to analyze")
    engineered_features: Optional[Dict] = Field(None, description="Optional engineered features (whois/redirect) provided by caller")


class ContentAnalysisRequest(BaseModel):
    content: str = Field(..., description="HTML/text content to analyze")
    url: Optional[str] = Field(None, description="Associated URL if available")


class MLPrediction(BaseModel):
    is_threat: bool
    confidence: float
    threat_probability: float
    safe_probability: float
    ml_score: int  # 0-100
    features_analyzed: int
    model_version: str
    feature_importance: Optional[List[Dict[str, Any]]] = None


class FeatureAnalysis(BaseModel):
    """Feature analysis with extended fields for whois and redirect"""
    url_length: Optional[int] = None
    domain_length: Optional[int] = None
    has_ip_address: Optional[bool] = None
    has_at_symbol: Optional[bool] = None
    has_double_slash: Optional[bool] = None
    num_subdomains: Optional[int] = None
    num_dots: Optional[int] = None
    num_hyphens: Optional[int] = None
    num_underscores: Optional[int] = None
    num_digits: Optional[int] = None
    num_special_chars: Optional[int] = None
    entropy: Optional[float] = None
    suspicious_tld: Optional[bool] = None
    url_shortener: Optional[bool] = None
    path_length: Optional[int] = None
    num_path_segments: Optional[int] = None
    has_query: Optional[bool] = None
    num_query_params: Optional[int] = None
    is_https: Optional[bool] = None
    # New WHOIS-derived features
    domain_age_days: Optional[int] = None
    recently_registered: Optional[bool] = None
    recently_updated: Optional[bool] = None
    days_to_expiry: Optional[int] = None
    registrar_present: Optional[bool] = None
    # New redirect-derived features
    redirect_hops: Optional[int] = None
    final_domain: Optional[str] = None
    initial_final_domain_diff: Optional[bool] = None
    used_shortener: Optional[bool] = None


class MLAnalysisResponse(BaseModel):
    success: bool
    prediction: MLPrediction
    features: FeatureAnalysis
    risk_factors: List[str]
    confidence_factors: List[str]


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Catchers AI - ML Service",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "analyze_url": "/api/ml/analyze-url",
            "analyze_content": "/api/ml/analyze-content",
            "model_info": "/api/ml/model-info"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_loaded = ml_engine.is_model_loaded()
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "model_version": ml_engine.get_model_version()
    }


@app.post("/api/ml/analyze-url", response_model=MLAnalysisResponse)
async def analyze_url(request: URLAnalysisRequest):
    """
    Analyze a URL using machine learning models
    """
    try:
        logger.info(f"Analyzing URL: {request.url}")
        
        # Extract features (allow passing WHOIS / redirect engineered features)
        whois_data = None
        redirect_data = None
        if request.engineered_features:
            whois_data = request.engineered_features.get('whois')
            redirect_data = request.engineered_features.get('redirect')

        features = feature_extractor.extract_url_features(request.url, whois_data, redirect_data)

        # Get ML prediction (pass features into engine)
        prediction = ml_engine.predict_url(request.url, features)
        
        # Analyze risk factors
        risk_factors = feature_extractor.identify_risk_factors(features, request.url)
        confidence_factors = feature_extractor.identify_confidence_factors(features, prediction)
        
        return MLAnalysisResponse(
            success=True,
            prediction=prediction,
            features=features,
            risk_factors=risk_factors,
            confidence_factors=confidence_factors
        )
        
    except Exception as e:
        logger.error(f"Error analyzing URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/ml/analyze-content", response_model=MLAnalysisResponse)
async def analyze_content(request: ContentAnalysisRequest):
    """
    Analyze HTML/text content using machine learning
    """
    try:
        logger.info(f"Analyzing content (length: {len(request.content)} chars)")
        
        # Extract content features
        features = feature_extractor.extract_content_features(
            request.content, 
            request.url
        )
        
        # Get ML prediction
        prediction = ml_engine.predict_content(request.content, features)
        
        # Analyze risk factors
        risk_factors = feature_extractor.identify_content_risk_factors(
            request.content, 
            features
        )
        confidence_factors = feature_extractor.identify_confidence_factors(features, prediction)
        
        return MLAnalysisResponse(
            success=True,
            prediction=prediction,
            features=features,
            risk_factors=risk_factors,
            confidence_factors=confidence_factors
        )
        
    except Exception as e:
        logger.error(f"Error analyzing content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/api/ml/model-info")
async def get_model_info():
    """
    Get information about the loaded ML model
    """
    return {
        "model_loaded": ml_engine.is_model_loaded(),
        "model_version": ml_engine.get_model_version(),
        "model_type": ml_engine.get_model_type(),
        "features_count": ml_engine.get_features_count(),
        "training_date": ml_engine.get_training_date(),
        "accuracy_metrics": ml_engine.get_accuracy_metrics()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
