import axios from 'axios';
import logger from '../../utils/logger.js';
import { cacheService } from '../cache-layer/cache.service.js';

export interface IptvChannel {
  name: string;
  url: string;
  group: string;
  logo?: string;
}

export class IptvManager {
  static async parseM3u(url: string): Promise<IptvChannel[]> {
    const cacheKey = `iptv:${url}`;
    const cached = cacheService.get<IptvChannel[]>(cacheKey);
    if (cached) return cached;

    try {
      logger.info(`Parsing IPTV M3U: ${url}`);
      const response = await axios.get(url, { timeout: 15000 });
      const content = response.data;
      
      const channels: IptvChannel[] = [];
      const lines = content.split('\n');
      
      let currentChannel: Partial<IptvChannel> = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
          const info = line.substring(8);
          const nameMatch = info.match(/,(.*)$/);
          const groupMatch = info.match(/group-title="(.*?)"/);
          const logoMatch = info.match(/tvg-logo="(.*?)"/);
          
          currentChannel = {
            name: nameMatch ? nameMatch[1]?.trim() : 'Unknown Channel',
            group: groupMatch ? groupMatch[1] : 'General',
            logo: logoMatch ? logoMatch[1] : ''
          };
        } else if (line.startsWith('http')) {
          if (currentChannel.name) {
            currentChannel.url = line;
            channels.push(currentChannel as IptvChannel);
            currentChannel = {};
          }
        }
      }

      cacheService.set(cacheKey, channels, 3600); // Cache for 1 hour
      return channels;
    } catch (error: any) {
      logger.error(`IPTV Parse Error: ${error.message}`);
      return [];
    }
  }
}
