# 🍓💐 StrawBouquet 💐🍓

StrawBouquet App is an elegant and user-friendly website that allows users to browse and purchase beautifully crafted strawberry bouquets. Designed to provide a unique gifting experience, the app showcases a wide variety of strawberry arrangements, each made with care and creativity. Users can explore detailed product pages, view high-quality photos, and select bouquet sizes. The platform also features a favorites list, enabling users to save their preferred bouquets for quick access. The goal of StrawBouquet App is to make gifting sweet, memorable, and visually delightful through the charm of strawberry bouquets.  

<img width="1431" alt="StrawBouquet" src="https://github.com/user-attachments/assets/55ad339a-ab8b-4f46-be38-f4afb9930d90" /> 
<img width="1418" alt="StrawBouquet" src="https://github.com/user-attachments/assets/60d2ec68-4c7e-4b67-ae97-1fc14aeefa82" /> 
<img width="1416" alt="StrawBouquet" src="https://github.com/user-attachments/assets/1b450756-b666-40fe-9fc9-2ce49c811f57" /> 


# 💻 Technologies Used   

StrawBouquet App is built using the following technologies:  

📍 React – for creating a dynamic and responsive frontend interface  
📍 Flask – two separate backend services to handle different parts of the application logic  
📍 PostgreSQL – as the primary relational database for storing bouquet data and customer orders  
📍 Redis – for caching and improving application performance  
📍 Keycloak – for OAuth2-based authentication and role-based access control   
📍 NGINX – as a reverse proxy and static content server for frontend and API gateway    
📍 Docker – for containerizing frontend and backend services  
📍 Kubernetes – for orchestrating containers, ensuring scalability and high availability  
📍 Helm Charts – for managing Kubernetes resources and simplifying deployment  
📍 Prometheus & Grafana – for monitoring application performance and system metrics  
📍 CI/CD (GitHub Actions) – for automating building, testing, and deployment pipelines  
📍 Security Hardening – both frontend and backend are protected using token validation and Keycloak integration to prevent unauthorized access, Role-Based Access Control (RBAC)  


# 🏁 Getting Started  

To get started with the StrawBouquet App, follow these steps:  

1️⃣ Clone the Repository      

Download the repository to your local machine by running the following command in your terminal:    
```bash
git clone https://github.com/hsialitskaya/StrawBouquet_App.git StrawBouquet
```  

# ⚒️ Docker Compose Setup    
1️⃣ Start the Application with Docker Compose   

Make sure Docker is installed and running. To start the application using Docker Compose, run:  
```bash  
cd StrawBouquet/docker/
docker-compose down -v && docker-compose up --build
```  

This will build and start all services defined in docker-compose.yml.  

You can then access your services at the following addresses:  
**Frontend: http://localhost:3001**  
**Backend - Product Service: http://localhost:5001**  
**Backend - Cart Service: http://localhost:5002**  
**Keycloak (Authentication): http://localhost:8080**  

# ⚒️ Kubernetes Setup    
1️⃣ Start the Application with Kubernetes  

Ensure that kubectl is configured to point to your cluster. Navigate to the kubernetes/ directory and run the deployment script:  
```bash
cd StrawBouquet/kubernetes/
./apply.sh
```  
This will deploy all services, config maps, secrets, and monitoring tools.  

You can also use a Minikube tunnel to expose LoadBalancer services automatically:  
```bash
minikube tunnel
```
⚠️ Note: minikube tunnel may prompt you for administrator (sudo) privileges to create network routes.  

2️⃣ Port Forward Services (Alternative to Tunnel)  

After the deployment is complete, open another terminal and run the following commands to forward local ports to the appropriate services:  
```bash
kubectl port-forward svc/backend-produkt 5001:5001 &
kubectl port-forward svc/backend-cart 5002:5002 &
kubectl port-forward svc/frontend 3001:80 &
kubectl port-forward svc/prometheus-operator-grafana 3002:80 -n monitoring &
kubectl port-forward svc/keycloak 8080:8080 &
kubectl port-forward svc/prometheus-operator-kube-p-prometheus 9090:9090 -n monitoring &
```  

You can then access your services at the following addresses:  
**Frontend: http://localhost:3001**  
**Backend - Product Service: http://localhost:5001**  
**Backend - Cart Service: http://localhost:5002**  
**Keycloak (Authentication): http://localhost:8080**  
**Grafana Dashboard: http://localhost:3002**  
**Prometheus Monitoring: http://localhost:9090**  


## License  
StrawBouquet is licensed under the MIT License. See [LICENSE](https://github.com/hsialitskaya/StrawBouquet/blob/main/LICENSE) for more information.      


Enjoy crafting delightful strawberry bouquets and have fun building your fruity creations! 🎉  
