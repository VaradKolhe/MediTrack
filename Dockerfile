# ==========================================
# STAGE 1: Build Backend (Maven Cache & Source are discarded here)
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /build

# Optimization: Download dependencies first (cached layer)
COPY Backend/EurekaServer/pom.xml ./EurekaServer/
COPY Backend/adminservice/pom.xml ./adminservice/
COPY Backend/hospitalservice/pom.xml ./hospitalservice/
COPY Backend/userservice/pom.xml ./userservice/=

# Copy source and build
COPY Backend ./Backend
WORKDIR /build/Backend/EurekaServer
RUN mvn clean package -DskipTests
WORKDIR /build/Backend/adminservice
RUN mvn clean package -DskipTests
WORKDIR /build/Backend/hospitalservice
RUN mvn clean package -DskipTests
WORKDIR /build/Backend/userservice
RUN mvn clean package -DskipTests

# ==========================================
# STAGE 2: Build Frontend 
# ==========================================
FROM node:18 AS frontend-builder
WORKDIR /app
COPY Frontend/meditrack-frontend/package*.json ./
RUN npm ci 
COPY Frontend/meditrack-frontend ./
RUN npm run build

# ==========================================
# STAGE 3: Final Runtime Layer
# ==========================================
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Install Java, MySQL, Supervisor AND Node.js
RUN apt-get update && apt-get install -y \
    openjdk-21-jre-headless \
    mysql-server \
    supervisor \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Setup MySQL
RUN usermod -d /var/lib/mysql/ mysql
RUN mysqld_safe --skip-grant-tables & \
    sleep 10 && \
    mysql -u root -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root'; CREATE DATABASE IF NOT EXISTS MediTrackDB;" && \
    mysqladmin -u root -proot shutdown

# Copy Backend Artifacts
WORKDIR /app/backend
COPY --from=backend-builder /build/Backend/EurekaServer/target/*.jar ./eureka.jar
COPY --from=backend-builder /build/Backend/adminservice/target/*.jar ./admin.jar
COPY --from=backend-builder /build/Backend/hospitalservice/target/*.jar ./hospital.jar
COPY --from=backend-builder /build/Backend/userservice/target/*.jar ./user.jar

# Copy Frontend Artifacts (Including node_modules for 'preview' mode)
WORKDIR /app/frontend
COPY --from=frontend-builder /app/package*.json ./
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/dist ./dist

# Copy Supervisor Config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 3306 8761 8081 8082 8083 5173

CMD ["/usr/bin/supervisord"]