"""
Simple script to download UCI Phishing Dataset
"""
import requests
import zipfile
import io
import pandas as pd
from pathlib import Path

# Create data directory
data_dir = Path("app/data")
data_dir.mkdir(parents=True, exist_ok=True)

print("=" * 70)
print("Downloading UCI Phishing Websites Dataset")
print("=" * 70)

# Download
url = "https://archive.ics.uci.edu/static/public/327/phishing+websites.zip"
print(f"Downloading from {url}...")
response = requests.get(url, timeout=60)
print(f"✓ Downloaded {len(response.content)} bytes")

# Extract
print("Extracting files...")
with zipfile.ZipFile(io.BytesIO(response.content)) as z:
    print(f"Files in archive: {z.namelist()}")
    
    # Find ARFF file - prefer Training Dataset
    arff_files = [f for f in z.namelist() if f.endswith('.arff')]
    arff_file = None
    
    # Try to get Training Dataset first
    for f in arff_files:
        if 'Training' in f or 'training' in f:
            arff_file = f
            break
    
    # Fallback to any ARFF file
    if not arff_file:
        arff_file = arff_files[0]
    
    print(f"✓ Found: {arff_file}")
    
    # Read ARFF and convert to CSV
    arff_content = z.read(arff_file).decode('utf-8')
    
    # Parse ARFF manually (simple approach)
    lines = arff_content.split('\n')
    
    # Find data section
    data_start = 0
    attributes = []
    for i, line in enumerate(lines):
        if line.strip().lower().startswith('@attribute'):
            # Extract attribute name
            parts = line.strip().split()
            if len(parts) >= 2:
                attr_name = parts[1]
                attributes.append(attr_name)
        elif line.strip().lower().startswith('@data'):
            data_start = i + 1
            break
    
    print(f"✓ Found {len(attributes)} attributes")
    print(f"✓ Data starts at line {data_start}")
    
    # Extract data rows
    data_rows = []
    for line in lines[data_start:]:
        line = line.strip()
        if line and not line.startswith('%'):  # Skip comments
            # Split by comma
            values = line.split(',')
            if len(values) == len(attributes):
                data_rows.append(values)
    
    print(f"✓ Extracted {len(data_rows)} data rows")
    
    # Create DataFrame
    df = pd.DataFrame(data_rows, columns=attributes)
    
    # Convert to numeric where possible
    for col in df.columns:
        try:
            df[col] = pd.to_numeric(df[col])
        except:
            pass
    
    # Save as CSV
    output_path = data_dir / "phishing_uci.csv"
    df.to_csv(output_path, index=False)
    print(f"✓ Saved to {output_path}")
    
    print("\n" + "=" * 70)
    print("DATASET SUMMARY")
    print("=" * 70)
    print(f"Total Samples: {len(df)}")
    print(f"Features: {len(df.columns)}")
    print(f"Columns: {list(df.columns)}")
    print(f"\nFirst 5 rows:")
    print(df.head())
    print("=" * 70)
    print("✓ SUCCESS! Dataset ready for training.")
