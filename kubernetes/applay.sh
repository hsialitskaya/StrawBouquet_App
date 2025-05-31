#!/bin/bash

# Wdrożenia
# Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl get namespace monitoring || kubectl create namespace monitoring
helm install prometheus-operator prometheus-community/kube-prometheus-stack -n monitoring
kubectl apply -f service-monitor/

# Serwisy 
kubectl apply -f backend_produkt/
kubectl apply -f backend_cart/
kubectl apply -f frontend/
kubectl apply -f grafana/
kubectl apply -f keycloak/
kubectl apply -f postgres/
kubectl apply -f prometheus/
kubectl apply -f redis/

# echo "Czekam na gotowość podów..."

# Czekaj na gotowość podów backend i frontend
# sleep 30
# echo "Wszystkie deploymenty gotowe, uruchamiam port-forward..."

# Uruchom port-forward w tle 
# kubectl port-forward svc/backend-produkt 5001:5001 &
# kubectl port-forward svc/backend-cart 5002:5002 &
# kubectl port-forward svc/frontend 3001:80 &
# kubectl port-forward svc/prometheus-operator-grafana 3002:80 -n monitoring &
# kubectl port-forward svc/keycloak 8080:8080 &
# kubectl port-forward svc/prometheus-operator-kube-p-prometheus 9090:9090 -n monitoring &


# kubectl port-forward svc/postgres 5432:5432 &
# kubectl port-forward svc/redis 6379:6379 &


# echo "Port-forwardy uruchomione"
# wait
    


# Poprawność działania 

# Ingress - Nginx
# kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml
# kubectl get ingress
# kubectl get pods -n ingress-nginx


# Grafana
# prom-operator

# Metrics Server
# kubectl get deployment metrics-server -n kube-system

# HPA
# kubectl get hpa


# Helm
# helm install myapp ./mychart (LUB POKAZAC ZRZUT)
# helm list
# helm status myapp