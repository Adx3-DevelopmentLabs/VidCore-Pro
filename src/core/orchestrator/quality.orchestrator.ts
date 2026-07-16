import logger from '../../utils/logger.js';
import { YtDlpService } from '../../services/yt-dlp/ytdlp.service.js';

export interface QualityTrack {
  resolution: string;
  url: string;
  bitrate?: number;
}

export class QualityOrchestrator {
  static async getAvailableQualities(url: string): Promise<QualityTrack[]> {
    try {
      logger.info(`Orchestrating qualities for: ${url}`);
      const metadata = await YtDlpService.getMetadata(url);
      
      if (!metadata || !metadata.formats) return [];

      const qualities: QualityTrack[] = metadata.formats
        .filter((f: any) => f.vcodec !== 'none' && f.url)
        .map((f: any) => ({
          resolution: f.resolution || `${f.width}x${f.height}` || 'Unknown',
          url: f.url,
          bitrate: f.tbr
        }))
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

      return qualities;
    } catch (error: any) {
      logger.error(`Quality orchestration error: ${error.message}`);
      return [];
    }
  }

  static generateMasterPlaylist(qualities: QualityTrack[]): string {
    let m3u8 = '#EXTM3U\n#EXT-X-VERSION:3\n';
    qualities.forEach(q => {
      const bandwidth = q.bitrate ? Math.round(q.bitrate * 1000) : 1000000;
      m3u8 += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${q.resolution}\n${q.url}\n`;
    });
    return m3u8;
  }
}
