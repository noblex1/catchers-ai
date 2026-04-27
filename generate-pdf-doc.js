const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter
function markdownToHTML(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```(.*?)```/gims, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
  
  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (!para.match(/^<[h|u|p|l|d|t]/)) {
      return '<p>' + para + '</p>';
    }
    return para;
  }).join('\n');
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  
  // Tables
  html = html.replace(/\|(.+)\|/g, function(match) {
    const cells = match.split('|').filter(cell => cell.trim());
    return '<tr>' + cells.map(cell => '<td>' + cell.trim() + '</td>').join('') + '</tr>';
  });
  
  return html;
}

// Read the markdown file
const markdownContent = fs.readFileSync('CATCHERS_AI_DOCUMENTATION.md', 'utf8');

// Convert to HTML
const htmlContent = markdownToHTML(markdownContent);

// Create a complete HTML document with styling
const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catchers AI - Professional Documentation</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }
    
    h1 {
      color: #2563eb;
      font-size: 2.5em;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 0.3em;
      page-break-after: avoid;
    }
    
    h2 {
      color: #1e40af;
      font-size: 2em;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      border-bottom: 2px solid #93c5fd;
      padding-bottom: 0.2em;
      page-break-after: avoid;
    }
    
    h3 {
      color: #1e3a8a;
      font-size: 1.5em;
      margin-top: 1.2em;
      margin-bottom: 0.4em;
      page-break-after: avoid;
    }
    
    p {
      margin: 0.8em 0;
      text-align: justify;
    }
    
    ul, ol {
      margin: 0.8em 0;
      padding-left: 2em;
    }
    
    li {
      margin: 0.4em 0;
    }
    
    code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #dc2626;
    }
    
    pre {
      background-color: #1e293b;
      color: #e2e8f0;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    
    pre code {
      background-color: transparent;
      color: #e2e8f0;
      padding: 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    
    td {
      border: 1px solid #d1d5db;
      padding: 0.5em;
    }
    
    tr:first-child td {
      background-color: #2563eb;
      color: white;
      font-weight: bold;
    }
    
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 2em 0;
    }
    
    strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    a {
      color: #2563eb;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    @media print {
      body {
        background: white;
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
      }
      
      pre, table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${htmlContent}
  
  <hr>
  <p style="text-align: center; color: #6b7280; font-size: 0.9em; margin-top: 3em;">
    <strong>Catchers AI - Professional Documentation</strong><br>
    Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
    © 2026 Catchers AI. All rights reserved.
  </p>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync('CATCHERS_AI_DOCUMENTATION.html', fullHTML, 'utf8');

console.log('✅ HTML documentation generated: CATCHERS_AI_DOCUMENTATION.html');
console.log('📄 You can now:');
console.log('   1. Open the HTML file in a browser');
console.log('   2. Use browser Print > Save as PDF to generate the PDF');
console.log('   3. Or use a tool like wkhtmltopdf or puppeteer for automated PDF generation');
