import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { connectDatabase, isDatabaseReady } from './config/database.js';
import { swaggerSpec } from './config/swagger.js';
import threatRoutes from './routes/threatRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Trust proxy - Required for Render/Heroku/AWS
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser clients (curl, health checks, server-to-server) often send no Origin.
      if (!origin) return callback(null, true);
      if (config.corsOrigins.includes(origin)) return callback(null, true);
      // Allow Vercel preview deploys without requiring CORS env updates for every URL.
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Catchers AI API Documentation',
}));

// Rate limiting
app.use('/api/v1', apiRateLimiter);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDatabaseReady() ? 'connected' : 'disconnected',
  });
});

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Readiness check endpoint (for load balancers)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready to accept traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ready"
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 *       503:
 *         description: Service is not ready (database disconnected)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "not_ready"
 *                 database:
 *                   type: string
 *                   example: "disconnected"
 */
app.get('/ready', (_req, res) => {
  if (!isDatabaseReady()) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected' });
    return;
  }
  res.json({ status: 'ready', database: 'connected' });
});

// API routes
app.use('/api/v1/threats', threatRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Catchers AI Backend API',
    version: '1.0.0',
    description: 'Threat Detection API',
    endpoints: {
      health: '/health',
      analyzeUrl: 'POST /api/v1/threats/analyze-url',
      analyzeFile: 'POST /api/v1/threats/analyze-file',
      history: 'GET /api/v1/threats/history',
      statistics: 'GET /api/v1/threats/statistics',
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🌐 CORS enabled for: ${config.corsOrigins.join(', ')}`);
      console.log(`📊 API available at: http://localhost:${config.port}/api/v1`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
