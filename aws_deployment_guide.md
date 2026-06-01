# AeroLink — AWS Deployment Guide

> [!CAUTION]
> **Cost Warning**: Running an EKS cluster on AWS costs approximately **~$2.40/day ($73/month)** for the control plane alone, plus EC2 node costs. **Deploy only when you need screenshots/demo, then tear down immediately.**

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

| Tool | Purpose | Install Command |
|---|---|---|
| AWS CLI v2 | Interact with AWS | [Download here](https://aws.amazon.com/cli/) |
| Terraform | Infrastructure as Code | `choco install terraform` or [Download](https://www.terraform.io/downloads) |
| kubectl | Manage Kubernetes | `choco install kubernetes-cli` |
| Helm | Install ArgoCD on EKS | `choco install kubernetes-helm` |
| Docker Desktop | Build container images | Already installed ✅ |

---

## Phase 1: Configure AWS CLI (~2 minutes)

### Step 1: Create an IAM User
1. Log into [AWS Console](https://console.aws.amazon.com)
2. Go to **IAM → Users → Create User**
3. Name: `aerolink-deployer`
4. Attach policy: **AdministratorAccess** (for academic use only)
5. Go to **Security Credentials → Create Access Key** → Choose "CLI"
6. Save the **Access Key ID** and **Secret Access Key**

### Step 2: Configure CLI
```powershell
aws configure
```
Enter:
- **AWS Access Key ID**: (paste your key)
- **AWS Secret Access Key**: (paste your secret)
- **Default region**: `us-east-1`
- **Output format**: `json`

### Step 3: Verify
```powershell
aws sts get-caller-identity
```
You should see your account ID and ARN.

---

## Phase 2: Deploy Infrastructure with Terraform (~15 minutes)

### Step 1: Initialize Terraform
```powershell
cd d:\APIIT\final\Cloud\SEM_3\aerolink_platform\terraform
terraform init
```

### Step 2: Preview what will be created
```powershell
terraform plan
```
This shows you exactly what AWS resources Terraform will create (VPC, EKS, ECR, DynamoDB, SQS, EventBridge).

> [!TIP]
> 📸 **Screenshot the `terraform plan` output** — this is excellent evidence of Infrastructure as Code for your report.

### Step 3: Deploy everything
```powershell
terraform apply
```
Type `yes` when prompted. This will take **10-15 minutes** as it provisions:
- VPC with public/private subnets
- EKS Cluster (Kubernetes)
- ECR Repositories (Docker image storage)
- DynamoDB Tables
- SQS Queues + Dead Letter Queues
- EventBridge Rules
- CloudWatch Dashboard

> [!TIP]
> 📸 **Screenshot the `Apply complete! Resources: X added` output.**

### Step 4: Connect kubectl to your EKS cluster
```powershell
aws eks update-kubeconfig --region us-east-1 --name aerolink-cluster
kubectl get nodes
```
You should see your worker nodes listed as `Ready`.

---

## Phase 3: Push Docker Images to ECR (~5 minutes)

### Step 1: Login to ECR
```powershell
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"
```

### Step 2: Build, Tag, and Push each service
```powershell
# Auth Service
docker build -t aerolink/auth-service ./services/auth-service
docker tag aerolink/auth-service:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/auth-service:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/auth-service:latest

# Flight Service
docker build -t aerolink/flight-service ./services/flight-service
docker tag aerolink/flight-service:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/flight-service:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/flight-service:latest

# Booking Service
docker build -t aerolink/booking-service ./services/booking-service
docker tag aerolink/booking-service:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/booking-service:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/booking-service:latest

# Baggage Service
docker build -t aerolink/baggage-service ./services/baggage-service
docker tag aerolink/baggage-service:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/baggage-service:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/baggage-service:latest
```

> [!TIP]
> 📸 **Screenshot the ECR console** showing your pushed images.

---

## Phase 4: Deploy to Kubernetes (~5 minutes)

### Step 1: Update image references in K8s manifests
Edit the `k8s-manifests/*.yaml` files and replace the placeholder ECR URIs with your actual account ID:
```
<YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/aerolink/auth-service:latest
```

### Step 2: Install NGINX Ingress Controller
This enables routing traffic to your microservices via standard HTTP paths.
```powershell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml
```

### Step 3: Apply all manifests
```powershell
kubectl apply -f k8s-manifests/
```

### Step 3: Verify pods are running
```powershell
kubectl get pods
kubectl get services
```

> [!TIP]
> 📸 **Screenshot `kubectl get pods` showing all pods in `Running` status.**

---

## Phase 5: Install ArgoCD (GitOps) (~5 minutes)

### Step 1: Install ArgoCD
```powershell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Step 2: Expose ArgoCD UI
```powershell
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### Step 3: Get the admin password
```powershell
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

### Step 4: Open ArgoCD Dashboard
Go to `https://localhost:8080` in your browser.
- Username: `admin`
- Password: (from Step 3)

> [!TIP]
> 📸 **Screenshot the ArgoCD dashboard** showing your application synced and healthy. This is key evidence for GitOps.

---

## Phase 6: Chaos Engineering Demo (~2 minutes)

This demonstrates **resilience** — a key requirement for your assignment.

### Kill a pod and watch Kubernetes self-heal
```powershell
# List running pods
kubectl get pods

# Kill the booking-service pod
kubectl delete pod <booking-service-pod-name>

# Watch it automatically restart (within seconds)
kubectl get pods -w
```

> [!TIP]
> 📸 **Screenshot the pod being terminated and a new one spinning up.** This proves Kubernetes self-healing and is worth major marks.

---

## Phase 7: Screenshots Checklist for Report

| # | What to Screenshot | Report Section |
|---|---|---|
| 1 | `terraform plan` output | Task 5 — IaC |
| 2 | `terraform apply` complete | Task 5 — IaC |
| 3 | AWS Console → EKS Cluster | Task 2 — Cloud Architecture |
| 4 | AWS Console → ECR Repositories | Task 5 — CI/CD |
| 5 | `kubectl get pods` (all Running) | Task 2 — Containerization |
| 6 | ArgoCD Dashboard (synced) | Task 5 — GitOps |
| 7 | Pod kill + self-heal | Task 4 — Resilience |
| 8 | CloudWatch Dashboard | Task 6 — Monitoring |
| 9 | Frontend Booking Confirmed | Task 3 — Saga Pattern |
| 10 | Frontend Saga Rollback | Task 3 — Saga Pattern |
| 11 | Docker terminal Saga logs | Task 3 — Event-Driven |

---

## 🧹 CLEANUP (DO THIS IMMEDIATELY AFTER!)

> [!CAUTION]
> **Do not forget this step!** EKS charges ~$2.40/day even when idle.

```powershell
# Delete Kubernetes resources
kubectl delete -f k8s-manifests/

# Delete ArgoCD
kubectl delete namespace argocd

# Destroy ALL AWS infrastructure
cd d:\APIIT\final\Cloud\SEM_3\aerolink_platform\terraform
terraform destroy
```
Type `yes` when prompted. This removes everything from your AWS account.

### Verify cleanup
Go to your [AWS Billing Dashboard](https://console.aws.amazon.com/billing/) the next day to confirm no lingering charges.

---

## Quick Reference: Total Time & Cost

| Phase | Time | Cost |
|---|---|---|
| AWS CLI Setup | 2 min | Free |
| Terraform Deploy | 15 min | Starts billing |
| Push to ECR | 5 min | ~$0.10 |
| Deploy to K8s | 5 min | Included in EKS |
| ArgoCD Setup | 5 min | Free (runs on EKS) |
| Chaos Demo | 2 min | Free |
| **Take screenshots** | **10 min** | — |
| Terraform Destroy | 10 min | Stops billing |
| **Total** | **~55 min** | **~$1-2 if you destroy same day** |
