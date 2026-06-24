export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DetectionMethodResult = 'PASS' | 'FAIL' | 'WARNING';

export interface DetectionMethod {
  name: string;
  result: DetectionMethodResult;
  source?: string;
  details?: string;
}

export interface TechnicalDetails {
  domainAge?: string;
  sslStatus?: string;
  reputation?: string;
  suspiciousScripts?: string;
  hiddenIframes?: string;
  formSecurity?: string;
  ipLocation?: string;
  redirects?: string;
  responseTime?: string;
  whois?: any;
  redirect?: any;
}

export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export interface ThreatAnalysisResult {
  url?: string;
  fileName?: string;
  fileType?: string;
  threatScore: number;
  riskCategory: RiskCategory;
  recommendation: string;
  scanDate: string;
  processingTime: string;
  aiAnalysis: string;
  riskFactors: string[];
  securityFeatures: string[];
  detectionMethods: DetectionMethod[];
  technicalDetails: TechnicalDetails;
  virusTotalScanId?: string;
  ipAddress?: string;
  explainability?: {
    numericRiskScore: number;
    triggeredIndicators: string[];
    suspiciousFeatures: string[];
    featureContributions?: Array<{ feature: string; importance: number }> | null;
  };
  mlMetrics?: MLMetrics | null;
  whois?: any;
  redirect?: any;
}

export interface VirusTotalResponse {
  data: {
    attributes: {
      last_analysis_stats: {
        harmless: number;
        malicious: number;
        suspicious: number;
        undetected: number;
        timeout: number;
      };
      last_analysis_results: Record<string, {
        category: string;
        result: string;
        method: string;
        engine_name: string;
      }>;
      reputation: number;
      url: string;
    };
    id: string;
    type: string;
  };
}

export interface GoogleSafeBrowsingResponse {
  matches?: Array<{
    threatType: string;
    platformType: string;
    threat: { url: string };
    cacheDuration: string;
  }>;
}

export interface PhishTankResponse {
  in_database: boolean;
  phish_id?: number;
  url?: string;
  phish_detail_page?: string;
  verified?: string;
  verification_time?: string;
}
