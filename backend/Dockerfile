# Etap budowania
FROM python:3.10-alpine AS builder

WORKDIR /app

# Skopiowanie pliku requirements.txt
COPY requirements.txt .

# Instalacja zależności
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Etap uruchamiania
FROM python:3.10-alpine

# Argument budowania z domyślną wartością
ARG APP_PORT=5001
# Ustawienie zmiennej środowiskowej
ENV APP_PORT=${APP_PORT}

WORKDIR /app

# Kopiujemy tylko zainstalowane zależności z etapu budowania
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages

# Zainstaluj curl 
RUN apk add --no-cache curl

# Kopiujemy kod aplikacji
COPY . .

# Eksponowanie portu
EXPOSE ${APP_PORT}

# Uruchamiamy aplikację
CMD ["python3", "app.py"]
