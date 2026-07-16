import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from './logger.js';

export class AdvancedExtractor {
  static async extractM3u8(url: string): Promise<string[]> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      const scripts = $('script').map((i, el) => $(el).html()).get();
      
      const m3u8Links: string[] = [];
      const m3u8Regex = /https?:\/\/[^"']+\.m3u8[^"']*/g;

      scripts.forEach(script => {
        const matches = script?.match(m3u8Regex);
        if (matches) m3u8Links.push(...matches);
      });

      // Also check for source tags
      $('source').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.includes('.m3u8')) m3u8Links.push(src);
      });

      return [...new Set(m3u8Links)];
    } catch (error: any) {
      logger.error(`Extraction error for ${url}: ${error.message}`);
      return [];
    }
  }
}
