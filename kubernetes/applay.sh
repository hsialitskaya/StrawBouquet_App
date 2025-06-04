#!/bin/bash

# minikube start

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



# Port-forward w tle 
# kubectl port-forward svc/backend-produkt 5001:5001 &
# kubectl port-forward svc/backend-cart 5002:5002 &
# kubectl port-forward svc/frontend 3001:80 &
# kubectl port-forward svc/prometheus-operator-grafana 3002:80 -n monitoring &
# kubectl port-forward svc/keycloak 8080:8080 &
# kubectl port-forward svc/prometheus-operator-kube-p-prometheus 9090:9090 -n monitoring &



# Poprawność działania 

# Minikube
# minikube status
# kubectl get pods
# kubectl get svc
# minikube tunnel

# Grafana
# prom-operator

# Metrics Server
# kubectl get deployment metrics-server -n kube-system

# HPA
# kubectl get hpa


# Helm
# helm install myapp ./mychart
# helm list
# helm status myapp