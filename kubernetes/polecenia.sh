kubectl apply -f backend/       
kubectl apply -f frontend/       
kubectl apply -f grafana/       
kubectl apply -f keycloak/       
kubectl apply -f postgres/       
kubectl apply -f prometheus/       
kubectl apply -f redis/       

kubectl port-forward svc/backend 5001:5001
kubectl port-forward svc/frontend 3001:3001
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
kubectl port-forward svc/keycloak 8080:8080
kubectl port-forward svc/postgres 5432:5432
kubectl port-forward svc/monitoring-kube-prometheus-prometheus 9090:9090 -n monitoring
kubectl port-forward svc/prometheus 6379:6379

