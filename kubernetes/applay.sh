#!/bin/bash

# Wdrożenia
# Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

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

# Czekaj na gotowość podów backend i frontend (przykład)
kubectl wait --for=condition=available deployment/backend --timeout=120s
kubectl wait --for=condition=available deployment/frontend --timeout=120s
kubectl wait --for=condition=available deployment/grafana -n monitoring --timeout=120s
kubectl wait --for=condition=available deployment/keycloak --timeout=120s
kubectl wait --for=condition=available deployment/postgres --timeout=120s
kubectl wait --for=condition=available deployment/prometheus -n monitoring --timeout=120s
kubectl wait --for=condition=available deployment/redis --timeout=120s

echo "Wszystkie deploymenty gotowe, uruchamiam port-forward..."

# Uruchom port-forward w tle (lub otwórz nowe terminale)
kubectl port-forward svc/backend 5001:5001 &
kubectl port-forward svc/frontend 3001:3001 &
kubectl port-forward svc/grafana 3000:80 -n monitoring &
kubectl port-forward svc/keycloak 8080:8080 &
kubectl port-forward svc/postgres 5432:5432 &
kubectl port-forward svc/prometheus 9090:9090 -n monitoring &
kubectl port-forward svc/redis 6379:6379 &

echo "Port-forwardy uruchomione"
wait
    


# Poprawność działania 
# Metrics Server
# export KUBE_EDITOR="nano"
#   args:
        # - --cert-dir=/tmp
        # - --secure-port=4443
        # - --kubelet-preferred-address-types=InternalIP,Hostname,InternalDNS,ExternalDNS,ExternalIP
        # - --kubelet-insecure-tls   
# kubectl get deployment metrics-server -n kube-system

# HPA
# kubectl get hpa
