"""
IMPROVED Model Training Script
Better feature mapping from UCI dataset to achieve 90%+ accuracy
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
import joblib
import os
import json
from datetime import datetime
from dataset_loader import PhishingDatasetLoader


def load_and_prepare_uci_data() -> pd.DataFrame:
    """
    Load UCI dataset and use features DIRECTLY without much conversion
    This preserves the original information better
    """
    print("\n[INFO] Loading UCI dataset with direct feature usage...")
    
    loader = PhishingDatasetLoader()
    raw_df, _ = loader.prepare_training_data(dataset="uci")
    
    # UCI dataset features - we'll use MOST of them directly
    # Result: -1 (phishing), 1 (legitimate)
    
    # Select features to use (30 features from UCI)
    feature_cols = [
        'having_IP_Address',
        'URL_Length', 
        'Shortining_Service',
        'having_At_Symbol',
        'double_slash_redirecting',
        'Prefix_Suffix',
        'having_Sub_Domain',
        'SSLfinal_State',
        'Domain_registeration_length',
        'Favicon',
        'port',
        'HTTPS_token',
        'Request_URL',
        'URL_of_Anchor',
        'Links_in_tags',
        'SFH',
        'Submitting_to_email',
        'Abnormal_URL',
        'Redirect',
        'on_mouseover',
        'RightClick',
        'popUpWidnow',
        'Iframe',
        'age_of_domain',
        'DNSRecord',
        'web_traffic',
        'Page_Rank',
        'Google_Index',
        'Links_pointing_to_page',
        'Statistical_report'
    ]
    
    # Create feature dataframe
    X = raw_df[feature_cols].copy()
    
    # Get label: Result column where -1 = phishing, 1 = legitimate
    # Convert to: 1 = phishing, 0 = legitimate
    y = (raw_df['Result'] == -1).astype(int)
    
    print(f"✓ Loaded {len(X)} samples with {len(feature_cols)} features")
    print(f"✓ Phishing: {y.sum()}, Legitimate: {(y == 0).sum()}")
    
    return X, y, feature_cols


def train_improved_model():
    """Train with better approach using UCI features directly"""
    print("=" * 70)
    print("Catchers AI - IMPROVED ML Model Training")
    print("=" * 70)
    
    # Load data
    print("\n[1/6] Loading UCI dataset with direct features...")
    X, y, feature_names = load_and_prepare_uci_data()
    
    # Split data
    print("\n[2/6] Splitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   ✓ Training set: {len(X_train)} samples")
    print(f"   ✓ Test set: {len(X_test)} samples")
    
    # Option 1: Random Forest with hyperparameter tuning
    print("\n[3/6] Training Random Forest with optimized parameters...")
    
    model = RandomForestClassifier(
        n_estimators=200,          # More trees
        max_depth=30,              # Deeper trees
        min_samples_split=2,       # More splits
        min_samples_leaf=1,        # More granular
        max_features='sqrt',       # Feature sampling
        bootstrap=True,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'    # Handle class imbalance
    )
    
    model.fit(X_train, y_train)
    print("   ✓ Model trained successfully")
    
    # Evaluate
    print("\n[4/6] Evaluating model...")
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
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
        print(f"   {row['feature']:.<35} {row['importance']:.4f}")
    
    # Save model
    print("\n[5/6] Saving improved model...")
    os.makedirs('app/models', exist_ok=True)
    
    # Save the model
    model_path = 'app/models/phishing_detector.pkl'
    joblib.dump(model, model_path)
    print(f"   ✓ Model saved to {model_path}")
    
    # Save metadata with improved performance
    metadata = {
        'model_version': '3.0.0',
        'model_type': 'Random Forest Classifier (Optimized)',
        'training_date': datetime.now().isoformat(),
        'dataset_source': 'UCI Machine Learning Repository - Phishing Websites Dataset',
        'n_samples': len(X),
        'n_features': len(feature_names),
        'feature_names': feature_names,
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'cv_mean_accuracy': float(cv_scores.mean()),
        'cv_std_accuracy': float(cv_scores.std()),
        'hyperparameters': {
            'n_estimators': 200,
            'max_depth': 30,
            'min_samples_split': 2,
            'min_samples_leaf': 1,
            'class_weight': 'balanced'
        },
        'dataset_citation': 'UCI Machine Learning Repository - Phishing Websites Dataset',
        'notes': 'Uses UCI features directly for better performance'
    }
    
    metadata_path = 'app/models/model_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"   ✓ Metadata saved to {metadata_path}")
    
    # Save feature importance
    feature_importance.to_csv('app/models/feature_importance.csv', index=False)
    print(f"   ✓ Feature importance saved")
    
    # Save feature name mapping for inference
    feature_mapping = {
        'uci_features': feature_names,
        'num_features': len(feature_names)
    }
    with open('app/models/feature_mapping.json', 'w') as f:
        json.dump(feature_mapping, f, indent=2)
    print(f"   ✓ Feature mapping saved")
    
    print("\n[6/6] Model training complete!")
    
    print("\n" + "=" * 70)
    print("✓ IMPROVED TRAINING COMPLETE!")
    print("=" * 70)
    print(f"\nModel Performance Summary:")
    print(f"  • Dataset: UCI Phishing Websites Dataset")
    print(f"  • Samples: {len(X):,}")
    print(f"  • Features: {len(feature_names)} (direct UCI features)")
    print(f"  • Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"  • Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"  • Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"  • F1-Score:  {f1:.4f} ({f1*100:.2f}%)")
    print(f"  • Model: {model_path}")
    
    # Performance improvement note
    print("\n📊 Performance Analysis:")
    if accuracy >= 0.90:
        print("   🎉 EXCELLENT! Accuracy ≥ 90%")
    elif accuracy >= 0.85:
        print("   ✅ VERY GOOD! Accuracy ≥ 85%")
    elif accuracy >= 0.80:
        print("   ✓ GOOD! Accuracy ≥ 80%")
    else:
        print("   ⚠ ACCEPTABLE but can be improved")
    
    print("\n⚠️ IMPORTANT NOTE:")
    print("   This model uses UCI features directly and won't work with")
    print("   your current feature extraction pipeline. You need to either:")
    print("   1. Update feature extraction to match UCI features, OR")
    print("   2. Use the mapped feature model (v2.0.0) for production")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    train_improved_model()
