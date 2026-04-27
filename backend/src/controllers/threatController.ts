import { Request, Response } from 'express';
import { threatAnalysisService } from '../services/threatAnalysis.js';
import { ScanHistory } from '../models/ScanHistory.js';

export class ThreatController {
  /**
   * Analyze a URL for threats
   */
  async analyzeUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        res.status(400).json({
          success: false,
          error: 'URL is required and must be a valid string',
        });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        res.status(400).json({
          success: false,
          error: 'Invalid URL format',
        });
        return;
      }

      // Perform threat analysis
      const analysisResult = await threatAnalysisService.analyzeUrl(url);

      // Respond quickly, then persist scan record asynchronously to avoid latency
      res.json({
        success: true,
        data: analysisResult,
      });

      // Asynchronous logging (best-effort)
      try {
        const scanHistory = new ScanHistory({
          url: analysisResult.url,
          normalizedUrl: analysisResult.url, // placeholder for normalization
          extractedFeatures: analysisResult.explainability?.featureContributions || {},
          externalIntel: {
            virusTotalScanId: analysisResult.virusTotalScanId,
          },
          whois: (analysisResult as any).whois || null,
          redirect: (analysisResult as any).redirect || null,
          threatScore: analysisResult.threatScore,
          riskCategory: analysisResult.riskCategory,
          recommendation: analysisResult.recommendation,
          aiAnalysis: analysisResult.aiAnalysis,
          riskFactors: analysisResult.riskFactors,
          securityFeatures: analysisResult.securityFeatures,
          detectionMethods: analysisResult.detectionMethods,
          technicalDetails: analysisResult.technicalDetails,
          processingTime: analysisResult.processingTime,
          ipAddress: req.ip,
        });

        scanHistory.save().catch((err: any) => {
          console.warn('Failed to persist scan history (non-fatal):', err);
        });
      } catch (err) {
        console.warn('Failed to enqueue scan history (non-fatal):', err);
      }
    } catch (error: any) {
      console.error('Error analyzing URL:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Analyze file content for threats
   */
  async analyzeFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileName, fileContent, fileType } = req.body;

      if (!fileName || !fileContent) {
        res.status(400).json({
          success: false,
          error: 'fileName and fileContent are required',
        });
        return;
      }

      // Validate file size (max 10MB)
      const fileSizeInBytes = new Blob([fileContent]).size;
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

      if (fileSizeInBytes > maxSizeInBytes) {
        res.status(400).json({
          success: false,
          error: 'File size exceeds maximum limit of 10MB',
        });
        return;
      }

      // Perform file analysis
      const analysisResult = await threatAnalysisService.analyzeFile(
        fileName,
        fileContent,
        fileType
      );

      // Respond quickly, then persist scan record asynchronously
      res.json({
        success: true,
        data: analysisResult,
      });

      try {
        const scanHistory = new ScanHistory({
          fileName: analysisResult.fileName,
          fileType: analysisResult.fileType,
          threatScore: analysisResult.threatScore,
          riskCategory: analysisResult.riskCategory,
          recommendation: analysisResult.recommendation,
          aiAnalysis: analysisResult.aiAnalysis,
          riskFactors: analysisResult.riskFactors,
          securityFeatures: analysisResult.securityFeatures,
          detectionMethods: analysisResult.detectionMethods,
          technicalDetails: analysisResult.technicalDetails,
          processingTime: analysisResult.processingTime,
          ipAddress: req.ip,
        });

        scanHistory.save().catch((err: any) => {
          console.warn('Failed to persist file scan history (non-fatal):', err);
        });
      } catch (err) {
        console.warn('Failed to enqueue file scan history (non-fatal):', err);
      }
    } catch (error: any) {
      console.error('Error analyzing file:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Get scan history
   */
  async getScanHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;
      const riskCategory = req.query.riskCategory as string | undefined;

      const query: any = {};
      if (riskCategory) {
        query.riskCategory = riskCategory;
      }

      const scans = await ScanHistory.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await ScanHistory.countDocuments(query);

      res.json({
        success: true,
        data: {
          scans,
          pagination: {
            total,
            limit,
            skip,
            hasMore: skip + limit < total,
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching scan history:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const totalScans = await ScanHistory.countDocuments();
      
      const threatStats = await ScanHistory.aggregate([
        {
          $group: {
            _id: '$riskCategory',
            count: { $sum: 1 },
          },
        },
      ]);

      const avgThreatScore = await ScanHistory.aggregate([
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$threatScore' },
          },
        },
      ]);

      // Last 24 hours scans
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      const recentScans = await ScanHistory.countDocuments({
        createdAt: { $gte: last24Hours },
      });

      const stats = {
        totalScans,
        recentScans,
        avgThreatScore: avgThreatScore[0]?.avgScore || 0,
        threatDistribution: threatStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>),
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

export const threatController = new ThreatController();
