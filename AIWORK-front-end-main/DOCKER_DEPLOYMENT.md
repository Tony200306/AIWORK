# Docker Deployment Guide

This guide explains how to deploy Vantum Frontend using Docker.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 1.29+)
- Access to required API services (Backend, AI Service, etc.)

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```bash
# Core Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_FILE_RESOURCE_URL=https://your-file-service.com
NEXT_HOST_URL=https://your-frontend-domain.com
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# Braindump & AI Services
NEXT_PUBLIC_AI_SERVICE_URL=https://your-braindump-service.com
NEXT_PUBLIC_AI_SERVICE_API_KEY=your_braindump_api_key
NEXT_PUBLIC_AI_SERVICE_URL=http://your-ai-service:8041
NEXT_PUBLIC_AI_SERVICE_API_KEY=your_ai_service_api_key

# Stack Auth (OAuth)
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
STACK_SECRET_SERVER_KEY=your_stack_secret_key

# Third-party Services
DEEPGRAM_API_KEY=your_deepgram_api_key
```

### 2. Build and Run

```bash
# Build and start the container
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3000`

## Configuration Details

### Required Environment Variables

#### Core Configuration
- `NEXT_PUBLIC_API_BASE_URL` - Backend API endpoint for user authentication and data management
- `NEXT_PUBLIC_DEFAULT_LANGUAGE` - Default UI language (en, cn, vn, kr)
- `NEXT_PUBLIC_FILE_RESOURCE_URL` - File upload and storage service URL
- `NEXT_HOST_URL` - Frontend application URL (used for OAuth callbacks)
- `NEXT_PUBLIC_MIXPANEL_TOKEN` - Analytics tracking token

#### AI Services
- `NEXT_PUBLIC_AI_SERVICE_URL` - Braindump processing service endpoint
- `NEXT_PUBLIC_AI_SERVICE_API_KEY` - API key for braindump service
- `NEXT_PUBLIC_AI_SERVICE_URL` - AI task decomposition service endpoint
- `NEXT_PUBLIC_AI_SERVICE_API_KEY` - API key for AI service

#### Stack Auth (OAuth)
- `NEXT_PUBLIC_STACK_PROJECT_ID` - Stack Auth project identifier
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` - Public key for client-side auth
- `STACK_SECRET_SERVER_KEY` - Secret key for server-side auth (keep secure!)

#### Third-party Services
- `DEEPGRAM_API_KEY` - API key for voice transcription service

### Port Configuration

By default, the application runs on port `3000`. To change this:

```yaml
# docker-compose.yml
ports:
  - "8080:3000"  # Change 8080 to your desired port
```

## Production Deployment

### Using Docker Compose

1. Ensure all environment variables are set in `.env`
2. Build with production settings:

```bash
docker-compose up --build -d
```

### Using Dockerfile directly

```bash
# Build the image
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_AI_SERVICE_URL=http://ai-service:8041 \
  --build-arg NEXT_PUBLIC_AI_SERVICE_API_KEY=your_key \
  # ... add all other build args
  -t vantum-frontend:latest .

# Run the container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name vantum-frontend \
  vantum-frontend:latest
```

## Troubleshooting

### Container fails to start

Check logs for errors:
```bash
docker-compose logs vantum-frontend
```

### Environment variables not loading

Ensure `.env` file exists and is properly formatted:
```bash
cat .env
```

### Build failures

Clear Docker cache and rebuild:
```bash
docker-compose down -v
docker system prune -af
docker-compose up --build
```

### AI Service connection issues

Verify AI Service is accessible from container:
```bash
docker exec vantum-frontend-dc curl http://your-ai-service:8041/health
```

## Security Notes

- **NEVER commit `.env` file to version control**
- Keep `STACK_SECRET_SERVER_KEY` secure - it grants full access to Stack Auth
- Use HTTPS in production for all API endpoints
- Rotate API keys regularly
- Use Docker secrets or environment variable management tools in production

## Health Checks

Check if the application is running:

```bash
curl http://localhost:3000/api/health
```

## Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# View logs to confirm successful restart
docker-compose logs -f
```

## Support

For issues related to:
- **Docker setup**: Check this guide
- **Environment configuration**: See `.env.example`
- **Application features**: See `CLAUDE.md`
- **Backend API**: Contact backend team
- **Stack Auth**: Visit https://docs.stack-auth.com
