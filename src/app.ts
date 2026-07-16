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

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VidCore-Pro | منصة بث الوسائط العالمية</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
            .container { background: #1e293b; padding: 3rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); border: 1px solid #334155; }
            h1 { color: #38bdf8; font-size: 2.5rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; color: #94a3b8; margin-bottom: 2rem; }
            .status { display: inline-block; padding: 0.5rem 1rem; background: #065f46; color: #34d399; border-radius: 2rem; font-weight: bold; margin-bottom: 2rem; }
            .api-link { color: #38bdf8; text-decoration: none; font-weight: bold; border: 1px solid #38bdf8; padding: 0.75rem 1.5rem; border-radius: 0.5rem; transition: all 0.3s; }
            .api-link:hover { background: #38bdf8; color: #0f172a; }
            .footer { margin-top: 3rem; font-size: 0.9rem; color: #64748b; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 VidCore-Pro</h1>
            <div class="status">● السيرفر يعمل بنجاح (World-Class Version)</div>
            <p>مرحباً بك في أقوى منصة عالمية لتجميع وبث الوسائط. المحرك جاهز لخدمة تطبيقاتك بأعلى كفاءة.</p>
            <a href="/api/health" class="api-link">فحص حالة الـ API</a>
            <div class="footer">بنيت بواسطة Manus AI نحو القمة 🔝</div>
        </div>
    </body>
    </html>
  `);
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
