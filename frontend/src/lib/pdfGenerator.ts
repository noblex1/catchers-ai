import jsPDF from "jspdf";
import type { ThreatAnalysis } from "./api";
import { categoryFromScore } from "./risk";

export const generateScanPDF = (result: ThreatAnalysis): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Helper function to add text with word wrap
  const addText = (
    text: string,
    fontSize: number = 10,
    isBold: boolean = false,
    color: [number, number, number] = [0, 0, 0]
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, contentWidth);
    
    // Check if we need a new page
    if (yPos + lines.length * fontSize * 0.35 > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.text(lines, margin, yPos);
    yPos += lines.length * fontSize * 0.35 + 3;
  };

  // Helper function to add a section header
  const addSection = (title: string) => {
    yPos += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, contentWidth, 10, "F");
    addText(title, 12, true, [0, 0, 0]);
    yPos += 2;
  };

  // Helper function to add a horizontal line
  const addLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
  };

  // Get risk category and color
  const category = result.riskCategory || categoryFromScore(result.threatScore);
  const riskColors: Record<string, [number, number, number]> = {
    LOW: [34, 197, 94],
    MEDIUM: [234, 179, 8],
    HIGH: [249, 115, 22],
    CRITICAL: [239, 68, 68],
  };
  const riskColor = riskColors[category] || [0, 0, 0];

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Catchers AI", margin, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Threat Analysis Report", margin, 30);

  yPos = 50;

  // Scan Information
  addSection("SCAN INFORMATION");
  addText(`Target: ${result.url || result.fileName || "N/A"}`, 10, false);
  addText(`Scan Date: ${result.scannedAt || result.scanDate || new Date().toLocaleString()}`, 10, false);
  if (result.processingTime) {
    addText(`Processing Time: ${result.processingTime}`, 10, false);
  }
  addLine();

  // Threat Score - Enhanced Display
  addSection("THREAT ASSESSMENT");
  
  // Draw a box for the threat score
  const scoreBoxX = margin;
  const scoreBoxY = yPos;
  const scoreBoxWidth = 50;
  const scoreBoxHeight = 40;
  
  // Background box with risk color
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight, 3, 3, "F");
  
  // White text for score
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  const scoreText = `${Math.round(result.threatScore)}`;
  const scoreWidth = doc.getTextWidth(scoreText);
  doc.text(scoreText, scoreBoxX + (scoreBoxWidth - scoreWidth) / 2, scoreBoxY + 27);
  
  // Risk category text next to the box
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`${category} RISK`, scoreBoxX + scoreBoxWidth + 10, scoreBoxY + 20);
  
  // Threat score label below
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("THREAT SCORE", scoreBoxX + (scoreBoxWidth - doc.getTextWidth("THREAT SCORE")) / 2, scoreBoxY + scoreBoxHeight + 5);
  
  yPos += scoreBoxHeight + 12;

  // Recommendation
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  addText("Recommendation:", 10, true);
  yPos -= 3;
  doc.setFont("helvetica", "normal");
  addText(result.recommendation, 10, false);
  addLine();

  // AI Analysis
  if (result.aiAnalysis) {
    addSection("AI ANALYSIS");
    addText(result.aiAnalysis, 10, false);
    addLine();
  }

  // Detection Methods
  if (result.detectionMethods && result.detectionMethods.length > 0) {
    addSection("DETECTION METHODS");
    result.detectionMethods.forEach((method) => {
      const resultColor: Record<string, [number, number, number]> = {
        PASS: [34, 197, 94],
        FAIL: [239, 68, 68],
        WARNING: [234, 179, 8],
      };
      const color = resultColor[method.result.toUpperCase()] || [0, 0, 0];
      
      addText(`• ${method.name}`, 10, true);
      addText(`  Result: ${method.result}`, 9, false, color);
      if (method.details) {
        addText(`  Details: ${method.details}`, 9, false);
      }
    });
    addLine();
  }

  // Risk Factors
  if (result.riskFactors && result.riskFactors.length > 0) {
    addSection("RISK FACTORS");
    result.riskFactors.forEach((factor) => {
      addText(`• ${factor}`, 10, false, [239, 68, 68]);
    });
    addLine();
  }

  // Security Features
  if (result.securityFeatures && result.securityFeatures.length > 0) {
    addSection("SECURITY FEATURES");
    result.securityFeatures.forEach((feature) => {
      addText(`• ${feature}`, 10, false, [34, 197, 94]);
    });
    addLine();
  }

  // ML Explainability
  if (result.explainability?.featureContributions && result.explainability.featureContributions.length > 0) {
    addSection("ML FEATURE IMPORTANCE");
    result.explainability.featureContributions.slice(0, 10).forEach((contrib) => {
      const importance = Math.round(Math.abs(contrib.importance) * 100);
      addText(`• ${contrib.feature}: ${importance}%`, 9, false);
    });
    addLine();
  }

  // ML Model Performance Metrics
  if (result.mlMetrics) {
    addSection("ML MODEL PERFORMANCE");
    
    const metrics = [
      { label: "Accuracy", value: result.mlMetrics.accuracy },
      { label: "Precision", value: result.mlMetrics.precision },
      { label: "Recall", value: result.mlMetrics.recall },
      { label: "F1 Score", value: result.mlMetrics.f1_score },
    ];
    
    // Create a grid-like layout
    const startX = margin;
    const startY = yPos;
    const boxWidth = (contentWidth - 10) / 2;
    const boxHeight = 25;
    
    metrics.forEach((metric, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (boxWidth + 10);
      const y = startY + row * (boxHeight + 5);
      
      // Draw box
      doc.setFillColor(245, 245, 250);
      doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, "F");
      
      // Label
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text(metric.label.toUpperCase(), x + 5, y + 8);
      
      // Value
      doc.setFontSize(18);
      doc.setTextColor(59, 130, 246);
      doc.setFont("helvetica", "bold");
      const percentage = `${(metric.value * 100).toFixed(1)}%`;
      doc.text(percentage, x + 5, y + 20);
    });
    
    yPos += Math.ceil(metrics.length / 2) * (boxHeight + 5) + 5;
    
    // Explanation
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    const explanation = "These metrics represent the ML model's performance on the test dataset. Accuracy shows overall correctness, Precision measures how many predicted threats are actual threats, Recall measures how many actual threats are detected, and F1 Score is the harmonic mean of precision and recall.";
    addText(explanation, 9, false, [100, 100, 100]);
    addLine();
  }

  // Technical Details
  if (result.technicalDetails && Object.keys(result.technicalDetails).length > 0) {
    addSection("TECHNICAL DETAILS");
    Object.entries(result.technicalDetails).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, " $1").trim();
      const formattedValue = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
      addText(`${formattedKey}:`, 10, true);
      addText(formattedValue, 9, false);
    });
    addLine();
  }

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated by Catchers AI - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Generate filename
  const target = result.url || result.fileName || "scan";
  const sanitizedTarget = target
    .replace(/[^a-z0-9]/gi, "_")
    .substring(0, 50);
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `catchers-ai-scan-${sanitizedTarget}-${timestamp}.pdf`;

  // Save the PDF
  doc.save(filename);
};
