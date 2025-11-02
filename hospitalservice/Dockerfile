# Multi-stage build for Hospital Service
FROM openjdk:21-jdk-slim AS build

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY hospitalservice/mvnw hospitalservice/mvnw.cmd hospitalservice/.mvn .mvn
COPY hospitalservice/pom.xml hospitalservice/mvnw hospitalservice/mvnw.cmd ./

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY hospitalservice/src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM openjdk:21-jre-slim

# Set working directory
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/hospitalservice-*.jar app.jar

# Expose port
EXPOSE 8081

# Set JVM options for container
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8081/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
