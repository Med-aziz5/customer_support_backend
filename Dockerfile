# Use official Node.js 22 base image
FROM node:22

# Install Java (required for Liquibase)
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk curl bash && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Create a non-root user for better security
RUN useradd -m appuser
USER appuser

# Expose backend port
EXPOSE 3000

# Default command (can be overridden by docker-compose)
CMD ["npm", "run", "start-local"]
