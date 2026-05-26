# AeroLink Airline Platform — Final Implementation Plan (GitOps Edition)

This document serves as the finalized blueprint for the AeroLink Airline Systems assignment. It incorporates the advanced architectural requirements including **EKS**, **ArgoCD for GitOps**, and an **S3-hosted static frontend**. This represents a highly sophisticated, enterprise-grade architecture that strongly targets distinction marks.

## User Review Required
> [!IMPORTANT]
> **EKS Cost & ArgoCD Overhead Warning**: EKS charges ~$73/month for the control plane. Running ArgoCD inside EKS requires additional worker node capacity. You MUST strictly adhere to the "Demo Window Strategy" (running `terraform destroy` when not actively working) to avoid draining your AWS credits.

> [!CAUTION]
> **Account Type**: This plan assumes you are using a **Personal AWS Account** with promotional credits. If you are using an AWS Academy Learner Lab, EKS creation may fail due to IAM restrictions.

## Finalized Academic Approach
- **Domain Name**: We will use the default **AWS S3 Website Endpoint** for the frontend and the **ALB (Application Load Balancer) DNS name** for the backend API. This avoids domain registration costs and is perfectly standard for academic submissions.
- **Git Repository Structure**: We will use a **Monorepo** approach. The repository will have a `/services` folder for the application code (which GitHub Actions builds) and a `/k8s-manifests` folder (which ArgoCD monitors). This makes submission easier (you only have to submit one repository link or ZIP file).

## Proposed Architecture (GitOps & S3)

### Core Technologies
- **Frontend**: React (Vite) deployed as a static website to an **AWS S3 Bucket**.
- **Backend Services**: Node.js / Express.js deployed as individual Pods on EKS.
- **Database**: DynamoDB (Global Tables for multi-region).
- **Event Bus**: AWS EventBridge + SQS + SNS.
- **Serverless**: AWS Lambda (Notification Service).
- **Infrastructure as Code**: Terraform (provisions EKS, S3, Lambda, DynamoDB, EventBridge).

### Advanced CI/CD Pipeline (GitOps Pattern)
1. **Continuous Integration (CI) - GitHub Actions**: 
   - Developer pushes code to the `main` branch.
   - GitHub Actions runs tests.
   - Builds Docker image and pushes it to AWS ECR.
   - Updates the Kubernetes deployment manifest file with the new image tag.
2. **Continuous Deployment (CD) - ArgoCD**:
   - ArgoCD runs inside the EKS cluster.
   - It continuously monitors the Git repository for changes to the Kubernetes manifests.
   - When it detects a change, it automatically syncs and pulls the new Docker image onto the EKS cluster pods (e.g., `flight-service`, `booking-service`).

## 14-Day Implementation Schedule

### Phase 1: Foundation (Days 1-3)
- **Day 1**: Project structure, Docker Compose (local), Terraform base (DynamoDB, EventBridge).
- **Day 2**: Auth Service (Custom JWT) and API Gateway configuration.
- **Day 3**: **Terraform S3 & Frontend CI**: Provision S3 bucket via Terraform, build React (Vite) skeleton, and create GitHub Action to sync frontend build to S3.

### Phase 2: Core Microservices (Days 4-7)
- **Day 4**: Flight Service (CRUD, Search, EventBridge integration).
- **Day 5**: Booking Service (Saga Pattern for distributed transactions).
- **Day 6**: Baggage Service & Lambda Notification Service.
- **Day 7**: Event-Driven Sync (SQS queues, real-time WebSocket setup).

### Phase 3: Kubernetes & GitOps Infrastructure (Days 8-10)
- **Day 8**: **Terraform EKS**: Provision EKS cluster and Node Groups. *(CRITICAL: Implement Demo Window Strategy from here on).*
- **Day 9**: **ArgoCD Installation**: Install ArgoCD onto the EKS cluster via Helm/Terraform. Configure ArgoCD to watch the GitHub repository.
- **Day 10**: Write Kubernetes Manifests (`Deployment`, `Service`, `Ingress`) for Auth, Flight, Booking, and Baggage services. Verify ArgoCD syncs them to EKS pods.

### Phase 4: CI Pipeline & Integration (Days 11-12)
- **Day 11**: **GitHub Actions Backend CI**: Create CI pipeline to test, build Docker images, push to ECR, and commit the new image tags back to the Git repository for ArgoCD to catch.
- **Day 12**: Complete Frontend UI (connect React app on S3 to the backend API Gateway/EKS Ingress).

### Phase 5: Testing, Observability & Polish (Days 13-14)
- **Day 13**: Automated Unit Tests (Jest), Artillery Load Testing, CloudWatch Dashboards, and X-Ray Tracing.
- **Day 14**: OpenAPI (Swagger) Docs, Finalize Report, script the **Chaos Engineering Demo**, record/practice 15-minute presentation.

## Verification Plan

### Automated Tests
- Run unit test suites for all microservices (`npm test`) targeting >70% coverage.
- GitHub Actions pipeline turns green on every push.

### GitOps Verification
- Push a code change to `flight-service`.
- Watch GitHub Actions push to ECR and update the manifest.
- Watch ArgoCD automatically detect the change and perform a rolling update on the `flight-service` pods in EKS.

### Manual Verification
- Deploy full infrastructure using `terraform apply`.
- **Chaos Test**: Manually kill a pod via `kubectl delete pod` during the demo. Show that ArgoCD/Kubernetes immediately spins up a replacement to maintain the desired state.
- Tear down completely using `terraform destroy` to preserve budget.
