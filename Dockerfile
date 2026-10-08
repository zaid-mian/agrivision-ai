# syntax=docker/dockerfile:1
# -------------------------------------------------------------
# AgriVision AI - Multi-Stage Production Dockerfile
# -------------------------------------------------------------

FROM node:24-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# Install Sharp & native runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Stage 1: Dependencies
FROM base AS dependencies
WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm ci --include=dev

# Stage 2: Build frontend & server bundles
FROM dependencies AS builder
WORKDIR /app
COPY app/ ./
COPY ml/ ../ml/
RUN npm run build

# Stage 3: Production Runner
FROM base AS runner
WORKDIR /app/app

# Copy built artifacts and model files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/farming_faq.json ./farming_faq.json
COPY --from=builder /app/farm_database.json ./farm_database.json
COPY --from=builder /app/uploads ./uploads
COPY ml /app/ml

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "dist/server.cjs"]
