# AeroLink Airline Platform - Final Report Guide

While the actual writing of the report is scheduled for **Phase 6 (Days 13-14)**, a distinction-level report requires you to collect evidence (screenshots, metrics, logs) **while you are building**. If you wait until Day 13 to gather everything, you will miss crucial data.

This guide outlines the structure of your final report and what you need to collect as we execute the plan.

## 📝 Report Structure (How to structure your PDF)

### 1. Cloud Architecture Design (20%)
*   **What to write**: Don't just list what services you used; explain *why* you chose them over alternatives. 
*   **Key Justifications**:
    *   Why GitOps (ArgoCD + GitHub Actions) instead of a simple script? (Answer: Professional, automated rollback, single source of truth).
    *   Why EKS instead of EC2? (Answer: Container orchestration, auto-scaling, industry standard).
    *   Why EventBridge/SQS instead of direct API calls? (Answer: Decoupling, fault tolerance if a downstream service fails).
*   **Required Visuals**: Professional Architecture Diagram (use draw.io or Lucidchart).

### 2. Implementation Details (40%)
*   **What to write**: Highlight the most complex parts of the system.
*   **Key Highlights**:
    *   **The Saga Pattern**: Explain how the Booking Service handles distributed transactions (reserving a seat, processing payment, and rolling back if payment fails).
    *   **Real-time sync**: Explain how WebSocket updates the frontend instantly.
*   **Required Visuals**: Code snippets of your Saga Pattern rollback logic and GitHub Actions YAML.

### 3. Security & Compliance
*   **What to write**: How you protected user data.
*   **Key Highlights**:
    *   Custom JWT Auth with Role-Based Access Control (RBAC).
    *   KMS Encryption for DynamoDB data at rest.
    *   API Gateway Rate Limiting to prevent DDoS.

### 4. Testing, Resilience & Observability (20%)
*   **What to write**: Prove the system works under load and can recover from failures.
*   **Key Highlights**:
    *   **Chaos Engineering**: Explain what happened when you manually killed a pod, and how the Dead Letter Queues (DLQ) saved dropped messages.
*   **Required Visuals**: Load testing graphs (Artillery), CloudWatch dashboard screenshots, X-Ray trace paths.

---

## 📸 Evidence Collection Checklist (Do this DURING the build)

As we progress through the Task List, take screenshots of the following and save them in a folder on your computer:

- [ ] **Day 3**: Screenshot of your API Gateway routes in the AWS Console.
- [ ] **Day 6**: Screenshot of a successful EventBridge rule triggering an SQS queue.
- [ ] **Day 9**: Screenshot of ArgoCD dashboard showing your Kubernetes pods as "Healthy" and "Synced".
- [ ] **Day 11**: Screenshot of a "Green" GitHub Actions pipeline run.
- [ ] **Day 13**: Screenshot of your CloudWatch Dashboard showing healthy metrics.
- [ ] **Day 13**: Graph from Artillery showing 100+ concurrent users with low latency.
- [ ] **Day 14**: (During Chaos Test) Screenshot of `kubectl get pods` showing a new pod spinning up instantly after you deleted the old one.
