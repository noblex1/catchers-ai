# PDF Download Feature

## Overview
The PDF download feature allows users to export their scan results as a professionally formatted PDF report.

## Features
- **Comprehensive Report**: Includes all scan details (threat score, risk category, AI analysis, detection methods, risk factors, security features, ML explainability, and technical details)
- **Professional Formatting**: Clean, branded layout with color-coded risk levels
- **Multi-page Support**: Automatically handles long reports with proper pagination
- **Accessible from Multiple Locations**:
  - Scan Results page (after scanning a URL)
  - File Scan Results page (after scanning a file)
  - History page (for any previously scanned item)

## Usage

### From Scan Results
1. After scanning a URL or file, look for the "Download PDF" button next to the risk badge
2. Click the button to generate and download the PDF report
3. The PDF will be saved with a descriptive filename: `catchers-ai-scan-[target]-[date].pdf`

### From History
1. Navigate to the History page
2. Hover over any scan entry
3. Click the PDF download icon (appears on hover)
4. The PDF report for that scan will be downloaded

## Technical Details

### Dependencies
- **jsPDF**: PDF generation library

### Implementation
- **PDF Generator**: `frontend/src/lib/pdfGenerator.ts`
- **Integration**: `frontend/src/components/ScanResults.tsx` and `frontend/src/pages/History.tsx`

### PDF Contents
1. **Header**: Catchers AI branding
2. **Scan Information**: Target URL/file, scan date, processing time
3. **Threat Assessment**: Large threat score with risk category
4. **AI Analysis**: Detailed AI-generated analysis
5. **Detection Methods**: Results from all detection engines
6. **Risk Factors**: List of identified risks (color-coded red)
7. **Security Features**: Positive security indicators (color-coded green)
8. **ML Feature Importance**: Top contributing features from ML model
9. **Technical Details**: Raw technical data
10. **Footer**: Page numbers and generation info

### Customization
The PDF layout can be customized by modifying `frontend/src/lib/pdfGenerator.ts`:
- Colors: Adjust RGB values in `riskColors` and `resultColor` objects
- Layout: Modify margins, font sizes, and spacing
- Content: Add or remove sections as needed
- Branding: Update header colors and text

## Error Handling
- If PDF generation fails, a toast notification will inform the user
- Errors are logged to the console for debugging
- The feature gracefully handles missing or incomplete data

## Browser Compatibility
Works in all modern browsers that support:
- Blob API
- URL.createObjectURL
- File download via anchor element

## Future Enhancements
- [ ] Add charts/graphs to PDF
- [ ] Include QR code linking to online report
- [ ] Support for custom branding/logos
- [ ] Email PDF directly from the app
- [ ] Batch PDF export for multiple scans
