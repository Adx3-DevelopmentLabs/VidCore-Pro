import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../../utils/logger.js';

const execAsync = promisify(exec);

export class YtDlpService {
  static async getStreamUrl(url: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`yt-dlp -g -f "best[ext=mp4]" ${url}`);
      return stdout.trim();
    } catch (error: any) {
      logger.error(`yt-dlp error for ${url}: ${error.message}`);
      return null;
    }
  }

  static async getMetadata(url: string): Promise<any> {
    try {
      const { stdout } = await execAsync(`yt-dlp -j ${url}`);
      return JSON.parse(stdout);
    } catch (error: any) {
      logger.error(`yt-dlp metadata error for ${url}: ${error.message}`);
      return null;
    }
  }
}
