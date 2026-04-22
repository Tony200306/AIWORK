# Multi-stage build for NestJS application

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install required libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN pnpm exec prisma generate

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install required libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN pnpm exec prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Set environment to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["node", "dist/src/main"]
