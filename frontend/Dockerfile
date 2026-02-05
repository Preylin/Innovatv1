# Etapa 1: Build con Bun
FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock /app/
RUN bun install --frozen-lockfile

COPY . /app
# Asegúrate de que tus variables de entorno (VITE_API_URL, etc.) 
# estén disponibles durante el build si las usas
RUN bun run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Copiar configuración personalizada de Nginx si la tienes (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]