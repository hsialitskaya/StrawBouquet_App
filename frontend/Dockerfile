# Etap budowania
FROM node:18 AS builder

WORKDIR /app

# Kopiowanie tylko plików package.json i package-lock.json
COPY package*.json ./

# Instalacja zależności (w tym zależności deweloperskich)
RUN npm install

# Kopiowanie reszty kodu i budowanie aplikacji
COPY . .

# Etap deweloperski
FROM node:18-alpine

# Argument budowania z domyślną wartością
ARG NODE_ENV=development
ARG APP_PORT=3001
# Ustawienie zmiennej środowiskowej
ENV PORT=${APP_PORT}

WORKDIR /app

# Ustawienie zmiennej środowiskowej na development
ENV NODE_ENV=${NODE_ENV}

# Instalacja serwera do serwowania statycznych plików
RUN npm install -g serve

# Kopiowanie package.json i node_modules z etapu budowania
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules

# Zainstaluj curl 
RUN apk add --no-cache curl

# Kopiowanie aplikacji (po zainstalowaniu zależności, aby uniknąć ponownej instalacji przy każdym wdrożeniu kodu)
COPY . .

# Serwowanie plików na porcie 3001
EXPOSE ${PORT}

# Uruchamianie aplikacji w trybie deweloperskim (z hot-reloading)
CMD ["npm", "start"]
