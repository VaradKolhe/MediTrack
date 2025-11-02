#!/bin/bash

# Bed Tracker Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[BED TRACKER]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 {start|stop|restart|status|logs|clean|build}"
    echo ""
    echo "Commands:"
    echo "  start    - Start all services"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  status   - Show status of all services"
    echo "  logs     - Show logs for all services"
    echo "  clean    - Clean up containers and volumes"
    echo "  build    - Build all Docker images"
    echo ""
}

# Function to start services
start_services() {
    print_header "Starting Bed Tracker Services..."
    docker-compose up -d
    print_status "Services started successfully!"
    echo ""
    print_status "Service URLs:"
    echo "  🌐 Eureka Server: http://localhost:8761"
    echo "  👤 User Service: http://localhost:8082"
    echo "  🏥 Hospital Service: http://localhost:8081"
    echo "  👨‍💼 Admin Service: http://localhost:8083"
    echo "  🔄 Load Balancer: http://localhost:80"
    echo "  🗄️  MySQL: localhost:3306"
}

# Function to stop services
stop_services() {
    print_header "Stopping Bed Tracker Services..."
    docker-compose down
    print_status "Services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_header "Restarting Bed Tracker Services..."
    docker-compose restart
    print_status "Services restarted successfully!"
}

# Function to show status
show_status() {
    print_header "Bed Tracker Services Status:"
    echo ""
    docker-compose ps
    echo ""
    print_status "Health Checks:"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

# Function to show logs
show_logs() {
    print_header "Bed Tracker Services Logs:"
    docker-compose logs -f
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_header "Cleaning up Bed Tracker..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to build images
build_images() {
    print_header "Building Bed Tracker Images..."
    ./build-docker.sh
}

# Main script logic
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_up
        ;;
    build)
        build_images
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
