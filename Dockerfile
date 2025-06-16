# Stage 1: Build the application
# Use a Node.js image suitable for building Next.js applications
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
# and install dependencies. This layer is cached if dependencies don't change.
# Use --omit=dev to not install devDependencies in production build, which saves space.
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy the rest of your application code
COPY . .

# Set Payload configuration path (crucial for Payload to find its config)
# Ensure your payload.config.ts is at the root or adjust this path
# COMMON PATHS: ./payload.config.ts or ./src/payload.config.ts
ENV PAYLOAD_CONFIG_PATH=./src/payload.config.ts
# <<< ADJUST THIS PATH IF NEEDED

# Set the environment variable for skipping sitemap DB fetch during build, if you use the conditional logic
# If you completely removed sitemaps, you don't strictly need this, but it's good practice
ENV SKIP_SITEMAP_BUILD_DB_FETCH=true

# Build Next.js and Payload Admin UI
# The `output: 'standalone'` in next.config.js is critical for this stage
# It creates a .next/standalone folder with everything needed.
RUN npm run build

# Stage 2: Run the application
# Use a lightweight Node.js image for production
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy the standalone output from the builder stage
# This directory contains your built Next.js app and copied node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
 # Copy public assets

# Set the Payload config path again for runtime (important for Payload initialization)
# Must match the build stage's path
ENV PAYLOAD_CONFIG_PATH=./src/payload.config.ts
 # <<< MUST MATCH PATH ABOVE

# Define the port your application will listen on
# Next.js defaults to 3000, Payload also runs on this if self-hosted
ENV PORT 3000

# Set environment variables for production database and secret
# These must be passed at runtime (e.g., via Coolify's ENV vars)
# DO NOT hardcode sensitive values here.
# ENV DATABASE_URI="mongodb://user:pass@host:port/database"
# ENV PAYLOAD_SECRET="your_strong_secret_key_here"
# ENV NEXT_PUBLIC_SERVER_URL="https://your-domain.com"
# ENV S3_ACCESS_KEY_ID="your_s3_key"
# ENV S3_SECRET_ACCESS_KEY="your_s3_secret"
# ... other runtime environment variables

# Expose the port
EXPOSE ${PORT}

# Command to run the application
# 'node server.js' is the standard way to run a Next.js production server when using output: 'standalone'.
CMD ["node", "server.js"]