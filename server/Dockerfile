# Build stage — compiles TypeScript and the better-sqlite3 native module
FROM node:24-alpine AS build
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# Runtime stage
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production DATA_DIR=/app/data
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
