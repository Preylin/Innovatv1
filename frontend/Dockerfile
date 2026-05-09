# Etapa 1: Build con Bun
FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock* /app/
RUN bun install --frozen-lockfile

COPY . /app
RUN bun run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]