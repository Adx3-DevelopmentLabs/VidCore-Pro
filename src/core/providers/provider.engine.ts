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
    
    const results: any[] = [];
    const batchSize = 3; // Processing only 3 providers at a time to save RAM/CPU
    
    for (let i = 0; i < this.providers.length; i += batchSize) {
      const batch = this.providers.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (provider) => {
        const embedUrl = type === 'movie' 
          ? provider.getMovieUrl(id, mediaInfo || undefined) 
          : provider.getTvUrl(id, season || 1, episode || 1, mediaInfo || undefined);
        
        try {
          // Set a strict timeout for each provider to prevent 502/Gateway Timeout
          const links = await Promise.race([
            SmartResolver.resolve(embedUrl),
            new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
          ]);
          
          return {
            provider: provider.name,
            embedUrl,
            links
          };
        } catch (error: any) {
          logger.warn(`Provider ${provider.name} skipped: ${error.message}`);
          return null;
        }
      }));
      
      results.push(...batchResults.filter(r => r !== null && r.links.length > 0));
      
      // If we already found good links, we can stop early to be faster (Optional)
      if (results.length >= 5) break; 
    }

    return results;
  }
}
