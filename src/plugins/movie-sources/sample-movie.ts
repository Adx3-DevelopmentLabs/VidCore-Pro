import { BaseAggregator } from '../../core/source-discovery/aggregator.js';
import type { MediaSource } from '../../core/source-discovery/aggregator.js';

export class SampleMovieAggregator extends BaseAggregator {
  name = 'SampleMovie';

  async search(query: string): Promise<MediaSource[]> {
    // Mock implementation
    return [
      {
        id: '1',
        name: `${query} - HD Stream`,
        type: 'movie',
        url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        quality: '720p'
      }
    ];
  }

  async fetch(id: string): Promise<string | null> {
    return 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
  }
}
