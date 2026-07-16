# Render Deployment Guide for VidCore-Pro

This guide provides step-by-step instructions for deploying VidCore-Pro on Render, a unified platform for building and running all your apps and websites.

## 1. Prerequisites

*   A Render account.
*   Your VidCore-Pro repository pushed to GitHub (which we've already done).

## 2. Deployment Steps

1.  **Log in to Render:** Go to [Render.com](https://render.com/) and log in to your account.
2.  **New Web Service:** From your dashboard, click on "New" and select "Web Service."
3.  **Connect GitHub:** Connect your GitHub account if you haven't already, and select the `VidCore-Pro` repository.
4.  **Configuration:**
    *   **Name:** `vidcore-pro` (or your preferred service name)
    *   **Region:** Choose a region close to your users.
    *   **Branch:** `main`
    *   **Root Directory:** `/` (if your `Dockerfile` is in the root of the repository)
    *   **Runtime:** `Docker` (Render will automatically detect your `Dockerfile`)
    *   **Build Command:** (Leave empty, as Docker handles this)
    *   **Start Command:** `pnpm start`
    *   **Instance Type:** Choose an appropriate instance type based on your expected load (e.g., `Starter` for testing, `Standard` for production).
5.  **Environment Variables:** Add the following environment variables under the "Environment" section:
    *   `PORT`: `3000`
    *   `NODE_ENV`: `production`
    *   `CACHE_TTL`: `86400` (24 hours, adjust as needed)
    *   `MAX_WORKERS`: `15` (adjust based on instance type and expected load)
    *   `ENABLE_HARDWARE_ACCEL`: `false` (set to `true` if your Render plan supports GPU and you configure it in Dockerfile)
    *   `LOG_LEVEL`: `info`
6.  **Advanced Settings (Optional):**
    *   **Health Check Path:** `/api/health`
    *   **Auto-Deploy:** Enable this to automatically deploy new changes when you push to your `main` branch.
7.  **Create Web Service:** Click "Create Web Service" to initiate the deployment.

Render will now build your Docker image and deploy your VidCore-Pro service. You can monitor the build and deployment logs directly from the Render dashboard.

## 3. Post-Deployment

Once deployed, Render will provide you with a public URL for your VidCore-Pro service. You can use this URL to access your API endpoints (e.g., `https://your-service-name.onrender.com/api/health`).

**Note:** If you encounter any issues, check the deployment logs on Render for detailed error messages.
