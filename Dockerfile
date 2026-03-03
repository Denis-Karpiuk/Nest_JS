# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (devDependencies needed for migration:run with ts-node)
RUN yarn install --frozen-lockfile

# Copy built application and source (migrations need src + tsconfig for ts-node)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.migrations.json ./tsconfig.migrations.json

# Copy entrypoint and make executable
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose the port (matches main.ts default: 5001)
EXPOSE 5002

# Set NODE_ENV to production
ENV NODE_ENV=production

# Run migrations then start the app
ENTRYPOINT ["/app/docker-entrypoint.sh"]