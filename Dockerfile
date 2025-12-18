# -----------------------------------------------------------------------------
# Production Dockerfile
# Strategy: "Baked-in Content"
# 
# This image includes the application code AND the content snapshot at build time.
# The content is immutable for the lifecycle of this container.
# -----------------------------------------------------------------------------

# --- Stage 1: Dependencies ---
FROM node:22-alpine AS deps
WORKDIR /app
# Install libc for potential native deps compatibility
RUN apk add --no-cache libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
# Install dependencies (frozen-lockfile for consistency)
RUN pnpm install --frozen-lockfile

# --- Stage 2: Builder ---
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy the content directory to bake it into the build context
# This ensures it's available for static generation or runtime reading
COPY content ./content

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN pnpm build

# --- Stage 3: Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user (security best practice)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
# Copy public assets
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# IMPORTANT: Explicitly copy the 'content' directory
# Since we read it from the filesystem at runtime, it must be present.
COPY --from=builder --chown=nextjs:nodejs /app/content ./content

USER nextjs

EXPOSE 3000

ENV PORT=3000
# 'server.js' is created by next build in standalone mode
CMD ["node", "server.js"]
