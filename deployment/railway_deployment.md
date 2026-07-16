# Railway Deployment Guide for VidCore-Pro

This guide provides step-by-step instructions for deploying VidCore-Pro on Railway, a platform that makes it easy to deploy your code.

## 1. Prerequisites

*   A Railway account.
*   Your VidCore-Pro repository pushed to GitHub (which we've already done).

## 2. Deployment Steps

1.  **Log in to Railway:** Go to [Railway.app](https://railway.app/) and log in to your account.
2.  **New Project:** Click on "New Project" and then "Deploy from GitHub Repo."
3.  **Connect GitHub:** Connect your GitHub account if you haven't already, and select the `VidCore-Pro` repository.
4.  **Configure Deployment:**
    *   Railway will automatically detect your `Dockerfile` and suggest a Docker deployment.
    *   **Service Name:** `vidcore-pro` (or your preferred service name)
    *   **Branch:** `main`
    *   **Root Directory:** `/` (if your `Dockerfile` is in the root of the repository)
5.  **Environment Variables:** Add the following environment variables in the "Variables" tab of your service settings:
    *   `PORT`: `3000`
    *   `NODE_ENV`: `production`
    *   `CACHE_TTL`: `86400` (24 hours, adjust as needed)
    *   `MAX_WORKERS`: `15` (adjust based on instance type and expected load)
    *   `ENABLE_HARDWARE_ACCEL`: `false` (set to `true` if your Railway plan supports GPU and you configure it in Dockerfile)
    *   `LOG_LEVEL`: `info`
6.  **Deploy:** Click "Deploy" to start the deployment process.

Railway will build your Docker image and deploy your service. You can monitor the deployment logs in the Railway dashboard.

## 3. Post-Deployment

Once deployed, Railway will provide you with a public domain for your VidCore-Pro service. You can find this in the "Settings" tab of your service. Use this URL to access your API endpoints (e.g., `https://your-service-name.up.railway.app/api/health`).

**Note:** If you encounter any issues, check the deployment logs on Railway for detailed error messages.
