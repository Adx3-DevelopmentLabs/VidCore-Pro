import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from '../../utils/logger.js';
import { YtDlpService } from '../../services/yt-dlp/ytdlp.service.js';

export class SmartResolver {
  private static userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  ];

  static async resolve(url: string): Promise<string[]> {
    logger.info(`Smart resolving: ${url}`);
    
    // Strategy 1: yt-dlp (Strongest for known platforms)
    const ytdlpResult = await YtDlpService.getStreamUrl(url);
    if (ytdlpResult) return [ytdlpResult];

    // Strategy 2: Deep HTML/JS Scraping with Spoofed Headers
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': new URL(url).origin,
        },
        timeout: 6000
      });

      const $ = cheerio.load(response.data);
      const m3u8Links = new Set<string>();
      const m3u8Regex = /https?:\/\/[^"']+\.m3u8[^"']*/g;

      // Extract from scripts, including obfuscated ones
      $('script').each((_, el) => {
        const content = $(el).html() || '';
        const matches = content.match(m3u8Regex);
        if (matches) matches.forEach(link => m3u8Links.add(this.cleanLink(link)));
        
        // Strategy 3: Base64 decoding in scripts
        const base64Matches = content.match(/[A-Za-z0-9+/]{40,}/g);
        if (base64Matches) {
          base64Matches.forEach(b64 => {
            try {
              const decoded = Buffer.from(b64, 'base64').toString();
              const decodedMatches = decoded.match(m3u8Regex);
              if (decodedMatches) decodedMatches.forEach(link => m3u8Links.add(this.cleanLink(link)));
            } catch {}
          });
        }
      });

      // Strategy 4: Attribute extraction (data-src, data-video, etc.)
      $('*').each((_, el) => {
        if ('attribs' in el) {
          const attrs = el.attribs;
          for (const key in attrs) {
            const val = attrs[key];
            if (val && val.includes('.m3u8')) m3u8Links.add(this.cleanLink(val));
          }
        }
      });

      // Strategy 5: Aggressive iframe recursion
      const iframes: string[] = [];
      $('iframe').each((_, el) => {
        const src = $(el).attr('src');
        if (src) iframes.push(src.startsWith('//') ? `https:${src}` : src);
      });

      for (const iframeUrl of iframes) {
        if (iframeUrl.includes('ads') || iframeUrl.includes('pop')) continue;
        // Deep recursive resolving for protected providers
        try {
          const subLinks = await this.resolve(iframeUrl);
          subLinks.forEach(link => m3u8Links.add(link));
        } catch (err) {
          logger.warn(`Failed recursive resolve for ${iframeUrl}`);
        }
      }

      // Strategy 6: Search for hidden JSON objects containing M3U8
      const jsonRegex = /\{.*"file".*".*\.m3u8".*\}/g;
      const jsonMatches = response.data.match(jsonRegex);
      if (jsonMatches) {
        jsonMatches.forEach((match: string) => {
          try {
            const parsed = JSON.parse(match);
            if (parsed.file && parsed.file.includes('.m3u8')) m3u8Links.add(this.cleanLink(parsed.file));
          } catch {}
        });
      }

      return Array.from(m3u8Links);
    } catch (error: any) {
      logger.error(`SmartResolver failed for ${url}: ${error.message}`);
      return [];
    }
  }

  private static getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]!;
  }

  private static cleanLink(link: string): string {
    return link.replace(/\\/g, ''); // Remove escape characters often found in JS
  }
}
