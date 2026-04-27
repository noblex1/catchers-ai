/**
 * Local Storage Manager for Catchers AI
 * Manages scan history stored locally in the browser
 */

import type { ThreatAnalysis } from "./api";

const STORAGE_KEY = "catchers_ai_scan_history";
const MAX_HISTORY_ITEMS = 100; // Limit to prevent storage overflow

export interface LocalScanHistory extends ThreatAnalysis {
  id: string;
  scannedAt: string;
}

/**
 * Generate a unique ID for a scan
 */
function generateId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all scan history from localStorage
 */
export function getLocalHistory(): LocalScanHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as LocalScanHistory[];
    
    // Sort by most recent first
    return history.sort((a, b) => 
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
  } catch (error) {
    console.error("Error reading scan history from localStorage:", error);
    return [];
  }
}

/**
 * Add a new scan to history
 */
export function addToLocalHistory(scan: ThreatAnalysis): LocalScanHistory {
  try {
    const history = getLocalHistory();
    
    const newScan: LocalScanHistory = {
      ...scan,
      id: generateId(),
      scannedAt: new Date().toISOString(),
    };
    
    // Add to beginning of array
    history.unshift(newScan);
    
    // Limit history size
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    
    return newScan;
  } catch (error) {
    console.error("Error saving scan to localStorage:", error);
    throw error;
  }
}

/**
 * Get a single scan by ID
 */
export function getLocalScanById(id: string): LocalScanHistory | null {
  const history = getLocalHistory();
  return history.find(scan => scan.id === id) || null;
}

/**
 * Delete a scan from history
 */
export function deleteLocalScan(id: string): boolean {
  try {
    const history = getLocalHistory();
    const filtered = history.filter(scan => scan.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting scan from localStorage:", error);
    return false;
  }
}

/**
 * Clear all scan history
 */
export function clearLocalHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing scan history:", error);
    return false;
  }
}

/**
 * Get filtered history
 */
export function getFilteredHistory(params: {
  riskCategory?: string;
  search?: string;
  limit?: number;
  skip?: number;
}): {
  scans: LocalScanHistory[];
  total: number;
  hasMore: boolean;
} {
  let history = getLocalHistory();
  
  // Filter by risk category
  if (params.riskCategory && params.riskCategory !== "ALL") {
    history = history.filter(scan => scan.riskCategory === params.riskCategory);
  }
  
  // Filter by search term
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    history = history.filter(scan => 
      (scan.url?.toLowerCase().includes(searchLower)) ||
      (scan.fileName?.toLowerCase().includes(searchLower))
    );
  }
  
  const total = history.length;
  const skip = params.skip || 0;
  const limit = params.limit || 50;
  
  // Paginate
  const scans = history.slice(skip, skip + limit);
  const hasMore = skip + limit < total;
  
  return { scans, total, hasMore };
}

/**
 * Get statistics from local history
 */
export function getLocalStatistics() {
  const history = getLocalHistory();
  
  // Calculate total scans
  const totalScans = history.length;
  
  // Calculate recent scans (last 24 hours)
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const recentScans = history.filter(scan => 
    new Date(scan.scannedAt) > oneDayAgo
  ).length;
  
  // Calculate average threat score
  const avgThreatScore = totalScans > 0
    ? history.reduce((sum, scan) => sum + scan.threatScore, 0) / totalScans
    : 0;
  
  // Calculate threat distribution
  const threatDistribution: Record<string, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };
  
  history.forEach(scan => {
    if (scan.riskCategory in threatDistribution) {
      threatDistribution[scan.riskCategory]++;
    }
  });
  
  // Calculate timeline (last 7 days)
  const timeline: { date: string; scans: number }[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const scansOnDate = history.filter(scan => {
      const scanDate = new Date(scan.scannedAt).toISOString().split('T')[0];
      return scanDate === dateStr;
    }).length;
    
    timeline.push({
      date: dateStr,
      scans: scansOnDate,
    });
  }
  
  return {
    totalScans,
    recentScans,
    avgThreatScore,
    threatDistribution,
    timeline,
  };
}

/**
 * Export history as JSON
 */
export function exportHistory(): string {
  const history = getLocalHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Import history from JSON
 */
export function importHistory(jsonData: string): boolean {
  try {
    const imported = JSON.parse(jsonData) as LocalScanHistory[];
    
    // Validate data structure
    if (!Array.isArray(imported)) {
      throw new Error("Invalid data format");
    }
    
    // Merge with existing history (avoid duplicates by ID)
    const existing = getLocalHistory();
    const existingIds = new Set(existing.map(s => s.id));
    
    const newScans = imported.filter(s => !existingIds.has(s.id));
    const merged = [...existing, ...newScans];
    
    // Sort and limit
    const sorted = merged.sort((a, b) => 
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
    const limited = sorted.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    return true;
  } catch (error) {
    console.error("Error importing history:", error);
    return false;
  }
}
