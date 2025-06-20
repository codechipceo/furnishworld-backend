# Stage 1: Build the Payload CMS application
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# to leverage Docker caching for dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install --force

# Copy the rest of your application code, including the 'src' directory
# This will ensure payload.config.ts (if in src/) is available at /app/src/payload.config.ts
COPY . .

# Build the Payload CMS project for production
RUN npm run build

# Stage 2: Create a lightweight production image
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# Copy only necessary files for production from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
# Copy the 'src' directory from the build stage.
# This should now correctly include payload.config.ts at /app/src/payload.config.ts
COPY --from=build /app/src ./src

# If you have specific static assets or uploads dir needed at runtime, copy them
# For example, if you manage uploads locally and not via S3:
# COPY --from=build /app/uploads ./uploads

# Install only production dependencies
RUN npm install --omit=dev --force

# Expose the port your Payload CMS runs on (default is 3000)
EXPOSE 3000

# Command to start the production server
CMD ["npm", "run", "start"]

# Healthcheck (optional but recommended)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://localhost:3000/api/health || exit 1
