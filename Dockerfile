# ==========================================
# 1. OS & Dependencies Layer
# ==========================================

# Start with a clean Ubuntu System
FROM ubuntu:22.04

# Prevent "What is your Timezone?" prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# 1. Update Ubuntu and install 'curl' (needed to download Node)
RUN apt-get update && apt-get install -y curl gnupg

# 2. Install Java 21, Maven, and MySQL Server
RUN apt-get install -y \
    openjdk-21-jdk \
    maven \
    mysql-server \
    supervisor

# 3. Install Node.js 20
# (We add the NodeSource repository first because Ubuntu's default Node is very old)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 4. Clean up unnecessary download files to keep the image smaller
RUN apt-get clean && rm -rf /var/lib/apt/lists/*


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