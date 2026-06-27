#!/usr/bin/env python3
"""
Deployment Readiness Check Script
Verifies ML service is ready for Render deployment
"""
import os
import sys
from pathlib import Path

def check_model_exists():
    """Check if trained model file exists"""
    model_path = Path("app/models/phishing_detector.pkl")
    metadata_path = Path("app/models/model_metadata.json")
    
    if not model_path.exists():
        print("❌ Model file not found: app/models/phishing_detector.pkl")
        print("   Run: python -m app.train_model_improved")
        return False
    
    if not metadata_path.exists():
        print("⚠️  Model metadata not found: app/models/model_metadata.json")
        print("   Model exists but metadata is missing")
    
    model_size = model_path.stat().st_size / (1024 * 1024)  # MB
    print(f"✅ Model file exists: {model_size:.2f} MB")
    return True

def check_requirements():
    """Check if requirements.txt exists"""
    req_path = Path("requirements.txt")
    if not req_path.exists():
        print("❌ requirements.txt not found")
        return False
    
    print("✅ requirements.txt exists")
    
    # Check for critical dependencies
    with open(req_path) as f:
        content = f.read()
        critical = ['fastapi', 'uvicorn', 'scikit-learn', 'joblib']
        missing = [dep for dep in critical if dep not in content.lower()]
        
        if missing:
            print(f"⚠️  Missing critical dependencies: {', '.join(missing)}")
            return False
    
    print("✅ All critical dependencies present")
    return True

def check_dockerfile():
    """Check if Dockerfile exists"""
    dockerfile_path = Path("Dockerfile")
    if not dockerfile_path.exists():
        print("❌ Dockerfile not found")
        return False
    
    print("✅ Dockerfile exists")
    return True

def check_render_yaml():
    """Check if render.yaml exists"""
    render_path = Path("render.yaml")
    if not render_path.exists():
        print("⚠️  render.yaml not found (optional)")
        return True
    
    print("✅ render.yaml exists")
    return True

def check_app_structure():
    """Check app directory structure"""
    required_files = [
        "app/__init__.py",
        "app/main.py",
        "app/ml_engine.py",
        "app/feature_extractor.py"
    ]
    
    missing = [f for f in required_files if not Path(f).exists()]
    
    if missing:
        print(f"❌ Missing required files: {', '.join(missing)}")
        return False
    
    print("✅ App structure is correct")
    return True

def check_git_status():
    """Check if model is tracked in git"""
    model_path = Path("app/models/phishing_detector.pkl")
    
    if not model_path.exists():
        return True  # Already reported by check_model_exists
    
    # Try to check git status
    try:
        import subprocess
        result = subprocess.run(
            ['git', 'ls-files', str(model_path)],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.stdout.strip():
            print("✅ Model file is tracked in git")
            return True
        else:
            print("⚠️  Model file is NOT tracked in git")
            print("   Run: git add app/models/phishing_detector.pkl")
            return False
    except:
        print("⚠️  Could not check git status (git not available)")
        return True

def main():
    """Run all checks"""
    print("🔍 Checking ML Service Deployment Readiness\n")
    print("=" * 50)
    
    checks = [
        ("Model file", check_model_exists),
        ("Requirements", check_requirements),
        ("Dockerfile", check_dockerfile),
        ("Render config", check_render_yaml),
        ("App structure", check_app_structure),
        ("Git tracking", check_git_status)
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n📋 Checking {name}...")
        results.append(check_func())
    
    print("\n" + "=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    if all(results):
        print(f"\n✅ All checks passed! ({passed}/{total})")
        print("\n🚀 Ready for Render deployment!")
        print("\nNext steps:")
        print("1. Commit and push to GitHub")
        print("2. Create new Web Service on Render")
        print("3. Connect to your repository")
        print("4. Deploy!")
        return 0
    else:
        print(f"\n⚠️  Some checks failed ({passed}/{total} passed)")
        print("\n❌ Fix the issues above before deploying")
        return 1

if __name__ == "__main__":
    sys.exit(main())
