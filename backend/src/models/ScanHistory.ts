import mongoose, { Schema, Document } from 'mongoose';

export interface IScanHistory extends Document {
  url?: string;
  normalizedUrl?: string;
  extractedFeatures?: Record<string, unknown>;
  externalIntel?: Record<string, unknown>;
  whois?: Record<string, unknown>;
  redirect?: Record<string, unknown>;
  fileName?: string;
  fileType?: string;
  threatScore: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  aiAnalysis: string;
  riskFactors: string[];
  securityFeatures: string[];
  detectionMethods: Array<{
    name: string;
    result: 'PASS' | 'FAIL' | 'WARNING';
    source?: string;
  }>;
  technicalDetails: {
    domainAge?: string;
    sslStatus?: string;
    reputation?: string;
    suspiciousScripts?: string;
    hiddenIframes?: string;
    formSecurity?: string;
    ipLocation?: string;
    redirects?: string;
    responseTime?: string;
  };
  processingTime: string;
  createdAt: Date;
  updatedAt: Date;
  // VirusTotal scan ID for reference
  virusTotalScanId?: string;
  // IP address if available
  ipAddress?: string;
  userFeedback?: unknown;
  verifiedLabel?: boolean | null;
}

const ScanHistorySchema = new Schema<IScanHistory>(
  {
    url: { type: String, index: true },
      normalizedUrl: { type: String, index: true },
      extractedFeatures: { type: Schema.Types.Mixed },
      externalIntel: { type: Schema.Types.Mixed },
      whois: { type: Schema.Types.Mixed },
      redirect: { type: Schema.Types.Mixed },
    fileName: { type: String, index: true },
    fileType: { type: String },
    threatScore: { type: Number, required: true, min: 0, max: 100 },
    riskCategory: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      index: true,
    },
    recommendation: { type: String, required: true },
    aiAnalysis: { type: String, required: true },
    riskFactors: [{ type: String }],
    securityFeatures: [{ type: String }],
    detectionMethods: [{
      name: { type: String, required: true },
      result: { type: String, enum: ['PASS', 'FAIL', 'WARNING'], required: true },
      source: { type: String },
    }],
    technicalDetails: {
      domainAge: { type: String },
      sslStatus: { type: String },
      reputation: { type: String },
      suspiciousScripts: { type: String },
      hiddenIframes: { type: String },
      formSecurity: { type: String },
      ipLocation: { type: String },
      redirects: { type: String },
      responseTime: { type: String },
    },
    processingTime: { type: String, required: true },
    virusTotalScanId: { type: String },
    ipAddress: { type: String, index: true },
    // Optional fields for continuous learning
    userFeedback: { type: Schema.Types.Mixed },
    verifiedLabel: { type: Boolean, default: null },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ScanHistorySchema.index({ createdAt: -1 });
ScanHistorySchema.index({ threatScore: -1 });
ScanHistorySchema.index({ url: 1, createdAt: -1 });

export const ScanHistory = mongoose.model<IScanHistory>('ScanHistory', ScanHistorySchema);
