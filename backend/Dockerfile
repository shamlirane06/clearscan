# ==============================================================================
# Stage 1: Build stage
# ==============================================================================
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Copy Maven wrapper configuration and dependencies descriptor for layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Normalize line endings in case committed on Windows and set execute permissions
RUN sed -i 's/\r$//' ./mvnw && chmod +x ./mvnw

# Pre-fetch dependencies to speed up subsequent rebuilds
RUN ./mvnw dependency:go-offline -B || true

# Copy source files
COPY src/ src/

# Build executable Spring Boot fat JAR, skipping tests during image assembly
RUN ./mvnw clean package -DskipTests -B

# ==============================================================================
# Stage 2: Runtime stage
# ==============================================================================
FROM eclipse-temurin:17-jre-jammy AS runner

WORKDIR /app

# Create a dedicated non-root service user for production security
RUN groupadd -r clearscan && useradd -r -g clearscan -m -s /sbin/nologin clearscan

# Copy only the compiled Spring Boot executable JAR from the builder stage
COPY --from=builder --chown=clearscan:clearscan /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Switch to non-root user
USER clearscan:clearscan

# Default port expected by Render; can be overridden dynamically at runtime by $PORT
ENV PORT=8080

# Document exposed container port
EXPOSE 8080

# Configure Spring Boot to bind to 0.0.0.0 and listen on Render's assigned $PORT
ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar app.jar --server.port=${PORT:-8080} --server.address=0.0.0.0"]
