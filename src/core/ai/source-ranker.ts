import logger from '../../utils/logger.js';

export interface SourceScore {
  url: string;
  score: number;
  latency: number;
  reliability: number;
}

export class AISourceRanker {
  // Simple heuristic-based AI ranking (can be expanded with real ML model)
  static rankSources(sources: string[], history: any[]): string[] {
    logger.info(`AI Ranking ${sources.length} sources`);
    
    const scoredSources = sources.map(url => {
      let score = 100;
      
      // Heuristic 1: Domain reliability
      if (url.includes('google') || url.includes('vimeo')) score += 20;
      if (url.includes('blogspot')) score -= 10;
      
      // Heuristic 2: Protocol
      if (url.startsWith('https')) score += 10;
      
      // Heuristic 3: History-based scoring (if available)
      const siteHistory = history.find(h => new URL(url).hostname === h.domain);
      if (siteHistory) {
        score += (siteHistory.successRate * 50) - (siteHistory.avgLatency / 100);
      }

      return { url, score };
    });

    return scoredSources
      .sort((a, b) => b.score - a.score)
      .map(s => s.url);
  }
}
