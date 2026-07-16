import axios from 'axios';
import logger from '../../utils/logger.js';

export interface IptvChannel {
  name: string;
  url: string;
  group: string;
  logo?: string;
}

export class IptvManager {
  static async parseM3u(url: string): Promise<IptvChannel[]> {
    try {
      const response = await axios.get(url);
      const lines = response.data.split('\n');
      const channels: IptvChannel[] = [];
      let currentChannel: Partial<IptvChannel> = {};

      for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#EXTINF:')) {
          const nameMatch = line.match(/,(.*)$/);
          const groupMatch = line.match(/group-title="(.*?)"/);
          const logoMatch = line.match(/tvg-logo="(.*?)"/);
          
          currentChannel.name = nameMatch ? nameMatch[1] : 'Unknown';
          currentChannel.group = groupMatch ? groupMatch[1] : 'General';
          currentChannel.logo = logoMatch ? logoMatch[1] : '';
        } else if (line.startsWith('http')) {
          currentChannel.url = line;
          channels.push(currentChannel as IptvChannel);
          currentChannel = {};
        }
      }
      return channels;
    } catch (error: any) {
      logger.error(`IPTV Parse Error: ${error.message}`);
      return [];
    }
  }
}
