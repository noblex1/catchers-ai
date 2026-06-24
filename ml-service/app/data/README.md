# Dataset Directory

This directory stores the downloaded phishing datasets used for model training.

## Files

### `phishing_uci.csv`
- **Source:** UCI Machine Learning Repository
- **URL:** https://archive.ics.uci.edu/dataset/327/phishing+websites
- **Size:** 11,055 URLs (phishing + legitimate)
- **Downloaded by:** `dataset_loader.py` script
- **Citation:** Mohammad, R., Thabtah, F., & McCluskey, L. (2015)

### `kaggle_phishing.csv` (optional)
- **Source:** Kaggle
- **URL:** https://www.kaggle.com/datasets/shashwatwork/web-page-phishing-detection-dataset
- **Manual download required**

### `phishtank_verified.csv` (optional)
- **Source:** PhishTank
- **URL:** https://www.phishtank.com/developer_info.php
- **Manual download required**

## Download Datasets

Run the dataset loader script:
```bash
python app/dataset_loader.py
```

This will automatically download the UCI Phishing Websites Dataset.

## Important Notes

- ✅ Datasets are cached locally after first download
- ✅ Re-running the loader reuses cached files
- ✅ Delete files here to force re-download
- ⚠️ This directory is in `.gitignore` (datasets not committed to repo)
- ⚠️ Total size: ~2-5 MB for UCI dataset

## Dataset Usage

These datasets are used by:
- `train_model_real_data.py` - Training script
- Model evaluation and validation
- Academic project documentation

## License

All datasets used are:
- ✅ Publicly available
- ✅ Licensed for academic use
- ✅ Properly cited in documentation

See `DATASET_DOCUMENTATION.md` in project root for full details.
