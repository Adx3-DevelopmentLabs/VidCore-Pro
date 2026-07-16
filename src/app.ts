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

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json());

app.use('/api', router);

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
