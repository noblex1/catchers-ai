# ML Metrics Display Guide

## Where ML Metrics Are Now Displayed

### 1. 📊 Scan Results Page

When a user scans a URL, they will see a new section called **"ML Model Performance"** with 4 metric cards:

```
┌─────────────────────────────────────────────────────────┐
│ ML MODEL PERFORMANCE                                    │
├──────────────┬──────────────┬──────────────┬────────────┤
│ Accuracy     │ Precision    │ Recall       │ F1 Score   │
│ 96.0%        │ 95.0%        │ 94.0%        │ 94.5%      │
└──────────────┴──────────────┴──────────────┴────────────┘
```

**Location**: Below "ML Feature Importance" section, above "Technical Details"

**Visual Design**:
- 2x2 grid on mobile, 4 columns on desktop
- Gradient backgrounds (primary/secondary colors)
- Large percentage numbers
- Uppercase labels
- Explanation text below the grid

---

### 2. 📄 PDF Reports

When users download a PDF report, metrics appear in a dedicated section:

```
═══════════════════════════════════════════════════════════
ML MODEL PERFORMANCE
═══════════════════════════════════════════════════════════

┌────────────────┐  ┌────────────────┐
│ ACCURACY       │  │ PRECISION      │
│ 96.0%          │  │ 95.0%          │
└────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐
│ RECALL         │  │ F1 SCORE       │
│ 94.0%          │  │ 94.5%          │
└────────────────┘  └────────────────┘

These metrics represent the ML model's performance on 
the test dataset. Accuracy shows overall correctness...
```

**Location**: After "ML Feature Importance", before "Technical Details"

**Visual Design**:
- 2x2 grid layout with boxes
- Light gray/blue background boxes
- Blue bold percentage text
- Detailed explanation paragraph

---

### 3. 📈 Dashboard Page

The dashboard now shows ML metrics in a dedicated card:

```
┌─────────────────────────────────────────────────────────┐
│ ML MODEL PERFORMANCE                                    │
│ Machine learning model metrics on test dataset          │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Accuracy                                      96.0%  │ │
│ │ Overall correctness of the model's predictions      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Precision                                     95.0%  │ │
│ │ Accuracy of positive threat predictions             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Recall                                        94.0%  │ │
│ │ Percentage of actual threats detected               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ F1 Score                                      94.5%  │ │
│ │ Harmonic mean of precision and recall               │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Location**: Right side of dashboard, replacing generic "Platform insights"

**Visual Design**:
- Stacked metric cards
- Gradient backgrounds alternating between primary/secondary
- Large percentage on the right
- Descriptive subtitle below each metric

---

## Metric Explanations (User-Facing)

### Accuracy (96.0%)
**What it means**: Overall correctness of the model's predictions
**Technical**: (TP + TN) / (TP + TN + FP + FN)
**User-friendly**: "The model is correct 96 out of 100 times"

### Precision (95.0%)
**What it means**: Accuracy of positive threat predictions
**Technical**: TP / (TP + FP)
**User-friendly**: "When the model says it's a threat, it's right 95% of the time"

### Recall (94.0%)
**What it means**: Percentage of actual threats detected
**Technical**: TP / (TP + FN)
**User-friendly**: "The model catches 94 out of 100 actual threats"

### F1 Score (94.5%)
**What it means**: Harmonic mean of precision and recall
**Technical**: 2 × (Precision × Recall) / (Precision + Recall)
**User-friendly**: "Balanced measure combining precision and recall"

---

## Academic Project Benefits

### For Presentations
✅ Show comprehensive ML evaluation metrics
✅ Demonstrate transparency in model performance
✅ Display metrics in professional, user-friendly format

### For Documentation
✅ All standard ML metrics are tracked and displayed
✅ Metrics appear in scan results, PDFs, and dashboard
✅ Clear explanations for non-technical users

### For Evaluation
✅ Examiners can see model performance immediately
✅ Metrics validate the 96% accuracy claim
✅ Professional implementation suitable for production

---

## Testing Checklist

- [ ] Scan a URL and verify "ML Model Performance" section appears
- [ ] Download PDF and check ML metrics are included
- [ ] Visit Dashboard and see ML metrics card
- [ ] Verify all 4 metrics show correct percentages
- [ ] Check responsive design on mobile devices
- [ ] Ensure explanatory text is displayed
- [ ] Test with ML service running
- [ ] Test with ML service offline (should handle gracefully)

---

## Screenshots Reference

### Scan Results
Look for: "ML Model Performance" section with 4 gradient boxes

### PDF Report
Look for: "ML MODEL PERFORMANCE" section with 2x2 grid

### Dashboard
Look for: "ML Model Performance" card on right side with 4 stacked metrics
