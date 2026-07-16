import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import router from './api/rest/routes.js';
import logger from './utils/logger.js';

dotenv.config();

const app: express.Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json());

import { sourceAggregator } from './core/source-discovery/aggregator.js';
import { SampleMovieAggregator } from './plugins/movie-sources/sample-movie.js';
import { GlobalAggregator } from './plugins/global-sources/global-aggregator.js';

sourceAggregator.register(new SampleMovieAggregator());
sourceAggregator.register(new GlobalAggregator());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/api', router);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  logger.info('New WebSocket connection');
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to VidCore-Pro' }));
});

server.listen(port, () => {
  logger.info(`VidCore-Pro running on port ${port}`);
});

export default app;
