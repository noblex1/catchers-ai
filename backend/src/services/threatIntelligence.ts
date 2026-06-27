import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env.js';
import {
  VirusTotalResponse,
  GoogleSafeBrowsingResponse,
  PhishTankResponse,
} from '../types/threatDetection';

class ThreatIntelligenceService {
  private virusTotalClient: AxiosInstance;
  private googleSafeBrowsingClient: AxiosInstance;

  constructor() {
    // VirusTotal API Client
    this.virusTotalClient = axios.create({
      baseURL: 'https://www.virustotal.com/api/v3',
      headers: {
        'x-apikey': config.virusTotalApiKey,
      },
      timeout: 30000,
    });

    // Google Safe Browsing API Client
    this.googleSafeBrowsingClient = axios.create({
      baseURL: 'https://safebrowsing.googleapis.com/v4',
      timeout: 10000,
    });
  }

  /**
   * Check URL with VirusTotal
   */
  async checkVirusTotal(url: string): Promise<{
    isThreat: boolean;
    malicious: number;
    suspicious: number;
    harmless: number;
    scanId?: string;
    reputation?: number;
    details?: Record<string, any>;
  }> {
    if (!config.virusTotalApiKey) {
      console.warn('VirusTotal API key not configured');
      return {
        isThreat: false,
        malicious: 0,
        suspicious: 0,
        harmless: 0,
      };
    }

    try {
      // Submit URL for scanning
      const submitResponse = await this.virusTotalClient.post('/urls', {
        url: url,
      });

      const urlId = submitResponse.data.data.id;
      const scanId = urlId;

      // Poll for analysis completion with retries
      let data: VirusTotalResponse | null = null;
      const maxRetries = 3;
      const retryDelay = 3000; // 3 seconds between retries
      
      for (let i = 0; i < maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        try {
          const analysisResponse = await this.virusTotalClient.get(`/urls/${urlId}`);
          data = analysisResponse.data;
          
          // Check if analysis is complete
          if (data) {
            const stats = data.data.attributes.last_analysis_stats;
            const totalEngines = stats.harmless + stats.malicious + stats.suspicious + stats.undetected;
            
            // If we have results from at least 10 engines, consider it complete
            if (totalEngines >= 10) {
              break;
            }
          }
        } catch (err) {
          console.warn(`VirusTotal retry ${i + 1}/${maxRetries} failed`);
          if (i === maxRetries - 1) throw err;
        }
      }
      
      if (!data) {
        throw new Error('Failed to get VirusTotal analysis results');
      }

      const stats = data.data.attributes.last_analysis_stats;
      const malicious = stats.malicious || 0;
      const suspicious = stats.suspicious || 0;
      const harmless = stats.harmless || 0;
      const isThreat = malicious > 0 || suspicious > 3;

      return {
        isThreat,
        malicious,
        suspicious,
        harmless,
        scanId,
        reputation: data.data.attributes.reputation || 0,
        details: {
          analysisResults: data.data.attributes.last_analysis_results,
          totalEngines: stats.harmless + stats.malicious + stats.suspicious + stats.undetected,
        },
      };
    } catch (error: any) {
      console.error('VirusTotal API error:', error.response?.data || error.message);
      
      // Handle rate limiting or API errors gracefully
      if (error.response?.status === 429) {
        console.warn('VirusTotal rate limit reached');
      }
      
      return {
        isThreat: false,
        malicious: 0,
        suspicious: 0,
        harmless: 0,
      };
    }
  }

  /**
   * Check URL with Google Safe Browsing
   */
  async checkGoogleSafeBrowsing(url: string): Promise<{
    isThreat: boolean;
    threatTypes: string[];
  }> {
    if (!config.googleSafeBrowsingApiKey) {
      console.warn('Google Safe Browsing API key not configured');
      return {
        isThreat: false,
        threatTypes: [],
      };
    }

    try {
      const response = await this.googleSafeBrowsingClient.post(
        `/threatMatches:find?key=${config.googleSafeBrowsingApiKey}`,
        {
          client: {
            clientId: 'catchers-ai',
            clientVersion: '1.0.0',
          },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }
      );

      const data: GoogleSafeBrowsingResponse = response.data;
      const isThreat = !!(data.matches && data.matches.length > 0);
      const threatTypes = data.matches?.map(m => m.threatType) || [];

      return {
        isThreat,
        threatTypes,
      };
    } catch (error: any) {
      console.error('Google Safe Browsing API error:', error.response?.data || error.message);
      return {
        isThreat: false,
        threatTypes: [],
      };
    }
  }

  /**
   * Check URL with PhishTank (Free, no API key required)
   */
  async checkPhishTank(url: string): Promise<{
    isPhishing: boolean;
    verified: boolean;
  }> {
    try {
      // PhishTank API endpoint
      const encodedUrl = encodeURIComponent(url);
      const response = await axios.get(
        `http://checkurl.phishtank.com/checkurl/index.php?url=${encodedUrl}&format=json`,
        {
          headers: {
            'User-Agent': 'Catchers-AI/1.0',
          },
          timeout: 10000,
        }
      );

      const data: PhishTankResponse = response.data.results?.[0] || response.data;
      const isPhishing = data.in_database === true;
      const verified = data.verified === 'yes';

      return {
        isPhishing,
        verified,
      };
    } catch (error: any) {
      console.error('PhishTank API error:', error.message);
      return {
        isPhishing: false,
        verified: false,
      };
    }
  }

  /**
   * Get domain information from WHOIS (simplified)
   */
  async getDomainInfo(domain: string): Promise<{
    age?: string;
    registrar?: string;
    created?: string;
  }> {
    // Note: This is a placeholder. For production, use a proper WHOIS API
    // Options: whoisxmlapi.com, ipwhois.app, etc.
    try {
      // Basic domain validation
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(domain)) {
        return {};
      }

      // In production, integrate with WHOIS API
      // For now, return placeholder
      return {
        age: 'N/A',
        registrar: 'N/A',
      };
    } catch (error) {
      console.error('Domain info error:', error);
      return {};
    }
  }
}

export const threatIntelligenceService = new ThreatIntelligenceService();
