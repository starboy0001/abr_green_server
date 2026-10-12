
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*


COPY package*.json ./


RUN npm install


COPY tsconfig.json ./
COPY src/ ./src/
COPY storage/ ./storage/
COPY schema.sql ./


# Build TypeScript into dist
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
