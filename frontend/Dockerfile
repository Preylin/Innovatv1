# Etapa 1: Build con Bun
# CAMBIO: Usamos la imagen oficial de Bun
FROM oven/bun:latest AS builder
WORKDIR /app

# Copiar dependencias
COPY package.json bun.lock /app/
RUN bun install

# Copiar todo el código fuente
COPY . /app

# Generar build de producción
RUN bun run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Copiar build de la etapa anterior al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]