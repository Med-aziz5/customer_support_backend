# Use Node 22
FROM node:22

# Install dependencies for Liquibase + bash
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk curl bash && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json & install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all source code
COPY . .

# Copy wait-for-it and make executable
COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

# Create a non-root user
RUN useradd -m appuser
USER appuser

# Start backend (wait for Postgres first)
CMD ["/app/wait-for-it.sh", "db:5432", "--", "npm", "run", "start-local"]
