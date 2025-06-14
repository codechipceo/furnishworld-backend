# 1. Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# 2. Build assets (Next.js + Payload)
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js and Payload Admin UI
ENV PAYLOAD_CONFIG_PATH=./payload.config.ts
RUN npm run build

# 3. Create lightweight final image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PAYLOAD_CONFIG_PATH=./payload.config.ts

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/payload.config.ts ./payload.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json

# If using any custom code, copy src
COPY --from=builder /app/src ./src

# Expose your app port (defaults to 3000)
EXPOSE 3000

CMD ["node", "dist/server.js"]
