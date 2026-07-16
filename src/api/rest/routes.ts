import { Router } from 'express';
import { ProxyEngine } from '../../core/proxy-engine/proxy.engine.js';
import { sourceAggregator } from '../../core/source-discovery/aggregator.js';
import { cacheService } from '../../core/cache-layer/cache.service.js';
import { IptvManager } from '../../core/iptv/iptv.manager.js';
import { TmdbService } from '../../services/tmdb/tmdb.service.js';
import { SmartResolver } from '../../core/resolver/smart-resolver.js';
import { ValidationEngine } from '../../core/validation-engine/validation.engine.js';
import { SubtitleService } from '../../services/subtitles/subtitle.service.js';
import { QualityOrchestrator } from '../../core/orchestrator/quality.orchestrator.js';

const router: Router = Router();
const tmdb = new TmdbService(process.env.TMDB_API_KEY || '');

router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    await ProxyEngine.proxyStream(req, res, url as string);
  } catch (error: any) {
    res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
});

router.get('/resolve', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const cached = cacheService.get(`resolve:${url}`);
    if (cached) return res.json(cached);

    const [links, subtitles, qualities] = await Promise.all([
      SmartResolver.resolve(url as string),
      SubtitleService.getSubtitles(url as string),
      QualityOrchestrator.getAvailableQualities(url as string)
    ]);

    const validLinks = await ValidationEngine.validateBatch(links);
    
    const result = {
      links: validLinks,
      subtitles,
      qualities,
      masterPlaylist: qualities.length > 0 ? QualityOrchestrator.generateMasterPlaylist(qualities) : null
    };

    cacheService.set(`resolve:${url}`, result);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Resolution failed', details: error.message });
  }
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
