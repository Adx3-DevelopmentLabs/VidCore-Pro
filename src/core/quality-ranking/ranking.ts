import { MediaSource } from '../source-discovery/aggregator.js';

export class QualityRanking {
  private static qualityMap: Record<string, number> = {
    '4k': 4,
    '2k': 3,
    '1080p': 2,
    '720p': 1,
    '480p': 0,
    '360p': -1
  };

  static rank(sources: MediaSource[]): MediaSource[] {
    return sources.sort((a, b) => {
      const qA = this.qualityMap[a.quality?.toLowerCase() || ''] || -2;
      const qB = this.qualityMap[b.quality?.toLowerCase() || ''] || -2;
      return qB - qA;
    });
  }

  static deduplicate(sources: MediaSource[]): MediaSource[] {
    const seen = new Set();
    return sources.filter(source => {
      const duplicate = seen.has(source.url);
      seen.add(source.url);
      return !duplicate;
    });
  }
}
