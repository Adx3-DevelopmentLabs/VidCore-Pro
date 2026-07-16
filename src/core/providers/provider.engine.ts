import logger from '../../utils/logger.js';
import { SmartResolver } from '../resolver/smart-resolver.js';

export interface Provider {
  name: string;
  baseUrl: string;
  getMovieUrl(tmdbId: string): string;
  getTvUrl(tmdbId: string, season: number, episode: number): string;
}

export class ProviderEngine {
  private static providers: Provider[] = [
    {
      name: 'VidSrc',
      baseUrl: 'https://vidsrc.me/embed',
      getMovieUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
      getTvUrl: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
      name: 'VidSrc.to',
      baseUrl: 'https://vidsrc.to/embed',
      getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
      getTvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
    },
    {
      name: 'SuperEmbed',
      baseUrl: 'https://multiembed.mov',
      getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
      getTvUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
    },
    {
      name: 'AkasMovie (Arabic)',
      baseUrl: 'https://akwam.to',
      getMovieUrl: (id) => `https://akwam.to/search?q=${id}`, // Simplified for logic
      getTvUrl: (id, s, e) => `https://akwam.to/search?q=${id}`
    },
    {
      name: 'Anilist (Anime)',
      baseUrl: 'https://anilist.co',
      getMovieUrl: (id) => `https://anilist.co/search/anime?search=${id}`,
      getTvUrl: (id, s, e) => `https://anilist.co/search/anime?search=${id}`
    }
  ];

  static async resolveFromTmdb(type: 'movie' | 'tv', id: string, season?: number, episode?: number): Promise<any[]> {
    logger.info(`Resolving ${type} from TMDB ID: ${id}`);
    
    const results = await Promise.all(this.providers.map(async (provider) => {
      const embedUrl = type === 'movie' 
        ? provider.getMovieUrl(id) 
        : provider.getTvUrl(id, season || 1, episode || 1);
      
      try {
        const links = await SmartResolver.resolve(embedUrl);
        return {
          provider: provider.name,
          embedUrl,
          links
        };
      } catch (error: any) {
        logger.error(`Provider ${provider.name} failed: ${error.message}`);
        return null;
      }
    }));

    return results.filter(r => r !== null);
  }
}
