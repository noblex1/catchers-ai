import { ThreatAnalysisResult, DetectionMethod, TechnicalDetails } from '../types/threatDetection.js';
import { threatIntelligenceService } from './threatIntelligence.js';
import { mlService } from './mlService.js';
import { lookupWhois } from './whoisService.js';
import { traceRedirects } from './redirectService.js';

export class ThreatAnalysisService {
  private suspiciousPatterns = [
    /bit\.ly|tinyurl|t\.co|short\.link|goo\.gl|ow\.ly/i, // URL shorteners
    /urgent|act now|limited time|verify account|suspended/i, // Phishing language
    /paypal|amazon|microsoft|google|apple|netflix|spotify/i, // Brand impersonation
    /click here|download now|free money|congratulations/i, // Suspicious calls to action
  ];

  private suspiciousTlds = /\.tk|\.ml|\.ga|\.cf|\.top|\.xyz|\.info|\.biz$/i;

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
    try {
      return await Promise.race<T>([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), timeoutMs)),
      ]);
    } catch {
      return fallbackValue;
    }
  }

  private toJsonSafe<T>(value: T, fallbackValue: T): T {
    try {
      return JSON.parse(JSON.stringify(value)) as T;
    } catch {
      return fallbackValue;
    }
  }

  /**
   * Analyze a URL for threats
   */
  async analyzeUrl(url: string): Promise<ThreatAnalysisResult> {
    const startTime = Date.now();

    try {
      // Validate URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      // Initialize analysis components
      let threatScore = 0;
      const riskFactors: string[] = [];
      const securityFeatures: string[] = [];
      const detectionMethods: DetectionMethod[] = [];

      // Run external intelligence checks in parallel with bounded timeouts.
      const [vtResult, gsbResult, ptResult] = await Promise.all([
        this.withTimeout(
          threatIntelligenceService.checkVirusTotal(url),
          12000,
          { isThreat: false, malicious: 0, suspicious: 0, harmless: 0 }
        ),
        this.withTimeout(
          threatIntelligenceService.checkGoogleSafeBrowsing(url),
          8000,
          { isThreat: false, threatTypes: [] }
        ),
        this.withTimeout(
          threatIntelligenceService.checkPhishTank(url),
          8000,
          { isPhishing: false, verified: false }
        ),
      ]);

      // 1. VirusTotal Check
      if (vtResult.isThreat) {
        threatScore += Math.min(70, vtResult.malicious * 10 + vtResult.suspicious * 5);
        riskFactors.push(
          `VirusTotal: ${vtResult.malicious} security engines flagged this as malicious, ${vtResult.suspicious} as suspicious`
        );
      } else if (vtResult.harmless > 0) {
        securityFeatures.push(`VirusTotal: ${vtResult.harmless} security engines marked this as harmless`);
      }
      detectionMethods.push({
        name: 'VirusTotal Analysis',
        result: vtResult.isThreat ? 'FAIL' : 'PASS',
        source: 'VirusTotal',
        details: `${vtResult.malicious} malicious, ${vtResult.suspicious} suspicious`,
      });

      // 2. Google Safe Browsing Check
      if (gsbResult.isThreat) {
        threatScore += 60;
        riskFactors.push(`Google Safe Browsing: Detected as ${gsbResult.threatTypes.join(', ')}`);
      } else {
        securityFeatures.push('Google Safe Browsing: No threats detected');
      }
      detectionMethods.push({
        name: 'Google Safe Browsing',
        result: gsbResult.isThreat ? 'FAIL' : 'PASS',
        source: 'Google',
        details: gsbResult.threatTypes.length > 0 ? gsbResult.threatTypes.join(', ') : 'Clean',
      });

      // 3. PhishTank Check
      if (ptResult.isPhishing) {
        threatScore += 50;
        const verification = ptResult.verified ? ' (verified)' : ' (unverified)';
        riskFactors.push(`PhishTank: Identified as phishing site${verification}`);
      }
      detectionMethods.push({
        name: 'PhishTank Database',
        result: ptResult.isPhishing ? 'FAIL' : 'PASS',
        source: 'PhishTank',
        details: ptResult.isPhishing ? 'Phishing site detected' : 'Not in database',
      });

      // 4. Domain WHOIS + Redirect Analysis (async but awaited here to build features)
      let whoisInfo: any = {};
      let redirectInfo: any = {};
      try {
        const [whoisRes, redirectRes] = await Promise.all([
          this.withTimeout(lookupWhois(domain), 5000, {}),
          this.withTimeout(traceRedirects(url, 3, 2500), 5000, {
            initialUrl: url,
            finalUrl: url,
            finalDomain: domain,
            hops: 0,
            chain: [url],
            domainChanged: false,
            usedShortener: false,
          }),
        ]);
        whoisInfo = whoisRes;
        redirectInfo = redirectRes;
      } catch (err) {
        console.warn('Non-fatal: WHOIS/redirect lookup failed', err);
      }

      const safeWhoisInfo = this.toJsonSafe<any>(
        // WHOIS raw payload can be noisy and occasionally non-serializable.
        { ...whoisInfo, raw: undefined },
        {}
      );
      const safeRedirectInfo = this.toJsonSafe<any>(redirectInfo, {
        initialUrl: url,
        finalUrl: url,
        finalDomain: domain,
        hops: 0,
        chain: [url],
        domainChanged: false,
        usedShortener: false,
      });

      // 5. Machine Learning Analysis (consume engineered features)
      const engineeredFeatures = {
        whois: safeWhoisInfo,
        redirect: safeRedirectInfo,
      };

      const mlResult = await this.withTimeout(
        mlService.analyzeUrl(url, engineeredFeatures),
        12000,
        null
      );
      if (mlResult) {
        const mlScore = mlResult.prediction.ml_score;
        const mlConfidence = mlResult.prediction.confidence;
        
        // Weight ML prediction based on confidence
        if (mlResult.prediction.is_threat) {
          threatScore += Math.round(mlScore * mlConfidence);
          riskFactors.push(
            `AI/ML Model: Detected as threat with ${(mlConfidence * 100).toFixed(1)}% confidence (ML Score: ${mlScore}/100)`
          );
          // Add ML-specific risk factors
          mlResult.risk_factors.forEach(factor => {
            if (!riskFactors.includes(factor)) {
              riskFactors.push(`ML Analysis: ${factor}`);
            }
          });
        } else {
          securityFeatures.push(
            `AI/ML Model: Classified as safe with ${(mlConfidence * 100).toFixed(1)}% confidence`
          );
        }
        
        detectionMethods.push({
          name: 'Machine Learning Analysis',
          result: mlResult.prediction.is_threat ? 'FAIL' : 'PASS',
          source: `ML Model v${mlResult.prediction.model_version}`,
          details: `Confidence: ${(mlConfidence * 100).toFixed(1)}%, Features: ${mlResult.prediction.features_analyzed}`,
        });
      } else {
        detectionMethods.push({
          name: 'Machine Learning Analysis',
          result: 'WARNING',
          details: 'ML service unavailable',
        });
      }

      // 5. HTTPS Check
      const hasHttps = url.toLowerCase().startsWith('https://');
      if (!hasHttps) {
        threatScore += 25;
        riskFactors.push('Uses insecure HTTP protocol (no SSL/TLS encryption)');
      } else {
        securityFeatures.push('Uses secure HTTPS protocol with SSL/TLS encryption');
      }
      detectionMethods.push({
        name: 'SSL/TLS Check',
        result: hasHttps ? 'PASS' : 'FAIL',
      });

      // 6. Heuristic Analysis
      const hasSuspiciousPattern = this.suspiciousPatterns.some(pattern => pattern.test(url));
      if (hasSuspiciousPattern) {
        threatScore += 20;
        riskFactors.push('Contains suspicious keywords or patterns commonly used in phishing');
      }
      detectionMethods.push({
        name: 'Heuristic Analysis',
        result: hasSuspiciousPattern ? 'WARNING' : 'PASS',
      });

      // 7. URL Shortener Check
      if (/bit\.ly|tinyurl|t\.co|short\.link|goo\.gl/i.test(url)) {
        threatScore += 15;
        riskFactors.push('Uses URL shortening service (hides true destination)');
      }

      // 8. Suspicious TLD Check
      if (this.suspiciousTlds.test(domain)) {
        threatScore += 10;
        riskFactors.push('Uses potentially suspicious top-level domain');
      }

      // 9. Domain Info (placeholder - would use real WHOIS API)
      const domainInfo = await threatIntelligenceService.getDomainInfo(domain);
      const technicalDetails: TechnicalDetails = {
        domainAge: safeWhoisInfo.domainAgeDays != null ? String(safeWhoisInfo.domainAgeDays) : domainInfo.age || 'N/A',
        sslStatus: hasHttps ? 'Valid' : 'Missing/Invalid',
        reputation: threatScore > 50 ? 'Poor' : vtResult.reputation ? `${vtResult.reputation}` : 'Unknown',
        ipLocation: 'N/A', // Would use IP geolocation API
        redirects: safeRedirectInfo.hops != null ? String(safeRedirectInfo.hops) : '0',
        responseTime: 'N/A',
        whois: safeWhoisInfo,
        redirect: safeRedirectInfo,
      };

      // Determine risk category
      let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      let recommendation: string;

      if (threatScore >= 80) {
        riskCategory = 'CRITICAL';
        recommendation = 'DO NOT VISIT - High phishing/malware risk detected by multiple security engines';
      } else if (threatScore >= 50) {
        riskCategory = 'HIGH';
        recommendation = 'Avoid this link - Multiple risk factors and security threats identified';
      } else if (threatScore >= 25) {
        riskCategory = 'MEDIUM';
        recommendation = 'Exercise caution - Some risk factors present, verify legitimacy before proceeding';
      } else {
        riskCategory = 'LOW';
        recommendation = 'Generally safe to visit with normal precautions';
      }

      // Generate AI analysis (enhanced with ML insights)
      const aiAnalysis = this.generateAIAnalysis(
        url,
        threatScore,
        riskFactors,
        riskCategory,
        vtResult,
        gsbResult,
        mlResult
      );

      // Build explainability payload deterministically from features and ML output
      const explainability = {
        numericRiskScore: Math.min(threatScore, 100),
        triggeredIndicators: riskFactors,
        suspiciousFeatures: securityFeatures,
        featureContributions: mlResult?.feature_importance || null,
      };

      const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

      return {
        url,
        threatScore: Math.min(threatScore, 100),
        riskCategory,
        recommendation,
        scanDate: new Date().toISOString(),
        processingTime,
        aiAnalysis,
        riskFactors,
        securityFeatures,
        detectionMethods,
        technicalDetails,
        explainability,
        whois: safeWhoisInfo,
        redirect: safeRedirectInfo,
        virusTotalScanId: vtResult.scanId,
      };
    } catch (error: any) {
      console.error('Threat analysis error:', error);
      
      // Return error result
      return {
        url,
        threatScore: 0,
        riskCategory: 'MEDIUM',
        recommendation: 'Analysis incomplete - Unable to fully scan this URL. Proceed with caution.',
        scanDate: new Date().toISOString(),
        processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
        aiAnalysis: 'Error occurred during threat analysis. Some security checks may not have completed.',
        riskFactors: ['Analysis incomplete - Error occurred during scanning'],
        securityFeatures: [],
        detectionMethods: [{
          name: 'Analysis',
          result: 'WARNING',
          details: 'Error during analysis',
        }],
        technicalDetails: {},
      };
    }
  }

  /**
   * Analyze file content for threats
   */
  async analyzeFile(fileName: string, fileContent: string, fileType?: string): Promise<ThreatAnalysisResult> {
    const startTime = Date.now();
    let threatScore = 0;
    const riskFactors: string[] = [];
    const securityFeatures: string[] = [];
    const detectionMethods: DetectionMethod[] = [];

    // 1. Machine Learning Content Analysis
    const mlResult = await mlService.analyzeContent(fileContent);
    if (mlResult) {
      const mlScore = mlResult.prediction.ml_score;
      const mlConfidence = mlResult.prediction.confidence;
      
      if (mlResult.prediction.is_threat) {
        threatScore += Math.round(mlScore * mlConfidence);
        riskFactors.push(
          `AI/ML Model: Detected as threat with ${(mlConfidence * 100).toFixed(1)}% confidence`
        );
        mlResult.risk_factors.forEach(factor => {
          if (!riskFactors.includes(factor)) {
            riskFactors.push(`ML Analysis: ${factor}`);
          }
        });
      } else {
        securityFeatures.push(
          `AI/ML Model: Classified as safe with ${(mlConfidence * 100).toFixed(1)}% confidence`
        );
      }
      
      detectionMethods.push({
        name: 'Machine Learning Content Analysis',
        result: mlResult.prediction.is_threat ? 'FAIL' : 'PASS',
        source: `ML Model v${mlResult.prediction.model_version}`,
        details: `Confidence: ${(mlConfidence * 100).toFixed(1)}%`,
      });
    }

    // 2. Check for suspicious HTML patterns
    if (/<script.*?>.*?<\/script>/is.test(fileContent)) {
      const scriptMatches = fileContent.match(/<script.*?>.*?<\/script>/gis);
      if (scriptMatches && scriptMatches.length > 5) {
        threatScore += 20;
        riskFactors.push(`Contains ${scriptMatches.length} script tags (potentially excessive)`);
      }
    }

    // 3. Check for iframe injections
    if (/<iframe/i.test(fileContent)) {
      threatScore += 30;
      riskFactors.push('Contains embedded iframes (potential malware injection)');
    }
    detectionMethods.push({
      name: 'Script Inspection',
      result: /<script/i.test(fileContent) ? 'WARNING' : 'PASS',
    });

    // 4. Check for suspicious form actions
    const formMatches = fileContent.match(/action\s*=\s*["']([^"']+)["']/gi);
    if (formMatches) {
      formMatches.forEach(match => {
        if (!/^https:/i.test(match)) {
          threatScore += 25;
          riskFactors.push('Form submits to insecure endpoint');
        }
      });
    }

    // 5. Check for phishing keywords
    const phishingKeywords = /verify.*account|suspended.*account|urgent.*action|click.*here.*immediately/i;
    if (phishingKeywords.test(fileContent)) {
      threatScore += 35;
      riskFactors.push('Contains typical phishing language patterns');
    }
    detectionMethods.push({
      name: 'Phishing Detection',
      result: phishingKeywords.test(fileContent) ? 'FAIL' : 'PASS',
    });

    // 6. Check for brand impersonation
    const brandKeywords = /paypal|amazon|microsoft|google|apple|netflix|spotify/i;
    if (brandKeywords.test(fileContent)) {
      threatScore += 15;
      riskFactors.push('Potentially impersonating well-known brands');
    }

    if (threatScore === 0) {
      securityFeatures.push('No obvious malicious patterns detected');
      securityFeatures.push('Content appears to follow standard practices');
    }

    detectionMethods.push({
      name: 'Content Analysis',
      result: threatScore > 30 ? 'FAIL' : 'PASS',
    });

    const riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
      threatScore >= 80 ? 'CRITICAL' :
      threatScore >= 50 ? 'HIGH' :
      threatScore >= 25 ? 'MEDIUM' : 'LOW';

    const recommendation =
      threatScore >= 80 ? 'DO NOT OPEN - High risk email/file detected' :
      threatScore >= 50 ? 'Quarantine recommended - Multiple threats found' :
      threatScore >= 25 ? 'Review carefully before opening' :
      'File appears safe for normal handling';

    const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

    return {
      fileName,
      fileType,
      threatScore: Math.min(threatScore, 100),
      riskCategory,
      recommendation,
      scanDate: new Date().toISOString(),
      processingTime,
      aiAnalysis: this.generateFileAIAnalysis(fileName, threatScore, riskFactors, riskCategory),
      riskFactors,
      securityFeatures,
      detectionMethods,
      technicalDetails: {
        suspiciousScripts: /<script/i.test(fileContent) ? 'Found' : 'None',
        hiddenIframes: /<iframe/i.test(fileContent) ? 'Found' : 'None',
        formSecurity: /action.*https/i.test(fileContent) ? 'Secure' : 'Unsecured',
      },
    };
  }

  private generateAIAnalysis(
    url: string,
    _score: number,
    risks: string[],
    category: string,
    vtResult: any,
    gsbResult: any,
    mlResult?: any
  ): string {
    // Include ML insights if available
    const mlInsight = mlResult?.prediction.is_threat 
      ? `Our machine learning model (trained on thousands of phishing patterns) has identified this URL as a threat with ${(mlResult.prediction.confidence * 100).toFixed(1)}% confidence. `
      : mlResult 
      ? `Our AI model has analyzed ${mlResult.prediction.features_analyzed} features and classified this as safe with ${(mlResult.prediction.confidence * 100).toFixed(1)}% confidence. `
      : '';
    
    if (category === 'CRITICAL') {
      return `${mlInsight}WARNING: "${url}" appears to be a highly dangerous website with multiple critical threat indicators. This site has been flagged by ${vtResult.malicious || 0} security engines as malicious and has been identified as ${gsbResult.threatTypes.join(' or ') || 'a threat'}. The combination of these factors strongly suggests this is designed for malicious purposes such as credential theft, malware distribution, or financial fraud.`;
    }

    if (category === 'HIGH') {
      return `${mlInsight}I've detected multiple red flags for "${url}" that strongly suggest this is a potentially dangerous site. ${risks.slice(0, 2).join(' and ').toLowerCase()} are common indicators of phishing or malware distribution. I strongly advise against visiting this site.`;
    }

    if (category === 'MEDIUM') {
      return `${mlInsight}The URL "${url}" shows some concerning patterns that warrant caution. While not definitively malicious, ${risks[0]?.toLowerCase() || 'certain risk factors'} suggest you should verify the site's legitimacy before providing any sensitive information.`;
    }

    return `${mlInsight}Based on my analysis, "${url}" appears to be a legitimate website with minimal security concerns. The site uses standard security practices and shows no obvious signs of malicious intent. However, remain vigilant and always verify sites before entering personal information.`;
  }

  private generateFileAIAnalysis(
    fileName: string,
    _score: number,
    risks: string[],
    category: string
  ): string {
    if (category === 'CRITICAL') {
      return `CRITICAL ALERT: "${fileName}" contains highly suspicious content that strongly indicates malicious intent. This file exhibits multiple characteristics of advanced phishing or malware campaigns and should be immediately quarantined.`;
    }

    if (category === 'HIGH') {
      return `The file "${fileName}" contains multiple suspicious elements commonly found in malicious emails or documents. The presence of ${risks.slice(0, 2).join(' and ').toLowerCase()} suggests this could be a phishing attempt or contain malware.`;
    }

    if (category === 'MEDIUM') {
      return `Analysis of "${fileName}" reveals some concerning patterns that suggest caution. ${risks[0] || 'Certain elements'} could potentially be used for malicious purposes, though this may also be legitimate functionality.`;
    }

    return `The file "${fileName}" appears to be clean with no obvious malicious indicators. The content follows standard formatting practices and contains no suspicious elements that would indicate malicious intent.`;
  }
}

export const threatAnalysisService = new ThreatAnalysisService();
