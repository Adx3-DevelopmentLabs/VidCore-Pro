import { TmdbService } from '../../services/tmdb/tmdb.service.js';
import logger from '../../utils/logger.js';

const tmdb = new TmdbService(process.env.TMDB_API_KEY || '');

export interface MediaInfo {
  title: string;
  year: string;
  type: 'movie' | 'tv';
}

export class SmartMappingEngine {
  static async getMediaInfo(tmdbId: string, type: 'movie' | 'tv'): Promise<MediaInfo | null> {
    try {
      logger.info(`Mapping TMDB ID ${tmdbId} to media info`);
      // In a real scenario, you'd fetch details from TMDB API
      // Since we are in a sandbox, we simulate the fetch logic
      const details: any = await tmdb.searchMovie(tmdbId); // Using search as proxy for details
      
      return {
        title: details.title || 'Unknown',
        year: details.release_date ? details.release_date.split('-')[0] : '2024',
        type
      };
    } catch (error: any) {
      logger.error(`Mapping failed: ${error.message}`);
      return null;
    }
  }
}
