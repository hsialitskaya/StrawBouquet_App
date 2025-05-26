#!/bin/bash

# Wdrożenia
# Metrics Server
kubectl apply -f  metrics_server/

# Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl get namespace monitoring || kubectl create namespace monitoring
helm install prometheus-operator prometheus-community/kube-prometheus-stack -n monitoring
kubectl apply -f backend/service-monitor.yaml

# Serwisy 
kubectl apply -f backend/
kubectl apply -f frontend/
kubectl apply -f grafana/
kubectl apply -f keycloak/
kubectl apply -f postgres/
kubectl apply -f prometheus/
kubectl apply -f redis/

echo "Czekam na gotowość podów..."

# Czekaj na gotowość podów backend i frontend
sleep 30
echo "Wszystkie deploymenty gotowe, uruchamiam port-forward..."

# Uruchom port-forward w tle 
kubectl port-forward svc/backend 5001:5001 &
kubectl port-forward svc/frontend 3001:3001 &
kubectl port-forward svc/prometheus-operator-grafana 3002:80 -n monitoring &
kubectl port-forward svc/keycloak 8080:8080 &
kubectl port-forward svc/postgres 5432:5432 &
kubectl port-forward svc/prometheus-operator-kube-p-prometheus 9090:9090 -n monitoring &
kubectl port-forward svc/redis 6379:6379 &

echo "Port-forwardy uruchomione"
wait
    


# Poprawność działania 

#Grafana
# prom-operator

# Metrics Server
# kubectl get deployment metrics-server -n kube-system

# HPA
# kubectl get hpa


# Helm
# helm install myapp ./mychart (LUB POKAZAC ZRZUT)
# helm list
# helm status myapp