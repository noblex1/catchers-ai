import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/catchers-ai'),
  // Comma-separated list or a single origin. Example:
  // CORS_ORIGIN=http://localhost:8080,https://catchers-ai.vercel.app
  CORS_ORIGIN: z.string().default(
    'http://localhost:8080,https://catchers-ai.vercel.app,https://catchers-ai.vercel.app'
  ),

  // API keys (optional; individual services can decide behavior when missing)
  VIRUSTOTAL_API_KEY: z.string().optional(),
  GOOGLE_SAFEBROWSING_API_KEY: z.string().optional(),
  ABUSEIPDB_API_KEY: z.string().optional(),
  PHISHTANK_API_KEY: z.string().optional(),

  // ML Service
  ML_SERVICE_URL: z.string().default('http://localhost:5000'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Fail fast so deploys don't succeed with a broken config.
  // (We keep the error minimal to avoid leaking env values.)
  const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${issues}`);
}

const parseCorsOrigins = (raw: string): string[] => {
  const origins = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Hard safety: with credentials enabled, wildcard origin is unsafe.
  // Also avoids confusing setups like "*,https://example.com".
  if (origins.includes('*')) {
    throw new Error('CORS_ORIGIN cannot include "*" when credentials are enabled.');
  }

  return origins.length > 0 ? origins : ['http://localhost:8080'];
};

const env = parsed.data;

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  mongoUri: env.MONGODB_URI,
  corsOrigins: parseCorsOrigins(env.CORS_ORIGIN),

  // API Keys
  virusTotalApiKey: env.VIRUSTOTAL_API_KEY ?? '',
  googleSafeBrowsingApiKey: env.GOOGLE_SAFEBROWSING_API_KEY ?? '',
  abuseIpdbApiKey: env.ABUSEIPDB_API_KEY ?? '',
  phishTankApiKey: env.PHISHTANK_API_KEY ?? '',

  // ML Service
  mlServiceUrl: env.ML_SERVICE_URL,

  // Rate Limiting
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
};
