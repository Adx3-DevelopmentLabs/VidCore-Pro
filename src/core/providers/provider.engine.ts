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
    // --- 🇸🇦 Arabic Providers ---
    { name: 'MyCima', baseUrl: 'https://mycima.tube', getMovieUrl: (id) => `https://mycima.tube/search/${id}`, getTvUrl: (id, s, e) => `https://mycima.tube/search/${id}` },
    { name: 'Akwam', baseUrl: 'https://akwam.to', getMovieUrl: (id) => `https://akwam.to/search?q=${id}`, getTvUrl: (id, s, e) => `https://akwam.to/search?q=${id}` },
    { name: 'Cima4U', baseUrl: 'https://cima4u.io', getMovieUrl: (id) => `https://cima4u.io/search/${id}`, getTvUrl: (id, s, e) => `https://cima4u.io/search/${id}` },
    { name: 'Shahid4U', baseUrl: 'https://shahid4u.com', getMovieUrl: (id) => `https://shahid4u.com/?s=${id}`, getTvUrl: (id, s, e) => `https://shahid4u.com/?s=${id}` },
    { name: 'FaselAd', baseUrl: 'https://faselhd.co', getMovieUrl: (id) => `https://faselhd.co/?s=${id}`, getTvUrl: (id, s, e) => `https://faselhd.co/?s=${id}` },
    { name: 'ArabSeed', baseUrl: 'https://arabseed.show', getMovieUrl: (id) => `https://arabseed.show/?s=${id}`, getTvUrl: (id, s, e) => `https://arabseed.show/?s=${id}` },
    { name: 'Movs4u', baseUrl: 'https://movs4u.ws', getMovieUrl: (id) => `https://movs4u.ws/?s=${id}`, getTvUrl: (id, s, e) => `https://movs4u.ws/?s=${id}` },
    { name: 'CimaClub', baseUrl: 'https://cimaclub.com', getMovieUrl: (id) => `https://cimaclub.com/?s=${id}`, getTvUrl: (id, s, e) => `https://cimaclub.com/?s=${id}` },

    // --- 🎬 Global Providers ---
    { name: 'VidSrc', baseUrl: 'https://vidsrc.me', getMovieUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`, getTvUrl: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { name: 'Fmovies', baseUrl: 'https://fmovies.to', getMovieUrl: (id) => `https://fmovies.to/search?keyword=${id}`, getTvUrl: (id, s, e) => `https://fmovies.to/search?keyword=${id}` },
    { name: '123Movies', baseUrl: 'https://123movies.com', getMovieUrl: (id) => `https://123movies.com/search/${id}`, getTvUrl: (id, s, e) => `https://123movies.com/search/${id}` },
    { name: 'Soap2Day', baseUrl: 'https://soap2day.to', getMovieUrl: (id) => `https://soap2day.to/search/keyword/${id}`, getTvUrl: (id, s, e) => `https://soap2day.to/search/keyword/${id}` },
    { name: 'SolarMovies', baseUrl: 'https://solarmovie.pe', getMovieUrl: (id) => `https://solarmovie.pe/search/${id}`, getTvUrl: (id, s, e) => `https://solarmovie.pe/search/${id}` },
    { name: 'Putlocker', baseUrl: 'https://putlocker.vc', getMovieUrl: (id) => `https://putlocker.vc/search?keyword=${id}`, getTvUrl: (id, s, e) => `https://putlocker.vc/search?keyword=${id}` },

    // --- 🎌 Anime Providers ---
    { name: 'AnimeSlayer', baseUrl: 'https://anslayer.com', getMovieUrl: (id) => `https://anslayer.com/?s=${id}`, getTvUrl: (id, s, e) => `https://anslayer.com/?s=${id}` },
    { name: 'WitAnime', baseUrl: 'https://witanime.com', getMovieUrl: (id) => `https://witanime.com/?s=${id}`, getTvUrl: (id, s, e) => `https://witanime.com/?s=${id}` },
    { name: 'GogoAnime', baseUrl: 'https://gogoanime.tel', getMovieUrl: (id) => `https://gogoanime.tel/search.html?keyword=${id}`, getTvUrl: (id, s, e) => `https://gogoanime.tel/search.html?keyword=${id}` },
    { name: '9Anime', baseUrl: 'https://9anime.to', getMovieUrl: (id) => `https://9anime.to/search?keyword=${id}`, getTvUrl: (id, s, e) => `https://9anime.to/search?keyword=${id}` },
    { name: 'KissAnime', baseUrl: 'https://kissanime.com.ru', getMovieUrl: (id) => `https://kissanime.com.ru/Search/?s=${id}`, getTvUrl: (id, s, e) => `https://kissanime.com.ru/Search/?s=${id}` }
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
