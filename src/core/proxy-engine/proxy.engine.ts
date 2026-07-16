import axios from 'axios';
import { Request, Response } from 'express';
import logger from '../../utils/logger.js';

export class ProxyEngine {
  static async proxyStream(req: Request, res: Response, targetUrl: string) {
    try {
      logger.info(`Proxying stream: ${targetUrl}`);
      
      const response = await axios({
        method: 'get',
        url: targetUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': 'VidCore-Pro/1.0.0',
          'Referer': new URL(targetUrl).origin,
        },
      });

      // Forward headers
      res.setHeader('Content-Type', response.headers['content-type'] || 'application/vnd.apple.mpegurl');
      res.setHeader('Access-Control-Allow-Origin', '*');

      response.data.pipe(res);

      response.data.on('error', (err: any) => {
        logger.error(`Stream pipe error: ${err.message}`);
        res.end();
      });

    } catch (error: any) {
      logger.error(`Proxy error: ${error.message}`);
      res.status(500).send('Streaming error');
    }
  }

  static rewritePlaylist(content: string, baseUrl: string): string {
    // Basic HLS playlist rewriting logic
    return content.split('\n').map(line => {
      if (line.startsWith('#') || line.trim() === '') return line;
      if (line.startsWith('http')) return line;
      return new URL(line, baseUrl).toString();
    }).join('\n');
  }
}
