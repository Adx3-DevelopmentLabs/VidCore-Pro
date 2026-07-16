import axios from 'axios';
import logger from '../../utils/logger.js';

export class ValidationEngine {
  static async validateLink(url: string, timeout = 5000): Promise<boolean> {
    try {
      const response = await axios.get(url, {
        timeout,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Range': 'bytes=0-1' // Only fetch first byte to save bandwidth
        }
      });
      return response.status >= 200 && response.status < 400;
    } catch (error: any) {
      // Handle cases where GET might be blocked but HEAD works
      try {
        const headResponse = await axios.head(url, { timeout: 3000 });
        return headResponse.status >= 200 && headResponse.status < 400;
      } catch {
        logger.warn(`Validation failed for ${url}: ${error.message}`);
        return false;
      }
    }
  }

  static async validateBatch(urls: string[], concurrency = 15): Promise<string[]> {
    const results: string[] = [];
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(async (url) => {
        const isValid = await this.validateLink(url);
        return isValid ? url : null;
      }));
      results.push(...batchResults.filter((url): url is string => url !== null));
    }
    return results;
  }

  static async getBestSource(urls: string[]): Promise<string | null> {
    // Fast failover: return the first one that validates
    for (const url of urls) {
      if (await this.validateLink(url, 2000)) return url;
    }
    return null;
  }
}
