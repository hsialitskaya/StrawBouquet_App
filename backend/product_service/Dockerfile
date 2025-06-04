# Etap 1: Builder — instalujemy zależności w osobnym etapie
FROM python:3.10-alpine AS builder

WORKDIR /app

# Skopiuj plik z zależnościami
COPY requirements.txt .

# Instalacja do katalogu tymczasowego
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# Etap 2: Finalny obraz — malutki, bez kompilatorów
FROM python:3.10-alpine

# Struktura katalogów zgodnie z wymaganiami
RUN mkdir -p /app/product_service
WORKDIR /app/product_service

# Potrzebne runtime libs, minimalne
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

# Port i uruchomienie
ARG APP_PORT=5001
ENV APP_PORT=${APP_PORT}
EXPOSE ${APP_PORT}

CMD ["python3", "app.py"]