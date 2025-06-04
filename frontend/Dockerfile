# Etap 1: Budowanie aplikacji React
FROM node:18-alpine AS builder

WORKDIR /app

# Kopiuj pliki zależności
COPY package*.json ./

# Instalacja zależności
RUN npm install --production=false

# Kopiuj resztę kodu
COPY . .

# Buduj aplikację 
RUN npm run build && rm -rf build/static/js/*.map build/static/css/*.map


# Etap 2: Serwowanie przez NGINX
FROM nginx:alpine

# Argument portu 
ARG APP_PORT=80
ENV PORT=${APP_PORT}

# Skopiuj niestandardową konfigurację nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Skopiuj zbudowaną aplikację do katalogu publicznego NGINX
COPY --from=builder /app/build /usr/share/nginx/html

# Wystaw port 
EXPOSE ${PORT}

# NGINX uruchamia się automatycznie przez ENTRYPOINT
