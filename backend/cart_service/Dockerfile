# Etap 1: Builder — tylko to, co potrzebne do instalacji zależności
FROM python:3.10-alpine AS builder

WORKDIR /install

# Skopiuj zależności
COPY requirements.txt .

# Zainstaluj zależności do osobnego folderu
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# Etap 2: Finalny, minimalny obraz
FROM python:3.10-alpine

# Wymagana struktura katalogów
RUN mkdir -p /app/cart_service
WORKDIR /app/cart_service

RUN apk add --no-cache curl 

# Skopiuj zainstalowane pakiety z buildera
COPY --from=builder /install /usr/local

# Skopiuj kod aplikacji
COPY . .

# Usuń cache pip i pycache, żeby zmniejszyć obraz
RUN rm -rf /root/.cache && \
    find /usr/local -name '__pycache__' -type d -exec rm -rf {} + && \
    find /usr/local -name '*.pyc' -exec rm -f {} + && \
    find /usr/local -name 'tests' -type d -exec rm -rf {} + && \
    find /usr/local -name '*.egg-info' -type d -exec rm -rf {} + && \
    pip uninstall -y pip setuptools wheel || true

# Zmienna środowiskowa i port
ARG APP_PORT=5002
ENV APP_PORT=${APP_PORT}
EXPOSE ${APP_PORT}

CMD ["python3", "app.py"]