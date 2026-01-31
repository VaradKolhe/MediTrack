# ==========================================
# Stage 1: The Builder (Heavyweight)
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy source code into the builder
COPY . .

# Build all services (We can run these in one layer to save lines, or separate for clarity)
# Since we are discarding this layer later, one big command is fine and faster.
RUN mvn clean package -DskipTests -f EurekaServer/pom.xml && \
    mvn clean package -DskipTests -f adminservice/pom.xml && \
    mvn clean package -DskipTests -f userservice/pom.xml && \
    mvn clean package -DskipTests -f hospitalservice/pom.xml

# ==========================================
# Stage 2: The Runtime (Lightweight)
# ==========================================
FROM eclipse-temurin:21-jre-alpine

# Install Supervisor and Bash (Required for your supervisord.conf)
RUN apk add --no-cache supervisor bash nginx

WORKDIR /app

# 1. Create Log Directory
RUN mkdir -p /var/log/supervisor
RUN mkdir -p /run/nginx

# 2. Copy the compiled JARs from the Builder Stage
# We rename them to simple names (e.g., eureka.jar) to make the supervisor config easier
COPY --from=builder /build/EurekaServer/target/*.jar /app/eureka.jar
COPY --from=builder /build/adminservice/target/*.jar /app/admin.jar
COPY --from=builder /build/userservice/target/*.jar /app/user.jar
COPY --from=builder /build/hospitalservice/target/*.jar /app/hospital.jar

# 3. Copy Supervisor Config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/http.d/default.conf

# 4. Expose Ports
EXPOSE 80

# 5. Start Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]