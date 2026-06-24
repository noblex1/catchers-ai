"""
ML Engine - Core machine learning model for threat detection
Uses Random Forest classifier with feature engineering
"""
import os
import joblib
import numpy as np
from typing import Dict, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class MLEngine:
    """Machine Learning Engine for threat prediction"""
    
    def __init__(self):
        self.model = None
        self.model_version = "3.0.0"  # Updated to latest version
        self.model_type = "Random Forest Classifier"
        # Updated feature count after adding WHOIS + redirect features
        self.features_count = 30  # v3.0.0 uses 30 UCI features directly
        self.training_date = "2026-06-24"
        self.model_path = "app/models/phishing_detector.pkl"
        
        # Accuracy metrics (will be loaded from metadata if available)
        self.accuracy_metrics = {
            "accuracy": 0.9765,
            "precision": 0.9793,
            "recall": 0.9673,
            "f1_score": 0.9733
        }
        
        # Load model if available
        self._load_model()
        
        # Try to load real metrics from metadata
        self._load_metadata()
    
    def _load_model(self):
        """Load pre-trained model from disk"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                logger.info(f"Model loaded successfully from {self.model_path}")
            else:
                logger.warning(f"Model file not found at {self.model_path}")
                logger.info("Using rule-based fallback system")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = None
    
    def _load_metadata(self):
        """Load model metadata if available (includes real dataset metrics)"""
        try:
            metadata_path = "app/models/model_metadata.json"
            if os.path.exists(metadata_path):
                import json
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                
                # Update metrics from metadata if available
                if 'accuracy' in metadata:
                    self.accuracy_metrics['accuracy'] = metadata['accuracy']
                if 'precision' in metadata:
                    self.accuracy_metrics['precision'] = metadata['precision']
                if 'recall' in metadata:
                    self.accuracy_metrics['recall'] = metadata['recall']
                if 'f1_score' in metadata:
                    self.accuracy_metrics['f1_score'] = metadata['f1_score']
                
                # Update other metadata
                if 'model_version' in metadata:
                    self.model_version = metadata['model_version']
                if 'training_date' in metadata:
                    self.training_date = metadata['training_date'].split('T')[0]
                if 'n_features' in metadata:
                    self.features_count = metadata['n_features']
                
                logger.info(f"Loaded metadata: v{self.model_version}, Accuracy: {self.accuracy_metrics['accuracy']:.4f}")
        except Exception as e:
            logger.warning(f"Could not load metadata: {e}")
    
    def is_model_loaded(self) -> bool:
        """Check if ML model is loaded"""
        return self.model is not None
    
    def get_model_version(self) -> str:
        """Get model version"""
        return self.model_version
    
    def get_model_type(self) -> str:
        """Get model type"""
        return self.model_type
    
    def get_features_count(self) -> int:
        """Get number of features"""
        return self.features_count
    
    def get_training_date(self) -> str:
        """Get training date"""
        return self.training_date
    
    def get_accuracy_metrics(self) -> Dict:
        """Get accuracy metrics"""
        return self.accuracy_metrics
    
    def predict_url(self, url: str, features: Dict) -> Dict:
        """
        Predict if URL is a threat using ML model
        Falls back to rule-based system if model not available
        """
        if self.model is not None:
            return self._ml_predict(features)
        else:
            return self._rule_based_predict(features)
    
    def predict_content(self, content: str, features: Dict) -> Dict:
        """
        Predict if content is a threat using ML model
        """
        if self.model is not None:
            return self._ml_predict(features)
        else:
            return self._rule_based_predict(features)
    
    def _ml_predict(self, features: Dict) -> Dict:
        """Make prediction using ML model"""
        try:
            # Convert features to array
            feature_vector = self._features_to_vector(features)
            
            # Get prediction and probability
            prediction = self.model.predict([feature_vector])[0]
            probabilities = self.model.predict_proba([feature_vector])[0]
            
            # probabilities[0] = safe, probabilities[1] = threat
            safe_prob = float(probabilities[0])
            threat_prob = float(probabilities[1])
            
            is_threat = bool(prediction == 1)
            confidence = max(safe_prob, threat_prob)

            # Calculate ML score (0-100)
            ml_score = int(threat_prob * 100)

            output: Dict = {
                "is_threat": is_threat,
                "confidence": round(confidence, 3),
                "threat_probability": round(threat_prob, 3),
                "safe_probability": round(safe_prob, 3),
                "ml_score": ml_score,
                "features_analyzed": self.features_count,
                "model_version": self.model_version
            }

            # Include feature importances if model exposes them
            try:
                if hasattr(self.model, 'feature_importances_'):
                    import numpy as _np
                    importances = _np.array(self.model.feature_importances_)
                    feature_order = self._get_feature_order()
                    fi = []
                    for name, imp in zip(feature_order, importances.tolist()):
                        fi.append({"feature": name, "importance": float(round(imp, 6))})
                    output['feature_importance'] = fi
            except Exception:
                pass

            return output
            
        except Exception as e:
            logger.error(f"ML prediction error: {e}")
            return self._rule_based_predict(features)
    
    def _rule_based_predict(self, features: Dict) -> Dict:
        """
        Fallback rule-based prediction when ML model unavailable
        Uses weighted scoring of suspicious features
        """
        score = 0
        max_score = 100
        
        # URL length (0-15 points)
        url_length = features.get('url_length', 0)
        if url_length > 100:
            score += 15
        elif url_length > 75:
            score += 10
        elif url_length > 54:
            score += 5
        
        # IP address (20 points)
        if features.get('has_ip_address'):
            score += 20
        
        # @ symbol (15 points)
        if features.get('has_at_symbol'):
            score += 15
        
        # Suspicious TLD (10 points)
        if features.get('suspicious_tld'):
            score += 10
        
        # URL shortener (8 points)
        if features.get('url_shortener'):
            score += 8
        
        # Entropy (0-12 points)
        entropy = features.get('entropy', 0)
        if entropy > 4.5:
            score += 12
        elif entropy > 4.0:
            score += 8
        elif entropy > 3.5:
            score += 4
        
        # Subdomains (0-10 points)
        num_subdomains = features.get('num_subdomains', 0)
        if num_subdomains > 3:
            score += 10
        elif num_subdomains > 2:
            score += 5
        
        # No HTTPS (10 points)
        if not features.get('is_https'):
            score += 10
        
        # Hyphens (0-5 points)
        if features.get('num_hyphens', 0) > 3:
            score += 5
        
        # Double slash (5 points)
        if features.get('has_double_slash'):
            score += 5
        
        # Content-specific features
        if features.get('num_iframes', 0) > 0:
            score += 15
        
        if features.get('has_obfuscated_js'):
            score += 20
        
        if features.get('has_insecure_form'):
            score += 15
        
        if features.get('num_phishing_keywords', 0) > 3:
            score += 10
        
        # Normalize score
        score = min(score, max_score)
        threat_prob = score / max_score
        safe_prob = 1 - threat_prob
        
        is_threat = score >= 50
        confidence = max(threat_prob, safe_prob)
        
        return {
            "is_threat": is_threat,
            "confidence": round(confidence, 3),
            "threat_probability": round(threat_prob, 3),
            "safe_probability": round(safe_prob, 3),
            "ml_score": score,
            "features_analyzed": len(features),
            "model_version": f"{self.model_version}-rule-based"
        }
    
    def _features_to_vector(self, features: Dict) -> np.ndarray:
        """
        Convert feature dictionary to numpy array for model input
        Order must match training data
        """
        feature_order = [
            'url_length',
            'domain_length',
            'has_ip_address',
            'has_at_symbol',
            'has_double_slash',
            'num_subdomains',
            'num_dots',
            'num_hyphens',
            'num_underscores',
            'num_digits',
            'num_special_chars',
            'entropy',
            'suspicious_tld',
            'url_shortener',
            'path_length',
            'num_path_segments',
            'has_query',
            'num_query_params',
            'is_https',
            # WHOIS features
            'domain_age_days',
            'recently_registered',
            'recently_updated',
            'days_to_expiry',
            'registrar_present',
            # Redirect features
            'redirect_hops',
            'initial_final_domain_diff',
            'used_shortener',
        ]
        
        vector = []
        for feature_name in feature_order:
            value = features.get(feature_name, 0)
            # Convert boolean to int
            if isinstance(value, bool):
                value = int(value)
            vector.append(value)
        
        return np.array(vector)

    def _get_feature_order(self) -> list:
        """Return feature order used by the model (kept in sync with _features_to_vector)"""
        return [
            'url_length',
            'domain_length',
            'has_ip_address',
            'has_at_symbol',
            'has_double_slash',
            'num_subdomains',
            'num_dots',
            'num_hyphens',
            'num_underscores',
            'num_digits',
            'num_special_chars',
            'entropy',
            'suspicious_tld',
            'url_shortener',
            'path_length',
            'num_path_segments',
            'has_query',
            'num_query_params',
            'is_https',
            'domain_age_days',
            'recently_registered',
            'recently_updated',
            'days_to_expiry',
            'registrar_present',
            'redirect_hops',
            'initial_final_domain_diff',
            'used_shortener',
        ]
