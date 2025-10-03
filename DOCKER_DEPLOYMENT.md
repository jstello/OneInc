# Docker Deployment Guide for AI Writing Assistant

This guide covers the containerization setup for the AI Writing Assistant application.

## Architecture Overview

- **Backend**: FastAPI Python application (port 8000)
- **Frontend**: Next.js React application (port 3000)
- **Network**: Custom bridge network for inter-service communication

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Production Deployment

1. **Setup Environment**
   ```bash
   cp .env.docker .env
   # Edit .env with your actual API keys
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **Verify Deployment**
   ```bash
   docker-compose ps
   curl http://localhost:8000/health
   curl http://localhost:3000
   ```

### Development Environment

1. **Start Development Services**
   ```bash
   docker-compose --profile dev up -d
   ```

2. **Access Services**
   - Frontend: http://localhost:3001 (hot reload enabled)
   - Backend: http://localhost:8001 (auto-reload enabled)

## Service Details

### Backend Service
- **Image**: Multi-stage Python 3.13 build
- **Port**: 8000 (production), 8001 (development)
- **Health Check**: `/health` endpoint
- **Features**:
  - Non-root user execution
  - Optimized dependency caching
  - Security hardening

### Frontend Service
- **Image**: Multi-stage Node.js 18 build
- **Port**: 3000 (production), 3001 (development)
- **Health Check**: Root endpoint
- **Features**:
  - Optimized Next.js build
  - Production-ready static serving
  - Non-root user execution

## Environment Variables

### Required Variables
- `DEEPSEEK_API_KEY`: DeepSeek API key
- `DEEPSEEK_BASE_URL`: DeepSeek API base URL

### Optional Variables
- `ALLOWED_ORIGINS`: CORS allowed origins (default: localhost)
- `NEXT_PUBLIC_BACKEND_URL`: Backend URL for frontend

## Commands

### Production
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Scale services
docker-compose up -d --scale backend=2
```

### Development
```bash
# Start with hot reload
docker-compose --profile dev up -d

# View development logs
docker-compose logs -f backend-dev frontend-dev

# Run tests
docker-compose exec backend-dev pytest
```

### Maintenance
```bash
# Clean up unused resources
docker system prune

# View resource usage
docker stats

# Inspect containers
docker-compose exec backend sh
```

## Health Monitoring

Both services include health checks:
- **Backend**: Checks `/health` endpoint
- **Frontend**: Checks root endpoint availability
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts

## Security Features

- Non-root user execution
- Minimal base images (slim/alpine)
- Environment variable isolation
- Network segmentation
- Read-only filesystem where possible

## Performance Optimizations

- Multi-stage builds for smaller images
- Layer caching for faster builds
- Production-optimized dependencies
- Static file serving optimization

## Troubleshooting

### Common Issues

1. **API Key Issues**
   ```bash
   # Verify environment variables
   docker-compose exec backend env | grep DEEPSEEK
   ```

2. **Health Check Failures**
   ```bash
   # Check service status
   docker-compose ps
   docker-compose logs backend
   ```

3. **Build Issues**
   ```bash
   # Clear build cache
   docker-compose build --no-cache
   ```

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## Production Considerations

1. **Reverse Proxy**: Use nginx/traefik for SSL termination
2. **Monitoring**: Integrate with Prometheus/Grafana
3. **Logging**: Configure log aggregation
4. **Secrets**: Use Docker secrets or external vault
5. **Scaling**: Consider horizontal scaling for backend

## Development Workflow

1. Make code changes
2. Services auto-reload in development mode
3. Test changes immediately
4. Build production images when ready
5. Deploy to production environment