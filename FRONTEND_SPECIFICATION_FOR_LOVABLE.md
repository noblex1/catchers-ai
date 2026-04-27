# Catchers AI - Frontend Development Specification

## Project Overview

Build a modern, professional frontend web application for **Catchers AI**, an advanced threat detection and phishing analysis platform. The frontend should provide an intuitive interface for users to analyze URLs and files for security threats using our existing backend API.

---

## 🎯 Project Context

**Catchers AI** is a comprehensive security platform that combines:
- Multiple threat intelligence sources (VirusTotal, Google Safe Browsing, PhishTank)
- Machine Learning-powered threat detection (Random Forest classifier with 96% accuracy)
- Real-time URL and file content analysis
- WHOIS domain intelligence and redirect tracing
- Historical scan tracking and analytics

**Your Task:** Build ONLY the frontend that connects to our existing backend API.

---

## 🔗 Backend API Information

### Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://catchers-ai.onrender.com` (or your deployed URL)

### Available Endpoints

#### 1. Health Check
```
GET /health
Response: { status, timestamp, uptime, database }
```

#### 2. Analyze URL (Primary Feature)
```
POST /api/v1/threats/analyze-url
Content-Type: application/json

Request Body:
{
  "url": "https://example.com"
}

Response:
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "threatScore": 25,              // 0-100
    "riskCategory": "LOW",          // LOW, MEDIUM, HIGH, CRITICAL
    "recommendation": "Generally safe to visit...",
    "scanDate": "2026-04-27T02:26:48.676Z",
    "processingTime": "2.5s",
    "aiAnalysis": "Based on my analysis...",
    "riskFactors": [
      "Uses insecure HTTP protocol",
      "Contains suspicious keywords"
    ],
    "securityFeatures": [
      "Uses HTTPS encryption",
      "No obvious malicious patterns"
    ],
    "detectionMethods": [
      {
        "name": "VirusTotal Analysis",
        "result": "PASS",           // PASS, FAIL, WARNING
        "source": "VirusTotal",
        "details": "0 malicious, 0 suspicious"
      }
    ],
    "technicalDetails": {
      "domainAge": "365",
      "sslStatus": "Valid",
      "reputation": "Good",
      "redirects": "0",
      "whois": { /* WHOIS data */ },
      "redirect": { /* Redirect chain data */ }
    },
    "explainability": {
      "numericRiskScore": 25,
      "triggeredIndicators": [...],
      "suspiciousFeatures": [...],
      "featureContributions": [
        { "feature": "url_length", "importance": 0.11 },
        { "feature": "domain_age_days", "importance": 0.105 }
      ]
    }
  }
}
```

#### 3. Analyze File
```
POST /api/v1/threats/analyze-file
Content-Type: application/json

Request Body:
{
  "fileName": "suspicious.html",
  "fileContent": "<html>...</html>",
  "fileType": "text/html"
}

Response: Similar structure to analyze-url
```

#### 4. Scan History
```
GET /api/v1/threats/history?limit=50&skip=0&riskCategory=HIGH

Response:
{
  "success": true,
  "data": {
    "scans": [...],
    "pagination": {
      "total": 150,
      "limit": 50,
      "skip": 0,
      "hasMore": true
    }
  }
}
```

#### 5. Statistics
```
GET /api/v1/threats/statistics

Response:
{
  "success": true,
  "data": {
    "totalScans": 1000,
    "recentScans": 50,
    "avgThreatScore": 35.5,
    "threatDistribution": {
      "LOW": 600,
      "MEDIUM": 250,
      "HIGH": 100,
      "CRITICAL": 50
    }
  }
}
```

---

## 🎨 Design Requirements

### Brand Identity
- **Name:** Catchers AI
- **Tagline:** "Advanced Threat Detection & Phishing Analysis"
- **Color Scheme:**
  - Primary: Modern blue/purple gradient (tech/security feel)
  - Success: Green (#10B981)
  - Warning: Yellow/Orange (#F59E0B)
  - Danger: Red (#EF4444)
  - Critical: Dark Red (#DC2626)
- **Typography:** Modern, clean sans-serif (Inter, Poppins, or similar)
- **Style:** Professional, modern, tech-focused with subtle animations

### Visual Theme
- Dark mode support (optional but recommended)
- Glassmorphism or modern card-based design
- Smooth transitions and micro-interactions
- Responsive design (mobile, tablet, desktop)
- Accessibility compliant (WCAG 2.1 AA)

---

## 📱 Required Pages/Sections

### 1. Landing/Home Page
**Purpose:** Welcome users and provide quick access to threat analysis

**Components:**
- Hero section with:
  - Catchy headline: "Protect Yourself from Phishing & Malicious Threats"
  - Subheadline explaining the service
  - Prominent URL input field with "Analyze" button
  - Quick stats display (total scans, threats detected today)
- Features section highlighting:
  - Multi-source threat intelligence
  - AI/ML-powered detection
  - Real-time analysis
  - Detailed reports
- How it works (3-4 step process)
- Call-to-action to try the scanner

### 2. URL Scanner Page (Main Feature)
**Purpose:** Primary interface for analyzing URLs

**Layout:**
```
┌─────────────────────────────────────────┐
│  [URL Input Field]  [Analyze Button]    │
│  Or paste/type URL to scan              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Loading State (while analyzing)        │
│  - Animated progress indicator          │
│  - "Analyzing URL..." message           │
│  - Steps: Checking threat intel,        │
│    Running ML analysis, etc.            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Results Display                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Threat Score Gauge (0-100)     │   │
│  │  Large circular progress        │   │
│  │  Color-coded by risk level      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Risk Category Badge: [CRITICAL]        │
│  Recommendation: "DO NOT VISIT..."      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  AI Analysis Section            │   │
│  │  Detailed explanation           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Risk Factors (expandable)      │   │
│  │  ⚠️ Uses insecure HTTP          │   │
│  │  ⚠️ Suspicious TLD               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Security Features (expandable) │   │
│  │  ✅ No malware detected          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Detection Methods              │   │
│  │  VirusTotal: ✅ PASS            │   │
│  │  Google Safe Browsing: ✅ PASS  │   │
│  │  ML Analysis: ⚠️ WARNING        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Technical Details (collapsible)│   │
│  │  Domain Age, SSL Status, etc.   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ML Explainability (optional)   │   │
│  │  Feature importance chart       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Scan Another URL] [View History]     │
└─────────────────────────────────────────┘
```

**Key Features:**
- Real-time validation of URL format
- Loading states with progress indicators
- Color-coded threat score visualization (gauge/circular progress)
- Expandable/collapsible sections for detailed info
- Copy/share results functionality
- Download report as PDF (optional)
- "Scan Another" quick action

### 3. File Scanner Page
**Purpose:** Analyze file content for threats

**Components:**
- File upload area (drag & drop + click to browse)
- Supported formats: HTML, TXT, EML (email files)
- File size limit indicator (10MB max)
- Similar results display as URL scanner
- Preview of file content (first 500 chars)

### 4. Scan History Page
**Purpose:** View past scans and analytics

**Layout:**
```
┌─────────────────────────────────────────┐
│  Filters:                               │
│  [All] [LOW] [MEDIUM] [HIGH] [CRITICAL] │
│  [Date Range Picker]                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Scan History Table/Cards               │
│  ┌───────────────────────────────────┐  │
│  │ URL | Score | Risk | Date | Action│  │
│  │ example.com | 25 | LOW | 2h ago   │  │
│  │ [View Details]                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Pagination: [< 1 2 3 ... 10 >]        │
└─────────────────────────────────────────┘
```

**Features:**
- Filterable by risk category
- Searchable by URL
- Sortable by date, score
- Pagination (50 items per page)
- Click to view full scan details
- Export history as CSV (optional)

### 5. Dashboard/Statistics Page
**Purpose:** Overview of scanning activity and trends

**Components:**
- Total scans counter (animated)
- Recent scans (last 24 hours)
- Average threat score
- Threat distribution pie/donut chart
- Timeline chart showing scans over time
- Top detected threats list
- Quick stats cards with icons

### 6. About/How It Works Page
**Purpose:** Explain the technology and methodology

**Content:**
- What is Catchers AI?
- How the detection works:
  - Multi-source threat intelligence
  - Machine Learning (Random Forest, 96% accuracy)
  - 27 engineered features
  - WHOIS and redirect analysis
- Detection methods explained
- Privacy and data handling
- API documentation link (optional)

---

## 🎯 Key UI/UX Requirements

### User Experience
1. **Speed:** Show loading states immediately, don't leave users waiting
2. **Clarity:** Use clear, non-technical language for general users
3. **Visual Hierarchy:** Most important info (threat score, risk level) should be prominent
4. **Progressive Disclosure:** Show summary first, details on demand
5. **Feedback:** Clear success/error messages, validation feedback
6. **Accessibility:** Keyboard navigation, screen reader support, proper ARIA labels

### Visual Elements

#### Threat Score Visualization
- **0-24 (LOW):** Green circular gauge
- **25-49 (MEDIUM):** Yellow/Orange gauge
- **50-79 (HIGH):** Orange/Red gauge
- **80-100 (CRITICAL):** Red gauge with warning icon

#### Risk Category Badges
```
LOW:      Green badge with checkmark
MEDIUM:   Yellow badge with info icon
HIGH:     Orange badge with warning icon
CRITICAL: Red badge with alert icon
```

#### Detection Method Status Icons
```
PASS:    ✅ Green checkmark
FAIL:    ❌ Red X
WARNING: ⚠️ Yellow warning triangle
```

### Animations & Interactions
- Smooth page transitions
- Animated threat score gauge (count up effect)
- Hover effects on cards and buttons
- Loading skeleton screens
- Toast notifications for actions
- Smooth scroll to results after analysis

---

## 🛠️ Technical Requirements

### Technology Stack (Recommended)
- **Framework:** React 18+ with TypeScript (or Next.js for SSR)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React Query (TanStack Query) for API calls
- **Charts:** Recharts or Chart.js for visualizations
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React or Heroicons
- **Animations:** Framer Motion
- **HTTP Client:** Axios or Fetch API

### API Integration
```typescript
// Example API service structure
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface AnalyzeUrlRequest {
  url: string;
}

interface AnalyzeUrlResponse {
  success: boolean;
  data: {
    url: string;
    threatScore: number;
    riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendation: string;
    // ... other fields
  };
}

async function analyzeUrl(url: string): Promise<AnalyzeUrlResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/threats/analyze-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return response.json();
}
```

### Error Handling
- Network errors: Show retry button
- API errors: Display user-friendly messages
- Validation errors: Inline field validation
- Rate limiting: Show "Too many requests" message
- Timeout: Show timeout message with retry option

### Performance
- Lazy load components
- Optimize images (WebP format)
- Code splitting by route
- Debounce URL input validation
- Cache API responses (React Query)
- Progressive Web App (PWA) support (optional)

---

## 📋 Component Breakdown

### Core Components Needed

1. **URLScanner**
   - Input field with validation
   - Analyze button with loading state
   - Results display component

2. **ThreatScoreGauge**
   - Circular progress indicator
   - Color-coded by risk level
   - Animated count-up effect

3. **RiskCategoryBadge**
   - Color-coded badge
   - Icon based on severity
   - Tooltip with explanation

4. **DetectionMethodsList**
   - List of detection sources
   - Status indicators (PASS/FAIL/WARNING)
   - Expandable details

5. **RiskFactorsList**
   - Collapsible list of risk factors
   - Icons for each factor type
   - Severity indicators

6. **TechnicalDetailsPanel**
   - Collapsible panel
   - Key-value pairs display
   - Copy to clipboard functionality

7. **ScanHistoryTable**
   - Sortable columns
   - Filterable rows
   - Pagination controls
   - Row click to view details

8. **StatisticsCards**
   - Animated counters
   - Icons for each metric
   - Trend indicators (up/down)

9. **ThreatDistributionChart**
   - Pie or donut chart
   - Color-coded by risk level
   - Interactive tooltips

10. **LoadingState**
    - Skeleton screens
    - Progress indicators
    - Status messages

---

## 🎨 Example Color Palette

```css
/* Risk Levels */
--risk-low: #10B981;      /* Green */
--risk-medium: #F59E0B;   /* Orange */
--risk-high: #F97316;     /* Dark Orange */
--risk-critical: #DC2626; /* Red */

/* UI Colors */
--primary: #3B82F6;       /* Blue */
--secondary: #8B5CF6;     /* Purple */
--background: #F9FAFB;    /* Light Gray */
--surface: #FFFFFF;       /* White */
--text-primary: #111827;  /* Dark Gray */
--text-secondary: #6B7280;/* Medium Gray */
--border: #E5E7EB;        /* Light Border */

/* Status Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile Considerations
- Stack components vertically
- Collapsible navigation menu
- Touch-friendly button sizes (min 44x44px)
- Simplified charts for small screens
- Bottom sheet for detailed info

---

## 🔒 Security Considerations

1. **Input Sanitization:** Sanitize all user inputs before display
2. **XSS Prevention:** Use React's built-in XSS protection
3. **HTTPS Only:** Enforce HTTPS in production
4. **API Key Protection:** Never expose API keys in frontend
5. **Rate Limiting:** Implement client-side rate limiting
6. **Content Security Policy:** Set appropriate CSP headers

---

## ✅ Acceptance Criteria

### Must Have (MVP)
- ✅ URL analysis with full results display
- ✅ Threat score visualization (gauge/progress)
- ✅ Risk category display with color coding
- ✅ Detection methods list
- ✅ Risk factors and security features lists
- ✅ Scan history page with filtering
- ✅ Statistics dashboard
- ✅ Responsive design (mobile + desktop)
- ✅ Loading states and error handling
- ✅ Professional, modern UI design

### Nice to Have (Future Enhancements)
- 🎯 File upload and analysis
- 🎯 Dark mode toggle
- 🎯 Export reports as PDF
- 🎯 Share scan results (unique URL)
- 🎯 User accounts and saved scans
- 🎯 Browser extension
- 🎯 API documentation page
- 🎯 Real-time notifications
- 🎯 Comparison of multiple URLs
- 🎯 ML explainability visualization (feature importance chart)

---

## 📦 Deliverables

1. **Source Code**
   - Clean, well-organized React/Next.js project
   - TypeScript for type safety
   - Component library (shadcn/ui or similar)
   - Proper folder structure

2. **Documentation**
   - README with setup instructions
   - Environment variables documentation
   - Component documentation
   - API integration guide

3. **Deployment Ready**
   - Production build configuration
   - Environment variable setup
   - Vercel/Netlify deployment config
   - CORS configuration notes

---

## 🚀 Getting Started

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Catchers AI
```

### API Testing
Test the backend API first:
```bash
# Health check
curl http://localhost:3000/health

# Analyze URL
curl -X POST http://localhost:3000/api/v1/threats/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

---

## 📞 Support & Questions

If you need clarification on:
- API response structures
- Specific feature behavior
- Design decisions
- Technical implementation details

Please ask! The backend is fully functional and ready for integration.

---

## 🎯 Success Metrics

A successful frontend should:
1. ✅ Seamlessly integrate with the existing backend API
2. ✅ Provide an intuitive, professional user experience
3. ✅ Display threat analysis results clearly and accurately
4. ✅ Be responsive across all device sizes
5. ✅ Handle errors gracefully
6. ✅ Load quickly and perform smoothly
7. ✅ Match the professional quality of the backend

---

**Remember:** Focus on creating a clean, professional, and user-friendly interface that makes complex security data easy to understand for non-technical users while providing detailed information for power users.

Good luck building the Catchers AI frontend! 🚀
