# AeroLink Airline Platform - Task Tracking

## Phase 1: Foundation (Days 1-3)
- `[ ]` Initialize Git Monorepo with `/services`, `/k8s-manifests`, and `/terraform` folders
- `[ ]` Create `docker-compose.yml` for local development
- `[ ]` Set up Terraform base (Provider, DynamoDB, EventBridge)
- `[ ]` Implement Auth Service (Custom JWT) + basic tests
- `[ ]` Configure API Gateway (REST API routing)
- `[ ]` Provision S3 bucket via Terraform for the frontend
- `[ ]` Initialize React (Vite) frontend in `/frontend`
- `[ ]` Create GitHub Action workflow to sync frontend to S3

## Phase 2: Core Microservices (Days 4-7)
- `[ ]` Implement Flight Service (CRUD, Search, publish to EventBridge)
- `[ ]` Implement Booking Service (Saga Pattern: Booking -> Seat -> Payment)
- `[ ]` Implement Baggage Service
- `[ ]` Implement Notification Service (AWS Lambda triggered by EventBridge)
- `[ ]` Setup SQS queues and Dead Letter Queues (DLQ) for fault tolerance
- `[ ]` Implement WebSocket server for real-time seat/flight updates

## Phase 3: Kubernetes & GitOps Infrastructure (Days 8-10)
- `[ ]` Provision EKS Cluster via Terraform
- `[ ]` Install ArgoCD on EKS Cluster
- `[ ]` Configure ArgoCD to monitor `/k8s-manifests` folder in the repo
- `[ ]` Write Kubernetes Deployment and Service manifests for all microservices

## Phase 4: CI Pipeline & Integration (Days 11-12)
- `[ ]` Create GitHub Action to build Docker images and push to AWS ECR
- `[ ]` Update GitHub Action to commit new image tags back to `/k8s-manifests`
- `[ ]` Connect React frontend to the deployed backend EKS Ingress/ALB
- `[ ]` Complete frontend UI (Auth, Flight Search, Seat Map, Admin)

## Phase 5: Testing, Observability & Polish (Days 13-14)
- `[ ]` Instrument services with AWS X-Ray and structured JSON logging
- `[ ]` Create custom CloudWatch Dashboards
- `[ ]` Run Artillery load tests and generate performance graphs
- `[ ]` Generate OpenAPI 3.0 documentation
- `[ ]` Script and practice the "Chaos Engineering" pod-kill demo
- `[ ]` Package source code and write final report

## Phase 6: Superior Upgrade Strategy (Final Polish)
- `[x]` Multi-Region Deployment (DynamoDB Global Tables)
- `[x]` Swagger / OpenAPI Docs in auth-service
- `[x]` Circuit Breaker (Opossum) in booking-service
- `[x]` Artillery Performance Load Testing Report
- `[x]` Premium UI: Interactive 2D Seat Map & Dynamic Pricing
- `[x]` Premium UI: Baggage Tracking Timeline
- `[x]` Premium UI: Real User/Admin Auth Flow
- `[x]` Premium UI: Advanced Admin Dashboard
