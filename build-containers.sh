#!/bin/bash

# AI Writing Assistant Container Build Script
# This script builds the Docker images for production and development

set -e

echo "Building AI Writing Assistant containers..."

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    exit 1
fi

# Build production images
echo "Building production backend..."
docker build -t ai-writing-backend:latest ./backend --target production

echo "Building production frontend..."
docker build -t ai-writing-frontend:latest ./frontend --target runner

# Build development images
echo "Building development backend..."
docker build -t ai-writing-backend-dev:latest ./backend --target builder

echo "Building development frontend..."
docker build -t ai-writing-frontend-dev:latest ./frontend --target builder

echo ""
echo "Build complete!"
echo ""
echo "Available images:"
echo "  ai-writing-backend:latest (production)"
echo "  ai-writing-frontend:latest (production)"
echo "  ai-writing-backend-dev:latest (development)"
echo "  ai-writing-frontend-dev:latest (development)"
echo ""
echo "To run with docker-compose:"
echo "  docker compose up -d"
echo ""
echo "To run development services:"
echo "  docker compose --profile dev up -d"