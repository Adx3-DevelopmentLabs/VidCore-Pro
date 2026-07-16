import NodeCache from 'node-cache';
import logger from '../../utils/logger.js';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
    logger.info('Cache Service Initialized');
  }

  set(key: string, value: any, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 3600);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
    logger.info('Cache Flushed');
  }
}

export const cacheService = new CacheService();
