"""
Model Training Script
Train Random Forest classifier on phishing dataset
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os
from datetime import datetime


def create_synthetic_training_data(n_samples=10000):
    """
    Create synthetic training data for phishing detection
    In production, use real labeled datasets like:
    - UCI Phishing Websites Dataset
    - PhishTank verified phishing URLs
    - Kaggle phishing datasets
    """
    np.random.seed(42)
    
    data = []
    
    # Generate legitimate URLs (50%)
    for _ in range(n_samples // 2):
        data.append({
            'url_length': np.random.randint(20, 60),
            'domain_length': np.random.randint(5, 20),
            'has_ip_address': 0,
            'has_at_symbol': 0,
            'has_double_slash': 0,
            'num_subdomains': np.random.randint(0, 2),
            'num_dots': np.random.randint(1, 4),
            'num_hyphens': np.random.randint(0, 2),
            'num_underscores': np.random.randint(0, 1),
            'num_digits': np.random.randint(0, 5),
            'num_special_chars': np.random.randint(5, 15),
            'entropy': np.random.uniform(2.5, 3.8),
            'suspicious_tld': 0,
            'url_shortener': 0,
            'path_length': np.random.randint(0, 30),
            'num_path_segments': np.random.randint(0, 4),
            'has_query': np.random.choice([0, 1], p=[0.6, 0.4]),
            'num_query_params': np.random.randint(0, 3),
            'is_https': 1,
            # WHOIS features (legitimate sites typically have older domains)
            'domain_age_days': np.random.randint(365, 3650),  # 1-10 years
            'recently_registered': 0,
            'recently_updated': np.random.choice([0, 1], p=[0.8, 0.2]),
            'days_to_expiry': np.random.randint(30, 730),  # 1 month to 2 years
            'registrar_present': 1,
            # Redirect features (legitimate sites rarely redirect)
            'redirect_hops': np.random.choice([0, 1], p=[0.9, 0.1]),
            'initial_final_domain_diff': 0,
            'used_shortener': 0,
            'is_phishing': 0
        })
    
    # Generate phishing URLs (50%)
    for _ in range(n_samples // 2):
        data.append({
            'url_length': np.random.randint(60, 150),
            'domain_length': np.random.randint(15, 40),
            'has_ip_address': np.random.choice([0, 1], p=[0.7, 0.3]),
            'has_at_symbol': np.random.choice([0, 1], p=[0.8, 0.2]),
            'has_double_slash': np.random.choice([0, 1], p=[0.85, 0.15]),
            'num_subdomains': np.random.randint(2, 6),
            'num_dots': np.random.randint(4, 10),
            'num_hyphens': np.random.randint(2, 8),
            'num_underscores': np.random.randint(0, 4),
            'num_digits': np.random.randint(5, 20),
            'num_special_chars': np.random.randint(20, 50),
            'entropy': np.random.uniform(3.8, 5.2),
            'suspicious_tld': np.random.choice([0, 1], p=[0.6, 0.4]),
            'url_shortener': np.random.choice([0, 1], p=[0.85, 0.15]),
            'path_length': np.random.randint(30, 100),
            'num_path_segments': np.random.randint(3, 10),
            'has_query': np.random.choice([0, 1], p=[0.3, 0.7]),
            'num_query_params': np.random.randint(2, 10),
            'is_https': np.random.choice([0, 1], p=[0.4, 0.6]),
            # WHOIS features (phishing sites often have new domains)
            'domain_age_days': np.random.randint(0, 180),  # 0-6 months
            'recently_registered': np.random.choice([0, 1], p=[0.3, 0.7]),
            'recently_updated': np.random.choice([0, 1], p=[0.5, 0.5]),
            'days_to_expiry': np.random.randint(0, 90),  # Short expiry
            'registrar_present': np.random.choice([0, 1], p=[0.3, 0.7]),
            # Redirect features (phishing sites often use redirects)
            'redirect_hops': np.random.randint(0, 5),
            'initial_final_domain_diff': np.random.choice([0, 1], p=[0.4, 0.6]),
            'used_shortener': np.random.choice([0, 1], p=[0.7, 0.3]),
            'is_phishing': 1
        })
    
    return pd.DataFrame(data)


def train_model():
    """Train the phishing detection model"""
    print("=" * 60)
    print("Catchers AI - ML Model Training")
    print("=" * 60)
    
    # Create training data
    print("\n[1/6] Generating training data...")
    df = create_synthetic_training_data(n_samples=10000)
    print(f"   ✓ Generated {len(df)} samples")
    print(f"   ✓ Legitimate: {(df['is_phishing'] == 0).sum()}")
    print(f"   ✓ Phishing: {(df['is_phishing'] == 1).sum()}")
    
    # Prepare features and labels
    print("\n[2/6] Preparing features and labels...")
    feature_columns = [col for col in df.columns if col != 'is_phishing']
    X = df[feature_columns].values
    y = df['is_phishing'].values
    print(f"   ✓ Features: {len(feature_columns)}")
    print(f"   ✓ Feature names: {', '.join(feature_columns[:5])}...")
    
    # Split data
    print("\n[3/6] Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   ✓ Training set: {len(X_train)} samples")
    print(f"   ✓ Test set: {len(X_test)} samples")
    
    # Train model
    print("\n[4/6] Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    print("   ✓ Model trained successfully")
    
    # Evaluate model
    print("\n[5/6] Evaluating model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n   Accuracy: {accuracy:.4f}")
    print("\n   Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing']))
    
    print("\n   Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"   [[TN={cm[0][0]}, FP={cm[0][1]}],")
    print(f"    [FN={cm[1][0]}, TP={cm[1][1]}]]")
    
    # Cross-validation
    print("\n   Cross-validation (5-fold)...")
    cv_scores = cross_val_score(model, X, y, cv=5)
    print(f"   CV Scores: {cv_scores}")
    print(f"   Mean CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Feature importance
    print("\n   Top 10 Important Features:")
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
        print(f"   {row['feature']:.<30} {row['importance']:.4f}")
    
    # Save model
    print("\n[6/6] Saving model...")
    os.makedirs('app/models', exist_ok=True)
    model_path = 'app/models/phishing_detector.pkl'
    joblib.dump(model, model_path)
    print(f"   ✓ Model saved to {model_path}")
    
    # Save metadata
    metadata = {
        'model_version': '1.0.0',
        'training_date': datetime.now().isoformat(),
        'n_samples': len(df),
        'n_features': len(feature_columns),
        'accuracy': float(accuracy),
        'feature_names': feature_columns
    }
    
    metadata_path = 'app/models/model_metadata.json'
    import json
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"   ✓ Metadata saved to {metadata_path}")
    
    print("\n" + "=" * 60)
    print("✓ Training complete!")
    print("=" * 60)
    print(f"\nModel Performance Summary:")
    print(f"  • Accuracy: {accuracy:.2%}")
    print(f"  • Precision: {cm[1][1] / (cm[1][1] + cm[0][1]):.2%}")
    print(f"  • Recall: {cm[1][1] / (cm[1][1] + cm[1][0]):.2%}")
    print(f"  • Model saved: {model_path}")
    print("\nYou can now start the ML service with: uvicorn app.main:app --reload")


if __name__ == "__main__":
    train_model()
