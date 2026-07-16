import logger from '../../utils/logger.js';

export interface MediaSource {
  id: string;
  name: string;
  type: 'movie' | 'series' | 'anime' | 'iptv';
  url: string;
  quality?: string;
}

export abstract class BaseAggregator {
  abstract name: string;
  abstract search(query: string): Promise<MediaSource[]>;
  abstract fetch(id: string): Promise<string | null>;
}

export class SourceAggregator {
  private aggregators: BaseAggregator[] = [];

  register(aggregator: BaseAggregator) {
    this.aggregators.push(aggregator);
    logger.info(`Registered aggregator: ${aggregator.name}`);
  }

  async searchAll(query: string): Promise<MediaSource[]> {
    const results = await Promise.all(this.aggregators.map(a => a.search(query)));
    return results.flat();
  }
}

export const sourceAggregator = new SourceAggregator();
