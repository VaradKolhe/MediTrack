#!/bin/bash

# Bed Tracker Docker Build Script

set -e

echo "🏗️  Building Bed Tracker Microservices..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build all services
print_status "Building Eureka Server..."
docker build -f EurekaServer/Dockerfile -t bed-tracker/eureka-server:latest .

print_status "Building User Service..."
docker build -f userservice/Dockerfile -t bed-tracker/user-service:latest .

print_status "Building Hospital Service..."
docker build -f hospitalservice/Dockerfile -t bed-tracker/hospital-service:latest .

print_status "Building Admin Service..."
docker build -f adminservice/Dockerfile -t bed-tracker/admin-service:latest .

print_status "✅ All services built successfully!"

# Show built images
echo ""
print_status "Built Docker images:"
docker images | grep bed-tracker

echo ""
print_status "🚀 Ready to deploy! Run 'docker-compose up -d' to start all services."
