import logger from '../../utils/logger.js';
import { SmartResolver } from '../resolver/smart-resolver.js';
import { SmartMappingEngine, type MediaInfo } from '../mapping/smart-mapping.js';

export interface Provider {
  name: string;
  baseUrl: string;
  getMovieUrl(id: string, info?: MediaInfo): string;
  getTvUrl(id: string, season: number, episode: number, info?: MediaInfo): string;
}

export class ProviderEngine {
  private static providers: Provider[] = [
    // --- 🇸🇦 Arabic Providers (Title-based) ---
    { name: 'MyCima', baseUrl: 'https://mycima.tube', getMovieUrl: (id, info) => `https://mycima.tube/search/${info?.title}`, getTvUrl: (id, s, e, info) => `https://mycima.tube/search/${info?.title}` },
    { name: 'Akwam', baseUrl: 'https://akwam.to', getMovieUrl: (id, info) => `https://akwam.to/search?q=${info?.title}`, getTvUrl: (id, s, e, info) => `https://akwam.to/search?q=${info?.title}` },
    { name: 'Cima4U', baseUrl: 'https://cima4u.io', getMovieUrl: (id, info) => `https://cima4u.io/search/${info?.title}`, getTvUrl: (id, s, e, info) => `https://cima4u.io/search/${info?.title}` },
    { name: 'Shahid4U', baseUrl: 'https://shahid4u.com', getMovieUrl: (id, info) => `https://shahid4u.com/?s=${info?.title}`, getTvUrl: (id, s, e, info) => `https://shahid4u.com/?s=${info?.title}` },
    
    // --- 🎬 Global Providers (TMDB & Title-based) ---
    { name: 'VidSrc', baseUrl: 'https://vidsrc.me', getMovieUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`, getTvUrl: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { name: 'VidSrc.to', baseUrl: 'https://vidsrc.to', getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`, getTvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { name: 'Fmovies', baseUrl: 'https://fmovies.to', getMovieUrl: (id, info) => `https://fmovies.to/search?keyword=${info?.title}`, getTvUrl: (id, s, e, info) => `https://fmovies.to/search?keyword=${info?.title}` },
    
    // --- 🎌 Anime Providers (Title-based) ---
    { name: 'AnimeSlayer', baseUrl: 'https://anslayer.com', getMovieUrl: (id, info) => `https://anslayer.com/?s=${info?.title}`, getTvUrl: (id, s, e, info) => `https://anslayer.com/?s=${info?.title}` },
    { name: 'WitAnime', baseUrl: 'https://witanime.com', getMovieUrl: (id, info) => `https://witanime.com/?s=${info?.title}`, getTvUrl: (id, s, e, info) => `https://witanime.com/?s=${info?.title}` },
    { name: '9Anime', baseUrl: 'https://9anime.to', getMovieUrl: (id, info) => `https://9anime.to/search?keyword=${info?.title}`, getTvUrl: (id, s, e, info) => `https://9anime.to/search?keyword=${info?.title}` }
  ];

  static async resolveFromTmdb(type: 'movie' | 'tv', id: string, season?: number, episode?: number): Promise<any[]> {
    logger.info(`Resolving ${type} from TMDB ID: ${id}`);
    
    const mediaInfo = await SmartMappingEngine.getMediaInfo(id, type);
    
    const results = await Promise.all(this.providers.map(async (provider) => {
      const embedUrl = type === 'movie' 
        ? provider.getMovieUrl(id, mediaInfo || undefined) 
        : provider.getTvUrl(id, season || 1, episode || 1, mediaInfo || undefined);
      
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

    return results.filter(r => r !== null && r.links.length > 0);
  }
}
