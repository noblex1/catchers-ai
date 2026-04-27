import { Router } from 'express';
import { threatController } from '../controllers/threatController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/threats/analyze-url:
 *   post:
 *     summary: Analyze a URL for security threats
 *     tags: [Threats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com"
 *                 description: The URL to analyze
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 threatScore: 25
 *                 riskCategory: "LOW"
 *                 recommendation: "This URL appears safe"
 *       400:
 *         description: Invalid request (missing URL or invalid format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/analyze-url', (req, res) => threatController.analyzeUrl(req, res));

/**
 * @swagger
 * /api/v1/threats/analyze-file:
 *   post:
 *     summary: Analyze file content for security threats
 *     tags: [Threats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - fileContent
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: "suspicious.html"
 *                 description: Name of the file
 *               fileContent:
 *                 type: string
 *                 example: "<html>...</html>"
 *                 description: Content of the file to analyze
 *               fileType:
 *                 type: string
 *                 example: "text/html"
 *                 description: MIME type of the file (optional)
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request (missing required fields or file too large)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/analyze-file', (req, res) => threatController.analyzeFile(req, res));

/**
 * @swagger
 * /api/v1/threats/history:
 *   get:
 *     summary: Get scan history
 *     tags: [Threats]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of scans to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of scans to skip (for pagination)
 *       - in: query
 *         name: riskCategory
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         description: Filter by risk category
 *     responses:
 *       200:
 *         description: Scan history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 scans: []
 *                 pagination:
 *                   total: 0
 *                   limit: 50
 *                   skip: 0
 *                   hasMore: false
 *       500:
 *         description: Internal server error
 */
router.get('/history', (req, res) => threatController.getScanHistory(req, res));

/**
 * @swagger
 * /api/v1/threats/statistics:
 *   get:
 *     summary: Get threat detection statistics
 *     tags: [Threats]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 totalScans: 150
 *                 recentScans: 25
 *                 avgThreatScore: 35.5
 *                 threatDistribution:
 *                   LOW: 100
 *                   MEDIUM: 30
 *                   HIGH: 15
 *                   CRITICAL: 5
 *       500:
 *         description: Internal server error
 */
router.get('/statistics', (req, res) => threatController.getStatistics(req, res));

export default router;
