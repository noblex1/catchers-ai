/**
 * ML Service Integration
 * Communicates with Python ML microservice for AI-powered threat detection
 */
import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env.js';

interface MLPrediction {
  is_threat: boolean;
  confidence: number;
  threat_probability: number;
  safe_probability: number;
  ml_score: number;
  features_analyzed: number;
  model_version: string;
}

interface MLFeatures {
  url_length: number;
  domain_length: number;
  has_ip_address: boolean;
  has_at_symbol: boolean;
  has_double_slash: boolean;
  num_subdomains: number;
  num_dots: number;
  num_hyphens: number;
  num_underscores: number;
  num_digits: number;
  num_special_chars: number;
  entropy: number;
  suspicious_tld: boolean;
  url_shortener: boolean;
  [key: string]: any;
}

interface MLAnalysisResponse {
  success: boolean;
  prediction: MLPrediction;
  features: MLFeatures;
  risk_factors: string[];
  confidence_factors: string[];
  feature_importance?: Array<{ feature: string; importance: number }> | null;
}

class MLService {
  private client: AxiosInstance;
  private isAvailable: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 60000; // 1 minute

  constructor() {
    const mlServiceUrl = config.mlServiceUrl || 'http://localhost:5000';
    
    this.client = axios.create({
      baseURL: mlServiceUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initial health check
    this.checkHealth();
  }

  /**
   * Check if ML service is available
   */
  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.isAvailable;
    }

    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      this.isAvailable = response.data.status === 'healthy' && response.data.model_loaded;
      this.lastHealthCheck = now;
      
      if (this.isAvailable) {
        console.log('✓ ML Service is available');
      } else {
        console.warn('⚠ ML Service is degraded (model not loaded)');
      }
      
      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      this.lastHealthCheck = now;
      console.warn('⚠ ML Service is unavailable, using fallback detection');
      return false;
    }
  }

  /**
   * Analyze URL using ML model
   */
  async analyzeUrl(url: string, engineeredFeatures?: Record<string, any>): Promise<MLAnalysisResponse | null> {
    try {
      // Check if service is available
      const available = await this.checkHealth();
      if (!available) {
        return null;
      }

      const payload: any = { url };
      if (engineeredFeatures) payload.engineered_features = engineeredFeatures;

      const response = await this.client.post<MLAnalysisResponse>(
        '/api/ml/analyze-url',
        payload
      );

      if (response.data.success) {
        console.log(`ML Analysis: ${url} - Threat: ${response.data.prediction.is_threat}, Confidence: ${response.data.prediction.confidence}`);
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('ML Service error:', error.message);
      return null;
    }
  }

  /**
   * Analyze content using ML model
   */
  async analyzeContent(content: string, url?: string): Promise<MLAnalysisResponse | null> {
    try {
      const available = await this.checkHealth();
      if (!available) {
        return null;
      }

      const response = await this.client.post<MLAnalysisResponse>(
        '/api/ml/analyze-content',
        { content, url }
      );

      if (response.data.success) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('ML Service error:', error.message);
      return null;
    }
  }

  /**
   * Get ML model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await this.client.get('/api/ml/model-info');
      return response.data;
    } catch (error) {
      console.error('Error fetching ML model info:', error);
      return null;
    }
  }

  /**
   * Check if ML service is currently available
   */
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }
}

export const mlService = new MLService();
