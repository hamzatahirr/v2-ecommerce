# Multi-stage Docker build for Multi-Vendor E-Commerce Platform
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# =============================================================================
# DEPENDENCIES STAGE
# =============================================================================
FROM base AS deps

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# =============================================================================
# CLIENT BUILD STAGE
# =============================================================================
FROM base AS client-builder

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy client source code
COPY client/ ./client/

# Build client for production
WORKDIR /app/client
RUN npm run build

# =============================================================================
# SERVER BUILD STAGE
# =============================================================================
FROM base AS server-builder

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy server source code
COPY server/ ./server/

# Build server (if using TypeScript)
WORKDIR /app/server
RUN npm run build

# =============================================================================
# PRODUCTION STAGE
# =============================================================================
FROM base AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built client from client-builder stage
COPY --from=client-builder --chown=nextjs:nodejs /app/client/.next ./client/.next
COPY --from=client-builder --chown=nextjs:nodejs /app/client/public ./client/public
COPY --from=client-builder --chown=nextjs:nodejs /app/client/package.json ./client/package.json

# Copy built server from server-builder stage
COPY --from=server-builder --chown=nextjs:nodejs /app/server/dist ./server/dist
COPY --from=server-builder --chown=nextjs:nodejs /app/server/package.json ./server/package.json

# Install production dependencies only
COPY --from=deps /app/node_modules ./node_modules

# Switch to non-root user
USER nextjs

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/dist/server.js"]
