import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env.js';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Catchers AI API',
      version: '1.0.0',
      description: 'Threat Detection API - Real-time URL and file scanning using multiple threat intelligence sources',
      contact: {
        name: 'Catchers AI',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://catchers-ai.onrender.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and readiness endpoints',
      },
      {
        name: 'Threats',
        description: 'Threat detection and analysis endpoints',
      },
    ],
    components: {
      schemas: {
        ThreatAnalysisResult: {
          type: 'object',
          properties: {
            url: { type: 'string', format: 'uri' },
            fileName: { type: 'string' },
            fileType: { type: 'string' },
            threatScore: { type: 'number', minimum: 0, maximum: 100 },
            riskCategory: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            },
            recommendation: { type: 'string' },
            scanDate: { type: 'string', format: 'date-time' },
            processingTime: { type: 'string' },
            aiAnalysis: { type: 'string' },
            riskFactors: {
              type: 'array',
              items: { type: 'string' },
            },
            securityFeatures: {
              type: 'array',
              items: { type: 'string' },
            },
            detectionMethods: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  result: { type: 'string', enum: ['PASS', 'FAIL', 'WARNING'] },
                  source: { type: 'string' },
                  details: { type: 'string' },
                },
              },
            },
            technicalDetails: { type: 'object' },
            virusTotalScanId: { type: 'string' },
            ipAddress: { type: 'string' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
      securitySchemes: {
        ApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication (if implemented)',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
