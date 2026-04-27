/**
 * Automated PDF Generator for Catchers AI Documentation
 * 
 * This script converts the markdown documentation to a professional PDF
 * using html-pdf-node library (which uses puppeteer under the hood)
 * 
 * Usage: node generate-pdf-automated.js
 */

const fs = require('fs');

// Check if html-pdf-node is installed
let htmlPdf;
try {
  htmlPdf = require('html-pdf-node');
} catch (error) {
  console.log('📦 Installing html-pdf-node...');
  console.log('⚠️  This requires puppeteer which may take a few minutes to download Chromium');
  console.log('');
  console.log('Please run: npm install html-pdf-node');
  console.log('');
  console.log('Alternative: Open CATCHERS_AI_DOCUMENTATION.html in your browser and use Print > Save as PDF');
  process.exit(1);
}

async function generatePDF() {
  try {
    console.log('📄 Reading HTML documentation...');
    
    // Read the generated HTML file
    const htmlContent = fs.readFileSync('CATCHERS_AI_DOCUMENTATION.html', 'utf8');
    
    console.log('🔄 Converting to PDF...');
    
    // PDF options
    const options = {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    };
    
    // File configuration
    const file = { content: htmlContent };
    
    // Generate PDF
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    // Save PDF
    fs.writeFileSync('CATCHERS_AI_DOCUMENTATION.pdf', pdfBuffer);
    
    console.log('');
    console.log('✅ PDF generated successfully!');
    console.log('📁 File: CATCHERS_AI_DOCUMENTATION.pdf');
    console.log('');
    console.log('📊 Documentation includes:');
    console.log('   ✓ Executive Summary');
    console.log('   ✓ System Architecture');
    console.log('   ✓ Complete Technology Stack');
    console.log('   ✓ Core Features & Components');
    console.log('   ✓ Threat Detection Pipeline');
    console.log('   ✓ Machine Learning Model Details');
    console.log('   ✓ API Documentation');
    console.log('   ✓ Security & Privacy');
    console.log('   ✓ Performance Metrics');
    console.log('   ✓ Deployment Architecture');
    console.log('   ✓ Future Enhancements');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    console.log('');
    console.log('💡 Alternative method:');
    console.log('   1. Open CATCHERS_AI_DOCUMENTATION.html in Chrome/Edge');
    console.log('   2. Press Ctrl+P (or Cmd+P on Mac)');
    console.log('   3. Select "Save as PDF" as destination');
    console.log('   4. Click "Save"');
    process.exit(1);
  }
}

// Run the generator
generatePDF();
