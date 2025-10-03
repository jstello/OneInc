#!/bin/bash

# Test script for AI Writing Assistant container setup
# This script validates the Docker configuration files

echo "Testing AI Writing Assistant container setup..."

# Check if required files exist
echo ""
echo "Checking required files:"

files=(
    "docker-compose.yml"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "backend/.dockerignore"
    "frontend/.dockerignore"
    ".env.docker"
    "DOCKER_DEPLOYMENT.md"
    "build-containers.sh"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file (missing)"
    fi
done

# Validate Dockerfile syntax
echo ""
echo "Validating Dockerfile syntax:"

if command -v docker &> /dev/null; then
    echo "Checking backend/Dockerfile..."
    if docker build --dry-run -f backend/Dockerfile backend > /dev/null 2>&1; then
        echo "✓ backend/Dockerfile syntax is valid"
    else
        echo "✗ backend/Dockerfile syntax error"
    fi

    echo "Checking frontend/Dockerfile..."
    if docker build --dry-run -f frontend/Dockerfile frontend > /dev/null 2>&1; then
        echo "✓ frontend/Dockerfile syntax is valid"
    else
        echo "✗ frontend/Dockerfile syntax error"
    fi
else
    echo "Docker not available, skipping syntax validation"
fi

# Check docker-compose.yml structure
echo ""
echo "Checking docker-compose.yml structure:"

if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    if docker compose config > /dev/null 2>&1; then
        echo "✓ docker-compose.yml is valid"
    else
        echo "✗ docker-compose.yml has errors"
    fi
else
    echo "Docker Compose not available, skipping validation"
fi

# Check environment variables
echo ""
echo "Checking environment configuration:"

if [ -f ".env.docker" ]; then
    echo "✓ .env.docker template exists"

    # Check for required variables
    required_vars=("DEEPSEEK_API_KEY" "DEEPSEEK_BASE_URL")
    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.docker; then
            echo "✓ $var found in .env.docker"
        else
            echo "✗ $var missing from .env.docker"
        fi
    done
else
    echo "✗ .env.docker missing"
fi

echo ""
echo "Container setup validation complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.docker to .env and update with your API keys"
echo "2. Run: ./build-containers.sh"
echo "3. Run: docker compose up -d"
echo "4. Access the application at http://localhost:3000"