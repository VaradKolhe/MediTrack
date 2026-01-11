# ==========================================
# 1. OS & Dependencies Layer
# ==========================================
FROM ubuntu:24.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Step 1: Fix Network Mirrors & Update
# We swap to the US mirror to prevent "403 Forbidden" errors
RUN apt-get update

# Step 2: Install Basic Tools (Curl, GPG)
RUN apt-get install -y  curl gnupg

# Step 3: Install Java 21 (The heavy download)
RUN apt-get install -y  openjdk-21-jdk

# Step 4: Install Maven
RUN apt-get install -y  maven

# Step 5: Install MySQL Server
RUN apt-get install -y  mysql-server

# Step 6: Install Supervisor
RUN apt-get install -y  supervisor

# Step 7: Clean up (Optional, but good practice)
RUN rm -rf /var/lib/apt/lists/*

# Step 8: Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Step 9: Create Supervisor log directory
RUN mkdir -p /var/log/supervisor

# ==========================================
# --- Configure MySQL User ---
# ==========================================

# 1. Fix permissions so MySQL can write to its folders
RUN usermod -d /var/lib/mysql/ mysql

# 2. The "Safe Mode" Fix
# We start MySQL with '--skip-grant-tables' so it asks for NO password.
# Then we FLUSH privileges (to load the user table), change the password, and create the DB.
# Finally, we shut it down cleanly with the new password.
RUN mysqld_safe --skip-grant-tables & \
    sleep 10 && \
    mysql -u root -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root'; CREATE DATABASE IF NOT EXISTS MediTrackDB;" && \
    mysqladmin -u root -proot shutdown

# ==========================================
# 2. Build Phase - Backend
# ==========================================

# Set the starting folder to /app
WORKDIR /app

# Copy the entire Backend folder first
COPY Backend ./Backend

WORKDIR /app/Backend/EurekaServer
RUN mvn clean package -DskipTests

WORKDIR /app/Backend/adminservice
RUN mvn clean package -DskipTests

WORKDIR /app/Backend/hospitalservice
RUN mvn clean package -DskipTests

WORKDIR /app/Backend/userservice
RUN mvn clean package -DskipTests

# ==========================================
# 3. Build Phase - Frontend
# ==========================================

WORKDIR /app

# Copy the entire Frontend folder
COPY Frontend ./Frontend

# Build the React Application
WORKDIR /app/Frontend/meditrack-frontend
RUN npm install
RUN npm run build

# ==========================================
# 4. Final Configuration
# ==========================================
WORKDIR /app

# Copy your local supervisord.conf to the configuration folder
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose all the ports you need
# 3306 (DB), 8761 (Eureka), 8081, 8082, 8083 (Services), 5173 (Frontend)
EXPOSE 3306 
EXPOSE 8761
EXPOSE 8081
EXPOSE 8082
EXPOSE 8083
EXPOSE 5173

# Start Supervisor (which starts everything else)
CMD ["/usr/bin/supervisord"]