FROM node:18-alpine AS base
WORKDIR /app

# =============================================================================
# DEPENDENCIES STAGE
# =============================================================================
FROM base AS deps
# Copy all package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install root deps (if any)
RUN npm install || true

# Install client deps
WORKDIR /app/client
RUN npm install

# Install server deps
WORKDIR /app/server
RUN npm install

# =============================================================================
# CLIENT BUILD STAGE
# =============================================================================
FROM base AS client-builder
WORKDIR /app

COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install

WORKDIR /app/client
COPY client/ ./
RUN npm run build

# =============================================================================
# SERVER BUILD STAGE
# =============================================================================
FROM base AS server-builder
WORKDIR /app

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

COPY server/ ./
RUN npm run build

# =============================================================================
# PRODUCTION STAGE
# =============================================================================
FROM node:18-alpine AS production
RUN apk add --no-cache dumb-init curl

RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001

WORKDIR /app

# Copy built client
COPY --from=client-builder --chown=appuser:nodejs /app/client/.next ./client/.next
COPY --from=client-builder --chown=appuser:nodejs /app/client/public ./client/public
COPY --from=client-builder --chown=appuser:nodejs /app/client/package.json ./client/package.json
COPY --from=client-builder --chown=appuser:nodejs /app/client/node_modules ./client/node_modules

# Copy built server
COPY --from=server-builder --chown=appuser:nodejs /app/server/dist ./server/dist
COPY --from=server-builder --chown=appuser:nodejs /app/server/package.json ./server/package.json
COPY --from=server-builder --chown=appuser:nodejs /app/server/node_modules ./server/node_modules

USER appuser

EXPOSE 3000 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/server.js"]
