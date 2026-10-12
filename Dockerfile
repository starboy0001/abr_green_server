# ============================================================
# Production Dockerfile for ABR Greens TypeScript Backend
# ============================================================

FROM node:20-slim

WORKDIR /app

# Install native dependencies required for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code and assets
COPY tsconfig.json ./
COPY src/ ./src/
COPY storage/ ./storage/
COPY schema.sql ./

# Expose backend REST API port
EXPOSE 8000

# Set environment defaults
ENV PORT=8000
ENV NODE_ENV=production

# Health check endpoint
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start server directly with TypeScript execution (tsx)
CMD ["npm", "start"]
