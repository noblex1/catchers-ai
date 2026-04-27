# Frontend-Backend Integration Guide for Catchers AI

## 🎯 Current Status Analysis

### ✅ What's Working Well

1. **Frontend Setup:**
   - Modern React 18 + TypeScript + Vite
   - Tailwind CSS + shadcn/ui components
   - React Query for API state management
   - React Router for navigation
   - Axios for HTTP requests
   - Framer Motion for animations
   - Recharts for data visualization

2. **Backend Setup:**
   - Node.js + Express + TypeScript
   - MongoDB Atlas connected
   - ML Service running on port 5000
   - All APIs tested and working

3. **Pages Implemented:**
   - ✅ Home/Landing (Index)
   - ✅ URL Scanner (Scan)
   - ✅ File Scanner (FileScan)
   - ✅ Scan History (History)
   - ✅ Dashboard/Statistics (Dashboard)
   - ✅ About page

---

## ⚠️ Issues Found & Fixes Needed

### Issue 1: File Upload API Mismatch

**Problem:**
- Frontend sends: `multipart/form-data` with file
- Backend expects: JSON with `{ fileName, fileContent, fileType }`

**Solution:** Update frontend to read file content and send as JSON

### Issue 2: Missing Environment Variable

**Problem:**
- No `.env` file in frontend
- API URL defaults to `http://localhost:3000`

**Solution:** Create `.env` file with proper configuration

### Issue 3: API Response Structure Mismatch

**Problem:**
- Backend returns: `{ success: true, data: {...} }`
- Frontend expects: Direct data or needs proper unwrapping

**Solution:** Already handled correctly in `api.ts` ✅

### Issue 4: History API Response Format

**Problem:**
- Backend returns: `{ success: true, data: { scans: [...], pagination: {...} } }`
- Frontend expects: Direct array

**Solution:** Update frontend to handle pagination structure

---

## 🔧 Required Fixes

### Fix 1: Create Environment File

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production:
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

### Fix 2: Update File Analysis API Call

**File:** `frontend/src/lib/api.ts`

**Current (Incorrect):**
```typescript
export async function analyzeFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<ApiEnvelope<ThreatAnalysis>>(
    "/threats/analyze-file",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
}
```

**Fixed (Correct):**
```typescript
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
```

### Fix 3: Update History API Call

**File:** `frontend/src/lib/api.ts`

**Current:**
```typescript
export async function getHistory(params: {
  limit?: number;
  skip?: number;
  riskCategory?: RiskCategory;
}) {
  const { data } = await api.get<ApiEnvelope<HistoryItem[]>>(
    "/threats/history",
    { params }
  );
  return data.data;
}
```

**Fixed:**
```typescript
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
  return data.data; // Returns { scans, pagination }
}
```

### Fix 4: Update Statistics API Call

**File:** `frontend/src/lib/api.ts`

**Current:**
```typescript
export interface Statistics {
  totalScans: number;
  recentScans24h: number;
  averageThreatScore: number;
  threatDistribution: { category: RiskCategory; count: number }[];
  timeline?: { date: string; scans: number }[];
}
```

**Fixed (Match Backend Response):**
```typescript
export interface Statistics {
  totalScans: number;
  recentScans: number; // Backend returns "recentScans" not "recentScans24h"
  avgThreatScore: number; // Backend returns "avgThreatScore" not "averageThreatScore"
  threatDistribution: Record<RiskCategory, number>; // Backend returns object not array
}
```

### Fix 5: Update ThreatAnalysis Interface

**File:** `frontend/src/lib/api.ts`

**Add missing fields from backend:**
```typescript
export interface ThreatAnalysis {
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
    whois?: any;
    redirect?: any;
  };
  explainability?: {
    numericRiskScore: number;
    triggeredIndicators: string[];
    suspiciousFeatures: string[];
    featureContributions?: Array<{ feature: string; importance: number }> | null;
  };
  virusTotalScanId?: string;
  whois?: any;
  redirect?: any;
}
```

### Fix 6: Update Explainability Handling

**File:** `frontend/src/components/ScanResults.tsx`

**Current:**
```typescript
const explainability = result.explainability || [];
```

**Fixed:**
```typescript
const explainability = result.explainability?.featureContributions || [];
```

---

## 📝 Complete Updated Files

### 1. `frontend/.env` (NEW FILE)

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME=Catchers AI
```

### 2. `frontend/src/lib/api.ts` (UPDATED)

```typescript
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
  source?: string;
  details?: string;
}

export interface ThreatAnalysis {
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
    whois?: any;
    redirect?: any;
  };
  explainability?: {
    numericRiskScore: number;
    triggeredIndicators: string[];
    suspiciousFeatures: string[];
    featureContributions?: Array<{ feature: string; importance: number }> | null;
  };
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
```

### 3. `frontend/src/components/ScanResults.tsx` (UPDATED)

Update the explainability section:

```typescript
// Around line 120, change:
const explainability = result.explainability || [];

// To:
const explainability = result.explainability?.featureContributions || [];
```

---

## 🚀 Testing Steps

### Step 1: Start All Services

**Terminal 1 - ML Service:**
```bash
cd ml-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Verify Services

1. **ML Service:** http://localhost:5000/health
   - Should return: `{ "status": "healthy", "model_loaded": true }`

2. **Backend:** http://localhost:3000/health
   - Should return: `{ "status": "ok", "database": "connected" }`

3. **Frontend:** http://localhost:8080
   - Should load the landing page

### Step 3: Test URL Scanning

1. Go to http://localhost:8080/scan
2. Enter a URL: `http://phishing-site.tk/login`
3. Click "Analyze"
4. Should see:
   - Loading animation
   - Threat score gauge
   - Risk category badge
   - AI analysis
   - Detection methods
   - Risk factors

### Step 4: Test File Scanning

1. Go to http://localhost:8080/file-scan
2. Create a test HTML file:
```html
<html>
<body>
<h1>URGENT: Verify Your PayPal Account</h1>
<form action="http://evil.com/steal.php">
  <input type="password" name="pass">
</form>
<iframe src="http://malware.com"></iframe>
</body>
</html>
```
3. Upload the file
4. Should see threat analysis results

### Step 5: Test History

1. After scanning a few URLs
2. Go to http://localhost:8080/history
3. Should see list of past scans
4. Test filters by risk category

### Step 6: Test Dashboard

1. Go to http://localhost:8080/dashboard
2. Should see:
   - Total scans counter
   - Recent scans (24h)
   - Average threat score
   - Threat distribution chart

---

## 🔍 Debugging Tips

### Frontend Not Connecting to Backend

**Check:**
1. Backend is running on port 3000
2. `.env` file exists with correct `VITE_API_BASE_URL`
3. CORS is configured in backend (already done ✅)
4. Browser console for errors

**Fix:**
```bash
# In frontend directory
cat .env
# Should show: VITE_API_BASE_URL=http://localhost:3000

# Restart frontend after creating .env
npm run dev
```

### File Upload Failing

**Check:**
1. File size < 10MB
2. File type is .html, .txt, or .eml
3. Backend `/api/v1/threats/analyze-file` endpoint working

**Test Backend Directly:**
```bash
curl -X POST http://localhost:3000/api/v1/threats/analyze-file \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.html",
    "fileContent": "<html><body>Test</body></html>",
    "fileType": "text/html"
  }'
```

### History Not Loading

**Check:**
1. MongoDB is connected
2. Some scans have been performed
3. Backend `/api/v1/threats/history` endpoint working

**Test Backend Directly:**
```bash
curl http://localhost:3000/api/v1/threats/history?limit=10
```

### ML Service Not Responding

**Check:**
1. ML service is running on port 5000
2. Model is loaded successfully
3. Backend can reach ML service

**Test ML Service:**
```bash
curl http://localhost:5000/health
```

---

## 📊 Expected Data Flow

### URL Scan Flow

```
User enters URL
    ↓
Frontend validates URL format
    ↓
POST /api/v1/threats/analyze-url
    ↓
Backend receives request
    ↓
Parallel execution:
  - VirusTotal API
  - Google Safe Browsing API
  - PhishTank API
  - WHOIS Lookup
  - Redirect Tracing
    ↓
POST http://localhost:5000/api/ml/analyze-url
    ↓
ML Service analyzes with 27 features
    ↓
Backend aggregates all results
    ↓
Calculate final threat score
    ↓
Save to MongoDB (async)
    ↓
Return response to frontend
    ↓
Frontend displays results with animations
```

### File Scan Flow

```
User uploads file
    ↓
Frontend reads file content
    ↓
POST /api/v1/threats/analyze-file
    ↓
Backend receives { fileName, fileContent, fileType }
    ↓
POST http://localhost:5000/api/ml/analyze-content
    ↓
ML Service analyzes content
    ↓
Backend performs heuristic analysis
    ↓
Calculate threat score
    ↓
Save to MongoDB (async)
    ↓
Return response to frontend
    ↓
Frontend displays results
```

---

## ✅ Checklist

Before considering integration complete:

- [ ] Created `frontend/.env` file
- [ ] Updated `frontend/src/lib/api.ts` with fixes
- [ ] Updated `frontend/src/components/ScanResults.tsx` explainability
- [ ] All three services running (ML, Backend, Frontend)
- [ ] URL scanning works end-to-end
- [ ] File scanning works end-to-end
- [ ] History page loads and displays scans
- [ ] Dashboard shows statistics
- [ ] No console errors in browser
- [ ] No errors in backend logs
- [ ] No errors in ML service logs

---

## 🎉 Success Criteria

Your integration is successful when:

1. ✅ User can scan URLs and see detailed threat analysis
2. ✅ User can upload files and see analysis results
3. ✅ Scan history displays past scans with filtering
4. ✅ Dashboard shows real-time statistics
5. ✅ All animations and UI transitions work smoothly
6. ✅ Error messages are clear and helpful
7. ✅ Loading states provide feedback during analysis
8. ✅ Results are accurate and match backend data

---

## 🚀 Next Steps (Optional Enhancements)

1. **Add Dark Mode Toggle** (next-themes already installed)
2. **Export Reports as PDF**
3. **Share Scan Results** (generate unique URLs)
4. **Real-time Notifications** (WebSocket)
5. **User Authentication** (save scans to user account)
6. **API Rate Limiting UI** (show remaining requests)
7. **Comparison Tool** (compare multiple URLs)
8. **Browser Extension** (quick scan from any page)

---

**Integration Guide Created:** April 27, 2026  
**Status:** Ready for implementation  
**Estimated Time:** 15-30 minutes
