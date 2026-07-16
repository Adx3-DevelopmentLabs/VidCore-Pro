# VidCore-Pro: Universal Media Stream Proxy & Aggregator

## Project Architecture and File Structure Design

This document outlines the initial architectural design and proposed file structure for the VidCore-Pro project, a comprehensive, high-performance microservice for streaming video content.

### 1. Core Modules

Based on the project overview, VidCore-Pro will consist of several interconnected core modules:

*   **Source Discovery**: Responsible for identifying and aggregating M3U8 links from 50+ free sources, including movies, series, anime, and international IPTV channels. It will also integrate with `yt-dlp` for platforms like YouTube, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion, and Twitch.
*   **Validation Engine**: A multi-threaded component (15+ concurrent workers) to verify the validity of discovered links, detect geo-blocking, and implement automatic fallbacks.
*   **Quality Ranking**: Handles deduplication using fuzzy title matching and ranks streams based on resolution (4K > 1080p > 720p).
*   **Cache Layer**: Implements intelligent caching with configurable TTL (5 min to 7 days), including an L1 Memory Cache for hot playlists and an L2 Persistent Cache for long-term storage. It will also manage automatic refreshing of expired links.
*   **Proxy Engine**: A zero-transcoding HTTP proxy with byte-for-byte streaming, connection sharing, HLS playlist rewriting, and sub-100ms failover switching. Hardware acceleration (NVIDIA NVENC, Intel VAAPI) will be supported for transcoding.
*   **Metadata Extractor**: Responsible for extracting subtitles (SRT, VTT) and detecting/tagging languages for multilingual content.
*   **REST API + WebSocket Endpoints**: Provides the external interface for the service, including endpoints for proxying, searching, fetching from specific sources, listing sources, health checks, metrics, cache clearing, and webhook notifications.

### 2. Proposed File Structure

The project will follow a modular structure to ensure maintainability and scalability. The main directories and their purposes are outlined below:

```
VidCore-Pro/
├── src/
│   ├── core/
│   │   ├── source-discovery/
│   │   ├── validation-engine/
│   │   ├── quality-ranking/
│   │   ├── cache-layer/
│   │   ├── proxy-engine/
│   │   ├── metadata-extractor/
│   │   └── index.ts  # Core module entry point
│   ├── api/
│   │   ├── rest/
│   │   ├── websocket/
│   │   └── middleware/
│   ├── services/
│   │   ├── yt-dlp/
│   │   └── health-metrics/
│   ├── plugins/
│   │   ├── movie-sources/
│   │   ├── anime-sources/
│   │   └── iptv-sources/
│   ├── utils/
│   ├── config/
│   └── app.ts  # Main application entry point
├── tests/
├── docs/
├── deployment/
│   ├── docker/
│   ├── render/
│   ├── railway/
│   └── vercel/
├── .env.example
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

**Directory Breakdown:**

*   `src/`: Contains all source code.
    *   `core/`: Houses the fundamental business logic and modules of VidCore-Pro.
    *   `api/`: Defines the REST API endpoints, WebSocket handlers, and any necessary middleware.
    *   `services/`: Contains integrations with external services like `yt-dlp` and internal services like health/metrics.
    *   `plugins/`: Modular directory for adding new source aggregators without modifying core logic.
    *   `utils/`: Common utility functions and helpers.
    *   `config/`: Configuration files for different environments and settings.
    *   `app.ts`: The main entry point for the Node.js application.
*   `tests/`: Unit and integration tests for the project.
*   `docs/`: Project documentation, including API specifications and deployment guides.
*   `deployment/`: Configuration files and scripts for various deployment platforms (Docker, Render, Railway, Vercel).
*   `.env.example`: Example environment variables for configuration.
*   `package.json`: Node.js project manifest.
*   `tsconfig.json`: TypeScript configuration.
*   `.gitignore`: Specifies intentionally untracked files to ignore.
*   `README.md`: Project overview and documentation.

### 3. Technology Stack

*   **Language**: TypeScript
*   **Runtime**: Node.js
*   **Framework**: (To be determined, likely Express.js or Fastify for API, or a lightweight alternative)
*   **Caching**: In-memory cache (e.g., `node-cache`) and persistent cache (e.g., Redis or a file-based solution).
*   **Concurrency**: Worker threads or a similar mechanism for multi-threaded validation.
*   **Deployment**: Docker, Render, Railway, Vercel.

This design provides a solid foundation for developing VidCore-Pro, ensuring a modular, scalable, and maintainable codebase.
