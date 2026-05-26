#!/bin/bash
# Install ArgoCD on the EKS Cluster
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD server pods to be ready
echo "Waiting for ArgoCD server to start..."
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Get the initial admin password
echo "===================================="
echo "ArgoCD Admin Password:"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""
echo "===================================="
echo "To access the UI, run:"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "Login with username 'admin' and the password above at http://localhost:8080"
echo "===================================="

# Apply the ArgoCD Application configuration to monitor GitHub
echo "Deploying the AeroLink ArgoCD Application..."
kubectl apply -f ../k8s-manifests/argocd-app.yaml
