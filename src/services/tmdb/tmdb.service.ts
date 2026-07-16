import axios from 'axios';
import logger from '../../utils/logger.js';

export class TmdbService {
  private apiKey: string;
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchMovie(query: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query: query,
          language: 'ar-SA' // Default to Arabic
        }
      });
      return response.data.results;
    } catch (error: any) {
      logger.error(`TMDB Search Error: ${error.message}`);
      return [];
    }
  }

  async getMovieDetails(id: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/movie/${id}`, {
        params: {
          api_key: this.apiKey,
          language: 'ar-SA'
        }
      });
      return response.data;
    } catch (error: any) {
      logger.error(`TMDB Details Error: ${error.message}`);
      return null;
    }
  }
}
