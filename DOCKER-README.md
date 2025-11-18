# 🐳 Bed Tracker - Docker Deployment Guide

This guide will help you deploy the complete Bed Tracker microservices system using Docker and Docker Compose.

## 📋 Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (to clone the repository)
- **8GB RAM** minimum (recommended for smooth operation)
- **10GB free disk space**

## 🏗️ Architecture Overview

The Bed Tracker system consists of the following microservices:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Service  │    │ Hospital Service│    │  Admin Service  │
│    Port: 8082   │    │    Port: 8081   │    │    Port: 8083   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Eureka Server   │
                    │   Port: 8761    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │     MySQL       │
                    │   Port: 3306    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Nginx       │
                    │   Port: 80      │
                    └─────────────────┘
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd Bed-Tracker
```

### 2. Make Scripts Executable
```bash
chmod +x build-docker.sh
chmod +x docker-manage.sh
```

### 3. Build All Services
```bash
./build-docker.sh
```

### 4. Start All Services
```bash
./docker-manage.sh start
```

### 5. Verify Deployment
```bash
./docker-manage.sh status
```

## 🔧 Service URLs

Once deployed, you can access the services at:

| Service | URL | Description |
|---------|-----|-------------|
| **Eureka Server** | http://localhost:8761 | Service Discovery Dashboard |
| **User Service** | http://localhost:8082 | User Authentication & Management |
| **Hospital Service** | http://localhost:8081 | Hospital Management |
| **Admin Service** | http://localhost:8083 | Admin Operations |
| **Load Balancer** | http://localhost:80 | Nginx Load Balancer |
| **MySQL Database** | localhost:3306 | Database Server |

## 📊 Management Commands

### Using the Management Script
```bash
# Start all services
./docker-manage.sh start

# Stop all services
./docker-manage.sh stop

# Restart all services
./docker-manage.sh restart

# Check service status
./docker-manage.sh status

# View logs
./docker-manage.sh logs

# Clean up everything
./docker-manage.sh clean

# Build images
./docker-manage.sh build
```

### Using Docker Compose Directly
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Scale a service
docker-compose up -d --scale user-service=2

# Rebuild and start
docker-compose up -d --build
```

## 🗄️ Database Configuration

### MySQL Configuration
- **Host**: mysql (internal) / localhost:3306 (external)
- **Root Password**: root
- **Application User**: bedtracker / bedtracker123
- **Database**: MediTrackDB

### Connecting to Database
```bash
# Using Docker
docker exec -it bed-tracker-mysql mysql -u root -p

# Using external client
mysql -h localhost -P 3306 -u root -p
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoints
- **User Service**: http://localhost:8082/actuator/health
- **Hospital Service**: http://localhost:8081/actuator/health
- **Admin Service**: http://localhost:8083/actuator/health
- **Eureka Server**: http://localhost:8761/actuator/health

### Monitoring Commands
```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View resource usage
docker stats

# Check logs for specific service
docker-compose logs user-service
docker-compose logs hospital-service
```

## 🧪 Testing the Deployment

### 1. Test User Service
```bash
# Register a new user
curl -X POST http://localhost:8082/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 2. Test Service Discovery
Visit http://localhost:8761 to see all registered services in the Eureka dashboard.

### 3. Test Load Balancer
```bash
# Test through load balancer
curl http://localhost/api/auth/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Configuration

### Environment Variables
You can customize the deployment by setting environment variables:

```bash
# Database configuration
export MYSQL_ROOT_PASSWORD=your_password
export MYSQL_DATABASE=your_database

# JWT configuration
export JWT_SECRET=your_jwt_secret
export JWT_EXPIRATION=86400000

# Start with custom configuration
docker-compose up -d
```

### Custom Configuration Files
- **Application Properties**: Each service has `application-docker.properties`
- **Nginx Configuration**: `docker/nginx/nginx.conf`
- **MySQL Initialization**: `docker/mysql/init/01-init-databases.sql`

## 🐛 Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check logs
docker-compose logs

# Check if ports are available
netstat -tulpn | grep :8082
```

#### 2. Database Connection Issues
```bash
# Check MySQL container
docker logs bed-tracker-mysql

# Test database connection
docker exec -it bed-tracker-mysql mysql -u root -p
```

#### 3. Service Discovery Issues
```bash
# Check Eureka server
docker logs bed-tracker-eureka-server

# Verify service registration
curl http://localhost:8761/eureka/apps
```

#### 4. Memory Issues
```bash
# Check memory usage
docker stats

# Increase Docker memory limit in Docker Desktop settings
```

### Log Analysis
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs user-service

# Follow logs in real-time
docker-compose logs -f user-service
```

## 🔄 Development Workflow

### For Development
```bash
# Start only infrastructure (MySQL, Eureka)
docker-compose up -d mysql eureka-server

# Run services locally for development
# (Update application.properties to use docker profiles)
```

### For Production
```bash
# Use production-optimized settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📈 Scaling

### Scale Services
```bash
# Scale user service to 3 instances
docker-compose up -d --scale user-service=3

# Scale hospital service to 2 instances
docker-compose up -d --scale hospital-service=2
```

### Load Testing
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test user service
ab -n 1000 -c 10 http://localhost:8082/api/auth/validate
```

## 🛡️ Security Considerations

### Production Security
1. **Change default passwords**
2. **Use secrets management**
3. **Enable HTTPS**
4. **Configure firewall rules**
5. **Regular security updates**

### Example Production Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
```

## 📝 Maintenance

### Regular Maintenance Tasks
```bash
# Update images
docker-compose pull
docker-compose up -d

# Clean up unused resources
docker system prune -f

# Backup database
docker exec bed-tracker-mysql mysqldump -u root -p MediTrackDB > backup.sql
```

### Monitoring Setup
Consider integrating with monitoring tools:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **ELK Stack** for log aggregation

## 🆘 Support

If you encounter issues:

1. **Check the logs**: `docker-compose logs`
2. **Verify prerequisites**: Docker, Docker Compose versions
3. **Check system resources**: Memory, disk space
4. **Review configuration**: Environment variables, ports

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Microservices with Spring Cloud](https://spring.io/projects/spring-cloud)

---

**Happy Deploying! 🚀**
