import axios from 'axios';
import logger from '../../utils/logger.js';
import { YtDlpService } from '../yt-dlp/ytdlp.service.js';

export interface SubtitleTrack {
  language: string;
  url: string;
  format: 'vtt' | 'srt';
}

export class SubtitleService {
  static async getSubtitles(url: string): Promise<SubtitleTrack[]> {
    try {
      logger.info(`Extracting subtitles for: ${url}`);
      
      // Strategy 1: yt-dlp subtitle extraction
      const metadata = await YtDlpService.getMetadata(url);
      const subtitles: SubtitleTrack[] = [];

      if (metadata && metadata.subtitles) {
        for (const lang in metadata.subtitles) {
          const track = metadata.subtitles[lang].find((s: any) => s.ext === 'vtt' || s.ext === 'srt');
          if (track) {
            subtitles.push({
              language: lang,
              url: track.url,
              format: track.ext as 'vtt' | 'srt'
            });
          }
        }
      }

      // Strategy 2: Common subtitle API integration (Placeholder for OpenSubtitles etc.)
      // In a real world scenario, you'd call OpenSubtitles API here
      
      return subtitles;
    } catch (error: any) {
      logger.error(`Subtitle extraction error: ${error.message}`);
      return [];
    }
  }
}
