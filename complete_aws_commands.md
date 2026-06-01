# AeroLink — Complete AWS Deployment Commands (Copy & Paste Guide)

> [!CAUTION]
> **💰 COST WARNING:** Running EKS costs **~$2.40/day**. Deploy ONLY when you need screenshots, then **destroy immediately**. The entire process takes ~55 minutes. Don't leave it running overnight!

---

## Phase 1: AWS CLI Setup (One-Time Only)

```powershell
# Configure your AWS credentials (you only do this once)
aws configure
# Enter: Access Key ID, Secret Key, Region: us-east-1, Output: json

# Verify it works
aws sts get-caller-identity
```

---

## Phase 2: Terraform — Create All AWS Infrastructure (~15 min)

```powershell
# Navigate to the Terraform folder
cd d:\APIIT\final\Cloud\SEM_3\aerolink_platform\terraform

# Initialize Terraform (downloads required AWS modules)
terraform init

# Preview what will be created (optional but good for screenshots)
terraform plan

# 🚀 Deploy everything to AWS (type "yes" when prompted)
terraform apply
```

> [!TIP]
> 📸 Screenshot the `Apply complete! Resources: X added` message.

**What this creates:**
- VPC + Subnets (public/private)
- EKS Kubernetes Cluster (`aerolink-eks-cluster`)
- 8x EC2 Nodes (`t3.micro`)
- 5x ECR Repositories (Docker image storage)
- 4x DynamoDB Tables (users, flights, bookings, baggage)
- EventBridge Event Bus + Rules
- SQS Queue + Dead Letter Queue
- Lambda Function (notification-service)
- CloudWatch Dashboard
- S3 Bucket (frontend hosting)

---

## Phase 3: Connect kubectl to EKS (~1 min)

```powershell
# Tell kubectl to talk to your new AWS cluster
aws eks update-kubeconfig --region us-east-1 --name aerolink-eks-cluster

# Verify — you should see 4 nodes as "Ready"
kubectl get nodes
```

> [!TIP]
> 📸 Screenshot `kubectl get nodes` showing all nodes as Ready.

---

## Phase 4: Build & Push Docker Images to ECR (~5 min)

```powershell
# Navigate to the project root
cd d:\APIIT\final\Cloud\SEM_3\aerolink_platform

# Get your AWS Account ID and login to ECR
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"
```

```powershell
# Build, Tag, and Push — Auth Service
docker build -t aerolink/auth-service ./services/auth-service
docker tag aerolink/auth-service:latest "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/auth-service:latest"
docker push "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/auth-service:latest"
```

```powershell
# Build, Tag, and Push — Flight Service
docker build -t aerolink/flight-service ./services/flight-service
docker tag aerolink/flight-service:latest "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/flight-service:latest"
docker push "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/flight-service:latest"
```

```powershell
# Build, Tag, and Push — Booking Service
docker build -t aerolink/booking-service ./services/booking-service
docker tag aerolink/booking-service:latest "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/booking-service:latest"
docker push "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/booking-service:latest"
```

```powershell
# Build, Tag, and Push — Baggage Service
docker build -t aerolink/baggage-service ./services/baggage-service
docker tag aerolink/baggage-service:latest "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/baggage-service:latest"
docker push "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/baggage-service:latest"
```

```powershell
# Build, Tag, and Push — WebSocket Service
docker build -t aerolink/websocket-service ./services/websocket-service
docker tag aerolink/websocket-service:latest "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/websocket-service:latest"
docker push "$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aerolink/websocket-service:latest"
```

> [!TIP]
> 📸 Go to **AWS Console → ECR** and screenshot your 5 repositories with images inside.

---

## Phase 5: Update K8s Manifests with your Account ID (~1 min)

```powershell
# Replace the old account ID in all K8s manifests with YOUR account ID
cd d:\APIIT\final\Cloud\SEM_3\aerolink_platform

# Check what account ID is currently in the files
Get-Content k8s-manifests\auth-service.yaml | Select-String "image:"

# If the account ID is wrong, replace it in ALL yaml files:
$OLD_ID = "791945999903"  # Change this to whatever is currently in your files
(Get-ChildItem k8s-manifests\*.yaml) | ForEach-Object {
    (Get-Content $_.FullName) -replace $OLD_ID, $ACCOUNT_ID | Set-Content $_.FullName
}
```

---

## Phase 6: Install ArgoCD (GitOps) (~5 min)

```powershell
# Create the ArgoCD namespace and install it
kubectl create namespace argocd
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD pods to start
Start-Sleep -Seconds 60
kubectl get pods -n argocd
```

```powershell
# Get the ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

```powershell
# Open the ArgoCD web dashboard (keep this terminal open!)
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Now open your browser and go to: **https://localhost:8080**
- Username: `admin`
- Password: (the password from the command above)

> [!TIP]
> 📸 Screenshot the ArgoCD dashboard showing your application as "Synced" and "Healthy".

---

## Phase 7: Deploy to Kubernetes (~2 min)

```powershell
# Install NGINX Ingress Controller (creates the AWS Load Balancer)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

# Wait 60 seconds for the Load Balancer to provision
Start-Sleep -Seconds 60

# Deploy all your microservices + ingress + ArgoCD Sync config
kubectl apply -f k8s-manifests/

# Verify everything is running
kubectl get pods
kubectl get svc
kubectl get ingress
```

> [!TIP]
> 📸 Screenshot `kubectl get pods` showing all pods as `Running`.

```powershell
# Get your application's public URL (the AWS Load Balancer address)
kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath="{.status.loadBalancer.ingress[0].hostname}"
```

```powershell
# Test your live API!
$ELB_URL = kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath="{.status.loadBalancer.ingress[0].hostname}"
Invoke-RestMethod -Uri "http://$ELB_URL/api/v1/flights" -Method GET
```

---

## Phase 8: Chaos Engineering Demo (~2 min)

```powershell
# List all running pods
kubectl get pods

# Kill the booking-service pod (replace with your actual pod name)
kubectl delete pod <booking-service-pod-name>

# Watch Kubernetes instantly spin up a replacement
kubectl get pods -w
```

> [!TIP]
> 📸 Screenshot showing the old pod `Terminating` and a new pod `Running`. This proves **self-healing resilience**.

---

## Phase 9: Seed DynamoDB & Test Frontend (~3 min)

```powershell
# Seed sample flights into the live AWS DynamoDB
cd d:\APIIT\final\Cloud\SEM_3\aerolink_platform
node setup-dynamo.js
```

> [!IMPORTANT]
> Before running `setup-dynamo.js`, make sure the script points to **AWS** (not localhost). Check that `endpoint` is removed or commented out in `setup-dynamo.js`.

```powershell
# Start the frontend (pointing to AWS)
cd frontend
npm run dev
```

> [!IMPORTANT]
> Make sure `frontend/vite.config.ts` has the proxy targets pointing to your ELB URL (not localhost). You can get the ELB URL from Phase 6.

---

## 📸 Screenshot Checklist

| # | What to Screenshot | Where to find it |
|---|---|---|
| 1 | `terraform apply` complete | Terminal |
| 2 | AWS Console → EKS Cluster (Active) | AWS Console |
| 3 | AWS Console → ECR Repositories (with images) | AWS Console |
| 4 | AWS Console → DynamoDB Tables | AWS Console |
| 5 | `kubectl get pods` (all Running) | Terminal |
| 6 | `kubectl get nodes` (all Ready) | Terminal |
| 7 | ArgoCD Dashboard (Synced + Healthy) | Browser https://localhost:8080 |
| 8 | Pod kill + self-heal | Terminal |
| 9 | CloudWatch Dashboard | AWS Console |
| 10 | Frontend booking success | Browser http://localhost:5173 |
| 11 | Frontend saga rollback | Browser http://localhost:5173 |

---

## 🧹 CLEANUP — DESTROY EVERYTHING (Do this IMMEDIATELY after screenshots!)

> [!CAUTION]
> **DO NOT SKIP THIS!** If you forget, AWS will charge you ~$2.40/day until you destroy it.

```powershell
# Step 1: Stop the frontend
# Press Ctrl+C in the frontend terminal

# Step 2: Delete Kubernetes resources
kubectl delete -f k8s-manifests/

# Step 3: Delete ArgoCD
kubectl delete namespace argocd

# Step 4: Delete NGINX Ingress Controller (this deletes the Load Balancer)
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

# Step 5: Wait 30 seconds for Load Balancer to fully detach
Start-Sleep -Seconds 30
```

```powershell
# Step 6: Delete any orphaned Load Balancers (safety net)
aws elb describe-load-balancers --query "LoadBalancerDescriptions[*].LoadBalancerName" --output text | ForEach-Object { if ($_ -ne "") { aws elb delete-load-balancer --load-balancer-name $_; Write-Host "Deleted ELB: $_" } }

aws elbv2 describe-load-balancers --query "LoadBalancers[*].LoadBalancerArn" --output text | ForEach-Object { if ($_ -ne "") { aws elbv2 delete-load-balancer --load-balancer-arn $_; Write-Host "Deleted ELBv2" } }
```

```powershell
# Step 7: Force-delete ECR images (in case Terraform can't)
aws ecr delete-repository --repository-name aerolink/auth-service --force
aws ecr delete-repository --repository-name aerolink/booking-service --force
aws ecr delete-repository --repository-name aerolink/flight-service --force
aws ecr delete-repository --repository-name aerolink/baggage-service --force
aws ecr delete-repository --repository-name aerolink/websocket-service --force
```

```powershell
# Step 8: Destroy ALL Terraform infrastructure (type "yes" when prompted)
cd d:\APIIT\final\Cloud\SEM_3\aerolink_platform\terraform
terraform destroy
```

```powershell
# Step 9: Verify everything is gone
aws eks list-clusters --query "clusters" --output text
# Should return empty

aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].InstanceId" --output text
# Should return empty
```

> [!TIP]
> Check your **AWS Billing Dashboard** the next day to confirm no surprise charges.

---

## 🏠 Running Locally (Without AWS)

If you just want to demo the app locally without AWS:

```powershell
# Start all backend services locally with Docker
cd d:\APIIT\final\Cloud\SEM_3\aerolink_platform
docker-compose up -d

# Seed the local database
node setup-dynamo.js

# Start the frontend
cd frontend
npm run dev
```

Make sure `vite.config.ts` points to **localhost** (not the ELB URL).

```powershell
# To stop everything locally
docker-compose down
# Press Ctrl+C in the frontend terminal
```

---

## ⏱️ Total Time & Cost Summary

| Phase | Time | Cost |
|---|---|---|
| AWS CLI Setup | 2 min | Free |
| Terraform Deploy | 15 min | Starts billing (~$2.40/day) |
| Connect kubectl | 1 min | Free |
| Build & Push Docker | 5 min | ~$0.10 |
| Deploy to K8s | 2 min | Included in EKS |
| ArgoCD Setup | 5 min | Free (runs on EKS) |
| Chaos Demo | 2 min | Free |
| Seed DB & Test | 3 min | Free |
| **Take Screenshots** | **10 min** | — |
| **Cleanup & Destroy** | **10 min** | **Stops billing** |
| **TOTAL** | **~55 min** | **~$1-2 if destroyed same day** |
