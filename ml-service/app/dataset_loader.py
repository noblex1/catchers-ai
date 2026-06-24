"""
Real Dataset Loader for Phishing Detection
Downloads and processes real phishing datasets from public sources
"""
import pandas as pd
import numpy as np
import requests
import os
from pathlib import Path
from typing import Tuple
import zipfile
import io


class PhishingDatasetLoader:
    """Load real phishing datasets for model training"""
    
    def __init__(self, data_dir: str = "app/data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
    def download_uci_phishing_dataset(self) -> pd.DataFrame:
        """
        Download UCI Phishing Websites Dataset
        Source: https://archive.ics.uci.edu/dataset/327/phishing+websites
        11,055 instances with 30 features
        """
        print("=" * 70)
        print("Downloading UCI Phishing Websites Dataset")
        print("=" * 70)
        
        dataset_path = self.data_dir / "phishing_uci.csv"
        
        # Check if already downloaded
        if dataset_path.exists():
            print(f"✓ Dataset already exists at {dataset_path}")
            df = pd.read_csv(dataset_path)
            print(f"✓ Loaded {len(df)} samples")
            return df
        
        # UCI dataset direct download URL
        # Alternative: Manual download from UCI repository
        url = "https://archive.ics.uci.edu/static/public/327/phishing+websites.zip"
        
        try:
            print(f"Downloading from UCI repository...")
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            
            # Extract zip file
            with zipfile.ZipFile(io.BytesIO(response.content)) as z:
                # Find the CSV file in the zip
                csv_files = [f for f in z.namelist() if f.endswith('.csv') or f.endswith('.arff')]
                if csv_files:
                    data_file = csv_files[0]
                    print(f"✓ Extracting {data_file}...")
                    
                    if data_file.endswith('.arff'):
                        # Convert ARFF to CSV
                        df = self._load_arff_from_zip(z, data_file)
                    else:
                        df = pd.read_csv(z.open(data_file))
                else:
                    raise Exception("No CSV/ARFF file found in archive")
            
            # Save for future use
            df.to_csv(dataset_path, index=False)
            print(f"✓ Saved dataset to {dataset_path}")
            print(f"✓ Loaded {len(df)} samples with {len(df.columns)} features")
            
            return df
            
        except Exception as e:
            print(f"⚠ Automatic download failed: {e}")
            print("\n" + "=" * 70)
            print("MANUAL DOWNLOAD INSTRUCTIONS:")
            print("=" * 70)
            print("1. Visit: https://archive.ics.uci.edu/dataset/327/phishing+websites")
            print("2. Click 'Download' button")
            print("3. Extract the downloaded file")
            print(f"4. Place the CSV file at: {dataset_path}")
            print("5. Run this script again")
            print("=" * 70)
            
            # Return synthetic data as fallback
            print("\n⚠ Using fallback synthetic data for now...")
            return self._create_fallback_data()
    
    def _load_arff_from_zip(self, zip_file, arff_filename: str) -> pd.DataFrame:
        """Convert ARFF format to pandas DataFrame"""
        try:
            from scipy.io import arff
            data, meta = arff.loadarff(zip_file.open(arff_filename))
            df = pd.DataFrame(data)
            
            # Decode bytes to strings if needed
            for col in df.columns:
                if df[col].dtype == object:
                    try:
                        df[col] = df[col].str.decode('utf-8')
                    except:
                        pass
            
            return df
        except ImportError:
            print("⚠ scipy not installed. Install with: pip install scipy")
            return self._create_fallback_data()
    
    def load_kaggle_dataset(self, csv_path: str = None) -> pd.DataFrame:
        """
        Load Kaggle Phishing Dataset
        Source: https://www.kaggle.com/datasets/shashwatwork/web-page-phishing-detection-dataset
        
        Manual steps:
        1. Download from Kaggle
        2. Place in app/data/kaggle_phishing.csv
        """
        if csv_path is None:
            csv_path = self.data_dir / "kaggle_phishing.csv"
        
        if not Path(csv_path).exists():
            print("=" * 70)
            print("KAGGLE DATASET - MANUAL DOWNLOAD REQUIRED")
            print("=" * 70)
            print("1. Visit: https://www.kaggle.com/datasets/shashwatwork/web-page-phishing-detection-dataset")
            print("2. Click 'Download' (requires Kaggle account)")
            print(f"3. Place the CSV at: {csv_path}")
            print("4. Run this script again")
            print("=" * 70)
            return self._create_fallback_data()
        
        df = pd.read_csv(csv_path)
        print(f"✓ Loaded Kaggle dataset: {len(df)} samples")
        return df
    
    def download_phishtank_urls(self, limit: int = 5000) -> pd.DataFrame:
        """
        Download verified phishing URLs from PhishTank
        Source: https://www.phishtank.com/developer_info.php
        """
        print("=" * 70)
        print("Downloading PhishTank Verified Phishing URLs")
        print("=" * 70)
        
        dataset_path = self.data_dir / "phishtank_verified.csv"
        
        # Check cache
        if dataset_path.exists():
            df = pd.read_csv(dataset_path)
            print(f"✓ Loaded cached PhishTank data: {len(df)} URLs")
            return df
        
        # PhishTank requires API key or manual download
        print("\n" + "=" * 70)
        print("PHISHTANK - MANUAL DOWNLOAD INSTRUCTIONS:")
        print("=" * 70)
        print("1. Visit: https://www.phishtank.com/developer_info.php")
        print("2. Download 'verified_online.csv'")
        print(f"3. Place at: {dataset_path}")
        print("4. Run this script again")
        print("=" * 70)
        
        return pd.DataFrame()
    
    def _create_fallback_data(self, n_samples: int = 10000) -> pd.DataFrame:
        """Create synthetic data as fallback"""
        print(f"\n⚠ Creating {n_samples} synthetic samples as fallback...")
        print("⚠ For academic submission, replace with real dataset!")
        
        np.random.seed(42)
        data = []
        
        # Generate samples with realistic feature names
        for i in range(n_samples):
            is_phishing = 1 if i >= n_samples // 2 else 0
            
            if is_phishing:
                data.append({
                    'url_length': np.random.randint(60, 150),
                    'domain_length': np.random.randint(15, 40),
                    'has_ip': np.random.choice([0, 1], p=[0.7, 0.3]),
                    'has_at': np.random.choice([0, 1], p=[0.8, 0.2]),
                    'double_slash_redirecting': np.random.choice([0, 1], p=[0.85, 0.15]),
                    'prefix_suffix': np.random.choice([0, 1], p=[0.7, 0.3]),
                    'sub_domains': np.random.randint(2, 6),
                    'https_token': np.random.choice([0, 1], p=[0.4, 0.6]),
                    'shortening_service': np.random.choice([0, 1], p=[0.85, 0.15]),
                    'suspicious_tld': np.random.choice([0, 1], p=[0.6, 0.4]),
                    'label': 1  # phishing
                })
            else:
                data.append({
                    'url_length': np.random.randint(20, 60),
                    'domain_length': np.random.randint(5, 20),
                    'has_ip': 0,
                    'has_at': 0,
                    'double_slash_redirecting': 0,
                    'prefix_suffix': 0,
                    'sub_domains': np.random.randint(0, 2),
                    'https_token': 1,
                    'shortening_service': 0,
                    'suspicious_tld': 0,
                    'label': 0  # legitimate
                })
        
        df = pd.DataFrame(data)
        print(f"✓ Generated {len(df)} synthetic samples")
        return df
    
    def prepare_training_data(self, dataset: str = "uci") -> Tuple[pd.DataFrame, str]:
        """
        Prepare training data from specified dataset
        
        Args:
            dataset: 'uci', 'kaggle', or 'phishtank'
        
        Returns:
            DataFrame and dataset description
        """
        if dataset.lower() == "uci":
            df = self.download_uci_phishing_dataset()
            description = "UCI Machine Learning Repository - Phishing Websites Dataset"
        elif dataset.lower() == "kaggle":
            df = self.load_kaggle_dataset()
            description = "Kaggle - Web Page Phishing Detection Dataset"
        elif dataset.lower() == "phishtank":
            df = self.download_phishtank_urls()
            description = "PhishTank - Verified Phishing URLs"
        else:
            print(f"⚠ Unknown dataset: {dataset}")
            df = self._create_fallback_data()
            description = "Synthetic Training Data (FALLBACK)"
        
        return df, description


def main():
    """Test dataset loading"""
    loader = PhishingDatasetLoader()
    
    print("\n" + "=" * 70)
    print("ATTEMPTING TO DOWNLOAD UCI PHISHING DATASET")
    print("=" * 70 + "\n")
    
    df, description = loader.prepare_training_data(dataset="uci")
    
    print("\n" + "=" * 70)
    print("DATASET SUMMARY")
    print("=" * 70)
    print(f"Source: {description}")
    print(f"Total Samples: {len(df)}")
    print(f"Features: {len(df.columns)}")
    print(f"\nColumn Names:\n{list(df.columns)}")
    print(f"\nFirst few rows:")
    print(df.head())
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
