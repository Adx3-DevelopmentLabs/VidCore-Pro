import { Router } from 'express';
import { ProxyEngine } from '../../core/proxy-engine/proxy.engine.js';
import { sourceAggregator } from '../../core/source-discovery/aggregator.js';
import { cacheService } from '../../core/cache-layer/cache.service.js';
import { IptvManager } from '../../core/iptv/iptv.manager.js';
import { TmdbService } from '../../services/tmdb/tmdb.service.js';

const router: Router = Router();
const tmdb = new TmdbService(process.env.TMDB_API_KEY || '');

router.get('/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL is required');
  await ProxyEngine.proxyStream(req, res, url as string);
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).send('Search query is required');
  
  const cached = cacheService.get(`search:${q}`);
  if (cached) return res.json(cached);

  const [sources, metadata] = await Promise.all([
    sourceAggregator.searchAll(q as string),
    tmdb.searchMovie(q as string)
  ]);

  const results = { sources, metadata };
  cacheService.set(`search:${q}`, results);
  res.json(results);
});

router.get('/iptv/parse', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('M3U URL is required');
  const channels = await IptvManager.parseM3u(url as string);
  res.json(channels);
});

router.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

router.get('/metrics', (req, res) => {
  res.json({
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime()
  });
});

router.post('/cache/clear', (req, res) => {
  cacheService.flush();
  res.json({ message: 'Cache cleared' });
});

export default router;
