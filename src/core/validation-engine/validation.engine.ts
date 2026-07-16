import axios from 'axios';
import logger from '../../utils/logger.js';

export class ValidationEngine {
  static async validateLink(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'VidCore-Pro/1.0.0' }
      });
      return response.status >= 200 && response.status < 400;
    } catch (error: any) {
      logger.warn(`Validation failed for ${url}: ${error.message}`);
      return false;
    }
  }

  static async validateBatch(urls: string[]): Promise<string[]> {
    const results = await Promise.all(urls.map(async (url) => {
      const isValid = await this.validateLink(url);
      return isValid ? url : null;
    }));
    return results.filter((url): url is string => url !== null);
  }
}
