# Build stage — Vite production build
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Baked into the JS bundle at build time
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_GTM_ID=
# Empty = same-origin; nginx proxies /api to the server container
ARG VITE_API_BASE=
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID VITE_API_BASE=$VITE_API_BASE VITE_GTM_ID=$VITE_GTM_ID
RUN npm run build

# Runtime stage — nginx serves static files and proxies the API
FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
