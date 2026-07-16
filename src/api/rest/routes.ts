import { Router } from 'express';
import { ProxyEngine } from '../../core/proxy-engine/proxy.engine.js';
import { sourceAggregator } from '../../core/source-discovery/aggregator.js';
import { cacheService } from '../../core/cache-layer/cache.service.js';

const router = Router();

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

  const results = await sourceAggregator.searchAll(q as string);
  cacheService.set(`search:${q}`, results);
  res.json(results);
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
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
