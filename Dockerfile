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

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port (matches main.ts default: 5001)
EXPOSE 5001

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]