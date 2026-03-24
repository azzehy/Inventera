# Multi-stage build for Inventera Backend
# Stage 1: Build stage
FROM maven:3.9.4-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/InventoryMgtSystem-0.0.1-SNAPSHOT.jar app.jar

# Create a non-root user to run the application
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port 5050
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5050/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
