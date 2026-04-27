# Catchers AI Backend API

Backend API server for Catchers AI threat detection system. Built with Node.js, Express, TypeScript, and MongoDB.

## Features

- ✅ Real-time threat detection via multiple threat intelligence APIs
- ✅ MongoDB database for scan history and analytics
- ✅ RESTful API endpoints
- ✅ Rate limiting and security middleware
- ✅ Error handling and logging
- ✅ TypeScript for type safety

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- API Keys for:
  - VirusTotal (recommended)
  - Google Safe Browsing (recommended)
  - PhishTank (optional, free)

## Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
MONGODB_URI=mongodb://localhost:27017/catchers-ai
VIRUSTOTAL_API_KEY=your_api_key_here
GOOGLE_SAFEBROWSING_API_KEY=your_api_key_here
```

## Getting API Keys

### VirusTotal API Key
1. Sign up at [VirusTotal](https://www.virustotal.com/)
2. Go to [API Key](https://www.virustotal.com/gui/user/your-username/apikey)
3. Copy your API key

### Google Safe Browsing API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Safe Browsing API
3. Create credentials (API Key)
4. Copy your API key

### PhishTank
- Free and doesn't require an API key
- Rate limited but sufficient for development

## Running the Server

### Development Mode
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Base URL: `http://localhost:3000/api/v1/threats`

#### POST `/analyze-url`
Analyze a URL for threats.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "threatScore": 25,
    "riskCategory": "MEDIUM",
    "recommendation": "...",
    "scanDate": "2024-01-01T00:00:00.000Z",
    "processingTime": "2.5s",
    "aiAnalysis": "...",
    "riskFactors": [...],
    "securityFeatures": [...],
    "detectionMethods": [...],
    "technicalDetails": {...}
  }
}
```

#### POST `/analyze-file`
Analyze file content for threats.

**Request Body:**
```json
{
  "fileName": "suspicious.html",
  "fileContent": "<html>...</html>",
  "fileType": "text/html"
}
```

#### GET `/history`
Get scan history with pagination.

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `skip` (optional): Number to skip (default: 0)
- `riskCategory` (optional): Filter by category (LOW, MEDIUM, HIGH, CRITICAL)

#### GET `/statistics`
Get aggregated statistics.

**Response:**
```json
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

### Health Check
`GET /health` - Server health check

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── env.ts       # Environment variables
│   ├── controllers/     # Request handlers
│   │   └── threatController.ts
│   ├── models/          # MongoDB models
│   │   └── ScanHistory.ts
│   ├── routes/          # API routes
│   │   └── threatRoutes.ts
│   ├── services/        # Business logic
│   │   ├── threatAnalysis.ts
│   │   └── threatIntelligence.ts
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── types/           # TypeScript types
│   │   └── threatDetection.ts
│   └── server.ts        # Main server file
├── tests/               # Test files
├── package.json
└── tsconfig.json
```

## MongoDB Schema

### ScanHistory
- Stores all threat analysis results
- Indexed on `url`, `threatScore`, `riskCategory`, and `createdAt`
- Automatically timestamps `createdAt` and `updatedAt`

## Environment Variables

See `.env.example` for all available configuration options.

## Development

The project uses:
- **TypeScript** for type safety
- **Express** for the web framework
- **Mongoose** for MongoDB ODM
- **Axios** for HTTP requests to threat APIs
- **Zod** for validation (optional)

## Testing

```bash
npm test
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check firewall settings if using Atlas

### API Key Issues
- Verify API keys are correctly set in `.env`
- Check API rate limits if requests are failing
- Ensure API keys have proper permissions

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Adjust in `.env` or `config/env.ts`

## License

MIT
