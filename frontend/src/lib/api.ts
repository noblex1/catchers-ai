import axios from "axios";
import { ensureBackendWarm } from "@/lib/backendWarmup";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  // Cold-hosted backends (e.g. Render) may need extra time on first request.
  timeout: 90_000,
});

const RETRYABLE_STATUS = new Set([408, 429, 502, 503, 504]);
const SCAN_MAX_ATTEMPTS = 4;
const SCAN_RETRY_DELAYS_MS = [0, 2500, 6000, 12000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function isRetryableScanError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;
  return RETRYABLE_STATUS.has(error.response.status);
}

async function withScanRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < SCAN_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(SCAN_RETRY_DELAYS_MS[attempt] ?? 12000);
    }
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const canRetry =
        attempt < SCAN_MAX_ATTEMPTS - 1 && isRetryableScanError(error);
      if (!canRetry) throw error;
    }
  }

  throw lastError;
}

export type RiskCategory = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DetectionMethod {
  name: string;
  result: "PASS" | "FAIL" | "WARNING" | string;
  details?: string;
}

export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
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
  mlMetrics?: MLMetrics;
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
  await ensureBackendWarm();
  return withScanRetry(async () => {
    const { data } = await api.post<ApiEnvelope<ThreatAnalysis>>(
      "/threats/analyze-url",
      { url }
    );
    return data.data;
  });
}

export async function analyzeFile(file: File) {
  const fileContent = await file.text();

  await ensureBackendWarm();
  return withScanRetry(async () => {
    const { data } = await api.post<ApiEnvelope<ThreatAnalysis>>(
      "/threats/analyze-file",
      {
        fileName: file.name,
        fileContent: fileContent,
        fileType: file.type || "text/plain",
      }
    );
    return data.data;
  });
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
  mlMetrics?: MLMetrics;
}

export async function getStatistics() {
  const { data } = await api.get<ApiEnvelope<Statistics>>(
    "/threats/statistics"
  );
  return data.data;
}
