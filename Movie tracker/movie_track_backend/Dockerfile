# Use lightweight Java 17 image
FROM eclipse-temurin:17-jdk-jammy

# Set working directory
WORKDIR /app

# Copy jar file from target folder
COPY target/watchlist-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java","-jar","app.jar"]