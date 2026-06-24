"""
Model Training Script with REAL Phishing Dataset
Uses UCI Phishing Websites Dataset or other real datasets
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import joblib
import os
import json
from datetime import datetime
from dataset_loader import PhishingDatasetLoader


def map_uci_features_to_model_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Map UCI dataset features to our model's expected features
    UCI dataset has 30 features with values -1, 0, 1
    We need to map them to our 27 features with proper interpretation
    """
    print("\n[INFO] Mapping UCI features to model features...")
    
    # UCI dataset feature names (from actual dataset)
    # Result: -1 (phishing), 1 (legitimate)
    
    # Convert UCI encoding (-1, 0, 1) to binary (0, 1) or keep numeric
    def convert_uci_binary(series):
        """Convert UCI format to binary: -1 or 0 -> 1 (bad), 1 -> 0 (good)"""
        return (series != 1).astype(int)
    
    def normalize_numeric(series):
        """Normalize to positive range"""
        return series.abs()
    
    # Create feature mapping dictionary
    features = {}
    
    # 1. URL Length - use directly
    if 'URL_Length' in df.columns:
        # UCI: 1 (short-legitimate), 0 (medium), -1 (long-suspicious)
        # Convert to actual length estimate
        url_len = df['URL_Length'].map({1: 30, 0: 60, -1: 120})
        features['url_length'] = url_len
    else:
        features['url_length'] = np.random.randint(20, 100, len(df))
    
    # 2. Domain length - estimate from URL length
    features['domain_length'] = (features['url_length'] * 0.3).astype(int)
    
    # 3. Has IP Address
    if 'having_IP_Address' in df.columns:
        features['has_ip_address'] = convert_uci_binary(df['having_IP_Address'])
    else:
        features['has_ip_address'] = 0
    
    # 4. Has @ symbol
    if 'having_At_Symbol' in df.columns:
        features['has_at_symbol'] = convert_uci_binary(df['having_At_Symbol'])
    else:
        features['has_at_symbol'] = 0
    
    # 5. Double slash redirecting
    if 'double_slash_redirecting' in df.columns:
        features['has_double_slash'] = convert_uci_binary(df['double_slash_redirecting'])
    else:
        features['has_double_slash'] = 0
    
    # 6. Number of subdomains
    if 'having_Sub_Domain' in df.columns:
        # UCI: 1 (no subdomain), 0 (one), -1 (multiple)
        sub_map = {1: 0, 0: 1, -1: 3}
        features['num_subdomains'] = df['having_Sub_Domain'].map(sub_map)
    else:
        features['num_subdomains'] = 1
    
    # 7-11. Derived features
    features['num_dots'] = features['num_subdomains'] + 1
    features['num_hyphens'] = (features['url_length'] / 30).astype(int)
    features['num_underscores'] = 0
    features['num_digits'] = (features['url_length'] / 20).astype(int)
    features['num_special_chars'] = (features['url_length'] / 5).astype(int)
    
    # 12. Entropy - estimate from URL complexity
    features['entropy'] = 2.5 + (features['url_length'] / 30)
    
    # 13. Suspicious TLD
    features['suspicious_tld'] = convert_uci_binary(df.get('Prefix_Suffix', 1))
    
    # 14. URL Shortener
    if 'Shortining_Service' in df.columns:
        features['url_shortener'] = convert_uci_binary(df['Shortining_Service'])
    else:
        features['url_shortener'] = 0
    
    # 15-18. Path and query features
    features['path_length'] = (features['url_length'] * 0.4).astype(int)
    features['num_path_segments'] = 2
    features['has_query'] = 0
    features['num_query_params'] = 0
    
    # 19. HTTPS
    if 'HTTPS_token' in df.columns:
        # UCI: 1 (has https), -1 (no https or suspicious)
        features['is_https'] = (df['HTTPS_token'] == 1).astype(int)
    elif 'SSLfinal_State' in df.columns:
        features['is_https'] = (df['SSLfinal_State'] == 1).astype(int)
    else:
        features['is_https'] = 1
    
    # 20. Domain age
    if 'age_of_domain' in df.columns:
        # UCI: 1 (old domain), -1 (young domain)
        age_map = {1: 1825, 0: 365, -1: 30}  # 5 years, 1 year, 1 month
        features['domain_age_days'] = df['age_of_domain'].map(age_map)
    else:
        features['domain_age_days'] = 365
    
    # 21-24. WHOIS features
    features['recently_registered'] = (features['domain_age_days'] < 90).astype(int)
    features['recently_updated'] = 0
    features['days_to_expiry'] = (features['domain_age_days'] * 0.8).astype(int)
    features['registrar_present'] = 1
    
    # 25-27. Redirect features
    if 'Redirect' in df.columns:
        features['redirect_hops'] = convert_uci_binary(df['Redirect'])
    else:
        features['redirect_hops'] = 0
    
    features['initial_final_domain_diff'] = features['redirect_hops']
    features['used_shortener'] = features['url_shortener']
    
    # Create DataFrame
    result_df = pd.DataFrame(features)
    
    # Get label - UCI uses 'Result' column: -1 (phishing), 1 (legitimate)
    if 'Result' in df.columns:
        # Convert: -1 -> 1 (phishing), 1 -> 0 (legitimate)
        result_df['is_phishing'] = (df['Result'] == -1).astype(int)
    else:
        print("⚠ WARNING: No 'Result' column found!")
        result_df['is_phishing'] = 0
    
    print(f"✓ Mapped {len(result_df.columns)-1} features")
    print(f"✓ Class distribution: Legitimate={len(result_df[result_df['is_phishing']==0])}, Phishing={len(result_df[result_df['is_phishing']==1])}")
    
    return result_df


def train_model_with_real_data():
    """Train the phishing detection model with REAL dataset"""
    print("=" * 70)
    print("Catchers AI - ML Model Training (REAL DATASET)")
    print("=" * 70)
    
    # Load real dataset
    print("\n[1/7] Loading real phishing dataset...")
    loader = PhishingDatasetLoader()
    
    # Try to load UCI dataset first
    raw_df, dataset_description = loader.prepare_training_data(dataset="uci")
    
    print(f"   ✓ Dataset: {dataset_description}")
    print(f"   ✓ Raw samples: {len(raw_df)}")
    
    # Map features
    print("\n[2/7] Processing and mapping features...")
    df = map_uci_features_to_model_features(raw_df)
    
    print(f"   ✓ Processed {len(df)} samples")
    print(f"   ✓ Legitimate: {(df['is_phishing'] == 0).sum()}")
    print(f"   ✓ Phishing: {(df['is_phishing'] == 1).sum()}")
    
    # Prepare features and labels
    print("\n[3/7] Preparing features and labels...")
    feature_columns = [col for col in df.columns if col != 'is_phishing']
    X = df[feature_columns].values
    y = df['is_phishing'].values
    print(f"   ✓ Features: {len(feature_columns)}")
    
    # Split data
    print("\n[4/7] Splitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   ✓ Training set: {len(X_train)} samples")
    print(f"   ✓ Test set: {len(X_test)} samples")
    
    # Train model
    print("\n[5/7] Training Random Forest model...")
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
    print("\n[6/7] Evaluating model...")
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print(f"\n   Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"   Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"   Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"   F1-Score:  {f1:.4f} ({f1*100:.2f}%)")
    
    print("\n   Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing']))
    
    print("\n   Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"   [[TN={cm[0][0]}, FP={cm[0][1]}],")
    print(f"    [FN={cm[1][0]}, TP={cm[1][1]}]]")
    
    # Cross-validation
    print("\n   Cross-validation (5-fold)...")
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"   CV Accuracy Scores: {[f'{s:.4f}' for s in cv_scores]}")
    print(f"   Mean CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Feature importance
    print("\n   Top 10 Important Features:")
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
        print(f"   {row['feature']:.<30} {row['importance']:.4f}")
    
    # Save model
    print("\n[7/7] Saving model and metadata...")
    os.makedirs('app/models', exist_ok=True)
    model_path = 'app/models/phishing_detector.pkl'
    joblib.dump(model, model_path)
    print(f"   ✓ Model saved to {model_path}")
    
    # Save metadata
    metadata = {
        'model_version': '2.0.0',
        'training_date': datetime.now().isoformat(),
        'dataset_source': dataset_description,
        'n_samples': len(df),
        'n_features': len(feature_columns),
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'cv_mean_accuracy': float(cv_scores.mean()),
        'cv_std_accuracy': float(cv_scores.std()),
        'feature_names': feature_columns,
        'dataset_citation': 'UCI Machine Learning Repository - Phishing Websites Dataset'
    }
    
    metadata_path = 'app/models/model_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"   ✓ Metadata saved to {metadata_path}")
    
    # Save feature importance
    feature_importance.to_csv('app/models/feature_importance.csv', index=False)
    print(f"   ✓ Feature importance saved")
    
    print("\n" + "=" * 70)
    print("✓ TRAINING COMPLETE!")
    print("=" * 70)
    print(f"\nModel Performance Summary:")
    print(f"  • Dataset: {dataset_description}")
    print(f"  • Samples: {len(df):,}")
    print(f"  • Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"  • Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"  • Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"  • F1-Score:  {f1:.4f} ({f1*100:.2f}%)")
    print(f"  • Model: {model_path}")
    print("\nStart the ML service: python -m uvicorn app.main:app --host 0.0.0.0 --port 5000")
    print("=" * 70)


if __name__ == "__main__":
    train_model_with_real_data()
