import axios from "axios";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
});

export type RiskCategory = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DetectionMethod {
  name: string;
  result: "PASS" | "FAIL" | "WARNING" | string;
  details?: string;
}

export interface ThreatAnalysis {
  url?: string;
  fileName?: string;
  fileType?: string;
  threatScore: number;
  riskCategory: RiskCategory;
  recommendation: string;
  aiAnalysis?: string;
  riskFactors?: string[];
  securityFeatures?: string[];
  detectionMethods?: DetectionMethod[];
  technicalDetails?: Record<string, unknown>;
  explainability?: {
    numericRiskScore: number;
    triggeredIndicators: string[];
    suspiciousFeatures: string[];
    featureContributions?: Array<{ feature: string; importance: number }> | null;
  };
  processingTime?: string;
  scanDate?: string;
  scannedAt?: string;
  virusTotalScanId?: string;
  whois?: any;
  redirect?: any;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function analyzeUrl(url: string) {
  const { data } = await api.post<ApiEnvelope<ThreatAnalysis>>(
    "/threats/analyze-url",
    { url }
  );
  return data.data;
}

export async function analyzeFile(file: File) {
  // Read file content as text
  const fileContent = await file.text();
  
  const { data } = await api.post<ApiEnvelope<ThreatAnalysis>>(
    "/threats/analyze-file",
    {
      fileName: file.name,
      fileContent: fileContent,
      fileType: file.type || 'text/plain'
    }
  );
  return data.data;
}

export interface HistoryItem extends ThreatAnalysis {
  id?: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoryResponse {
  scans: HistoryItem[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

export async function getHistory(params: {
  limit?: number;
  skip?: number;
  riskCategory?: RiskCategory;
}) {
  const { data } = await api.get<ApiEnvelope<HistoryResponse>>(
    "/threats/history",
    { params }
  );
  return data.data;
}

export interface Statistics {
  totalScans: number;
  recentScans: number;
  avgThreatScore: number;
  threatDistribution: Record<RiskCategory, number>;
}

export async function getStatistics() {
  const { data } = await api.get<ApiEnvelope<Statistics>>(
    "/threats/statistics"
  );
  return data.data;
}
