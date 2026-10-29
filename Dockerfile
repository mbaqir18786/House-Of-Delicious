FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy package and server files
COPY package.json ./
COPY src/ ./src/
COPY public/ ./public/
COPY scripts/ ./scripts/
COPY config/ ./config/
COPY server.js ./

# Run non-root user for security
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node scripts/healthcheck.js || exit 1

CMD ["node", "src/server.js"]
