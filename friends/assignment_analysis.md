# AeroLink Cloud Assignment 2 — Smart Analysis

> **Module**: COMP60010 | **Weight**: 50% | **Deadline**: 05 June 2026
> **Marking**: Architecture 20% | Implementation 40% | Testing 20% | Presentation & Viva 20%

---

## Assessment Weights (What Matters Most)

| Area | Weight | Takeaway |
|------|--------|----------|
| Architecture Design | 20% | Diagrams + justification — **talk the WHY, not just the WHAT** |
| **Implementation** | **40%** | **This is where first-class is won or lost** |
| Testing & Results | 20% | Not just "it works" — show metrics, graphs, analysis |
| Presentation & Viva | 20% | 15-min demo — confident, structured, know your system inside-out |

---

## Task-by-Task Breakdown

### 1. Cloud Architecture Design (20%)

| Pass Level ✅ | First-Class Level 🏆 |
|---|---|
| Basic microservices diagram | Professional C4 / AWS architecture diagram (draw.io / Lucidchart) |
| Mention Docker | Docker + **ECS Fargate** or **EKS** with proper service mesh |
| Mention Lambda | Lambda for **specific event-driven tasks** (e.g., notification triggers, baggage events) |
| Single-region RDS | **DynamoDB Global Tables** for multi-region + **Aurora** for relational data |
| Basic explanation | Clear justification of **why** each service was chosen over alternatives |

> **Pro Move**: Use a **hybrid approach** — containerized core services (booking, check-in) + serverless for event-driven tasks (notifications, baggage tracking). This shows real-world thinking.

---

### 2. Distributed APIs & Communication

| Pass Level ✅ | First-Class Level 🏆 |
|---|---|
| REST APIs between services | REST + **AWS EventBridge / SNS+SQS** for async event-driven communication |
| Basic API Gateway | **AWS API Gateway** with rate limiting, API keys, usage plans |
| Swagger docs | **OpenAPI 3.0 spec** auto-generated from code + hosted Swagger UI |
| Direct service calls | **Service discovery** + **loose coupling** via message queues |

> **Pro Move**: Implement an **event-driven architecture** where booking events trigger downstream services (baggage, notifications, seat updates) via EventBridge. This is exactly how airlines work in production.

---

### 3. Security & Compliance

| Pass Level ✅ | First-Class Level 🏆 |
|---|---|
| Basic JWT auth | **AWS Cognito** with OAuth 2.0 + JWT + **RBAC** (admin, staff, passenger roles) |
| HTTPS | HTTPS + **encryption at rest** (KMS for DynamoDB/S3) + **TLS for service-to-service** |
| Mention GDPR | Implement **data anonymization**, **consent management**, **right-to-deletion** endpoint |
| Basic password hashing | **PCI-DSS** awareness for payment data — tokenize card details, never store raw |

> **Pro Move**: Implement **Saga Pattern** for distributed transactions (e.g., booking → payment → seat allocation). Discuss **eventual consistency** with real examples from your system.

---

### 4. Real-Time Data Sync

| Pass Level ✅ | First-Class Level 🏆 |
|---|---|
| Polling-based updates | **WebSockets** (API Gateway WebSocket API) for live seat/flight updates |
| Manual data refresh | **DynamoDB Streams** → Lambda → push updates to connected clients |
| Basic sync | **Event-driven pipeline**: flight change → EventBridge → update all dependent services simultaneously |

> **Pro Move**: Build a **live flight board** or **real-time seat map** that updates without page refresh. This is visually impressive for the viva.

---

### 5. Fault Tolerance & Resilience

| Pass Level ✅ | First-Class Level 🏆 |
|---|---|
| Basic error handling | **Circuit breaker pattern** (e.g., using resilience library or custom implementation) |
| Single AZ deployment | **Multi-AZ** deployment + **auto-scaling policies** based on CPU/request count |
| Manual recovery | **Dead letter queues** for failed events + automated retry with exponential backoff |
| Basic health checks | **Load balancer health checks** + **graceful degradation** (fallback responses) |

> **Pro Move**: Demonstrate a **chaos engineering** scenario — kill a service, show the system recovers automatically. This will blow the examiner's mind during viva.

---

### 6. Performance & Scalability Testing

| Pass Level ✅ | First-Class Level 🏆 |
|---|---|
| Basic Postman tests | **Artillery / k6 / JMeter** load tests with 100+ concurrent users |
| "It works" evidence | **Graphs** showing latency, throughput, error rates under load |
| Single test run | **Stress test** to find breaking point + discuss **scaling strategies** |
| No analysis | Compare performance **before vs after** optimizations (caching, connection pooling) |

> **Pro Move**: Add **ElastiCache (Redis)** for caching frequent queries (flight searches). Show performance improvement with before/after graphs.

---

### 7. Monitoring & Observability

| Pass Level ✅ | First-Class Level 🏆 |
|---|---|
| Basic CloudWatch logs | **Custom CloudWatch dashboards** with alarms + metrics |
| Console screenshots | **X-Ray distributed tracing** across microservices |
| Log statements | **Structured logging** (JSON format) with correlation IDs across services |
| No alerts | **CloudWatch Alarms** → **SNS** notifications for critical failures |

> **Pro Move**: Build a **CloudWatch dashboard** showing all services health at a glance. Screenshot this for the report — it looks extremely professional.

---

### 8. Testing Strategy

| Pass Level ✅ | First-Class Level 🏆 |
|---|---|
| A few unit tests | **Comprehensive unit tests** with good coverage per microservice |
| Manual API tests | **Postman collections** with automated test scripts + environment variables |
| No CI/CD | **GitHub Actions / AWS CodePipeline** for CI/CD with automated testing |
| Screenshots of tests | **Test reports** with pass/fail counts, coverage percentages |

> **Pro Move**: Set up a **CI/CD pipeline** that runs tests on every push. Even a basic GitHub Actions workflow shows professional-grade engineering.

---

## Recommended Tech Stack (AWS + Docker Focus)

| Layer | Technology |
|-------|-----------|
| **Containerization** | Docker + ECS Fargate (or EKS if ambitious) |
| **Serverless** | AWS Lambda (for event handlers) |
| **API Gateway** | AWS API Gateway (REST + WebSocket) |
| **Auth** | AWS Cognito (OAuth 2.0 + JWT) |
| **Database** | DynamoDB (NoSQL) + Aurora (relational) or just DynamoDB |
| **Messaging** | EventBridge + SQS + SNS |
| **Caching** | ElastiCache (Redis) |
| **Monitoring** | CloudWatch + X-Ray |
| **CI/CD** | GitHub Actions or CodePipeline |
| **IaC** | CloudFormation or Terraform (bonus) |
| **API Docs** | Swagger / OpenAPI 3.0 |

---

## Deliverables Checklist

| Deliverable | What to Submit |
|-------------|---------------|
| **Final Report (PDF)** | Architecture diagrams, security approach, implementation details, test results, challenges |
| **Source Code (ZIP)** | All microservices, Dockerfiles, API specs, deployment configs (docker-compose, CloudFormation) |
| **Presentation (15 min)** | Solution overview, live demo, architecture walkthrough, Q&A readiness |

---

## 🎯 Key First-Class Differentiators (TL;DR)

1. **Event-driven architecture** — not just REST, use EventBridge/SQS for async workflows
2. **Real-time features** — WebSocket-based live updates (seat map, flight board)
3. **CI/CD pipeline** — automated build, test, deploy
4. **Infrastructure as Code** — CloudFormation/Terraform, not manual console clicks
5. **Performance graphs** — before/after optimization with real data
6. **Chaos testing** — prove your system self-heals
7. **Professional dashboards** — CloudWatch dashboard screenshot in report
8. **Saga pattern** — for distributed transactions with proper rollback

> [!IMPORTANT]
> Implementation carries **40%** of the marks. Don't just design — **build it, deploy it, and show it working**. The report supports the code, not the other way around.

---

## 🚀 Professional Enhancements (7 Finalized)

These go **beyond** assignment requirements to demonstrate industry-level engineering. Total extra effort: **~5 hours**.

### Enhancement Details

| # | Enhancement | What It Does | Marks It Boosts | Time |
|---|------------|-------------|----------------|------|
| 1 | **CI/CD Pipeline (GitHub Actions)** | Push code → auto build → auto test → auto deploy to AWS | Architecture + Implementation + Testing | 2 hrs |
| 2 | **Health Check Endpoints** (`/health` per service) | Every microservice exposes health status — used by load balancers & ECS | Architecture + Fault Tolerance | 30 mins |
| 3 | **API Versioning** (`/api/v1/flights`) | Version-controlled APIs — shows backward compatibility planning | Architecture + Implementation | 30 mins |
| 4 | **Rate Limiting & Throttling** | Protect APIs from abuse/DDoS — critical for booking & payment endpoints | Security + Implementation | 30 mins |
| 5 | **Docker Multi-Stage Builds** | Smaller, optimized container images — professional Docker practice | Implementation | 20 mins |
| 6 | **Centralized Config (SSM Parameter Store)** | No hardcoded secrets — all configs stored securely in AWS | Security + Compliance | 45 mins |
| 7 | **Database Seeding Scripts** | One command populates demo data — smooth, professional viva demo | Testing + Viva | 30 mins |

### Marks Impact Per Enhancement

| Enhancement | Architecture (20%) | Implementation (40%) | Testing (20%) | Viva (20%) |
|------------|:--:|:--:|:--:|:--:|
| CI/CD Pipeline | ✅ | ✅ | ✅ | ✅ |
| Health Checks | ✅ | ✅ | | ✅ |
| API Versioning | ✅ | ✅ | | |
| Rate Limiting | | ✅ | | ✅ |
| Multi-Stage Docker | | ✅ | | |
| SSM Config | ✅ | ✅ | | ✅ |
| DB Seeding | | | ✅ | ✅ |

### ⚡ Priority Order (If Time Gets Tight)

```
MUST DO:     1. CI/CD Pipeline
             2. Health Check Endpoints
             3. API Versioning
             4. Rate Limiting

NICE TO DO:  5. SSM Parameter Store Config
             6. Docker Multi-Stage Builds
             7. Database Seeding Scripts
```

> [!WARNING]
> **Rule**: Never let enhancements steal time from core tasks (Tasks 1–8). If behind schedule by Day 10, skip enhancements 5, 6, 7 — but **never skip CI/CD and Health Checks**.

---


## AWS Services Plan — Academy Lab ($120.89 Credits | 53 Days | Expires July 10, 2026)

### ✅ Available & Recommended

| Service | Purpose in AeroLink | Est. Cost | Pro Tip |
|---------|-------------------|-----------|---------|
| **EC2 (t2.micro)** | Host containerized microservices | ~$0.01/hr | Stop instances after each session |
| **Lambda** | Event-driven tasks (baggage events, notifications, seat updates) | ~$0 | Perfect for async triggers |
| **API Gateway (REST)** | Central entry point, routing, rate limiting | ~$0 | Use stages (dev/prod) for professional look |
| **DynamoDB** | Primary database — flights, bookings, passengers, baggage | ~$0 | Use **Global Tables** to demonstrate multi-region |
| **SQS** | Message queues between microservices | ~$0 | Use **DLQ** (Dead Letter Queues) for fault tolerance |
| **SNS** | Push notifications, event fan-out | ~$0 | Pair with SQS for pub/sub pattern |
| **EventBridge** | Event bus for real-time service communication | ~$0 | Core of your event-driven architecture |
| **S3** | Static assets, logs, deployment artifacts | ~$0 | Enable versioning + encryption for compliance points |
| **CloudWatch** | Logs, metrics, alarms, dashboards | ~$0 | Build a **custom dashboard** — screenshot for report |
| **X-Ray** | Distributed tracing across microservices | ~$0 | Shows request flow visually — great for viva |
| **ECR** | Docker image registry | ~$0 | Push your Docker images here for ECS |
| **RDS (MySQL/Postgres)** | Relational data if needed alongside DynamoDB | ~$0.02/hr | Use if you want to show polyglot persistence |
| **ElastiCache (Redis)** | Caching flight searches, session data | ~$0.02/hr | Show before/after performance improvement |
| **CloudFormation** | Infrastructure as Code | Free | Deploy your entire stack from a template |
| **IAM** | Roles, policies, RBAC | Free | Create proper roles per microservice |
| **KMS** | Encryption keys for data at rest | ~$0 | Encrypt DynamoDB/S3 — easy compliance win |

### ⚠️ Likely Restricted in Academy Lab

| Service | Why Restricted | Professional Alternative |
|---------|---------------|------------------------|
| **Cognito** | Academy Labs often block it | ✅ **Custom JWT auth service** — build your own auth microservice with `jsonwebtoken` library. Actually **more impressive** because you built it yourself |
| **EKS (Kubernetes)** | Blocked + expensive | ✅ **ECS with EC2** or **Docker Compose on EC2** — achieves same containerization goal |
| **Aurora** | Often restricted | ✅ **RDS MySQL t2.micro** or **DynamoDB** — same marks, lower cost |
| **API Gateway WebSocket** | May be limited | ✅ **Socket.io on EC2** — run your own WebSocket server inside a container |
| **CodePipeline** | Sometimes restricted | ✅ **GitHub Actions** — free, easier to set up, equally professional |
| **Secrets Manager** | May be blocked | ✅ **SSM Parameter Store** (free) or **environment variables** in ECS task definitions |

### 🏆 Final Recommended Stack (Academy Lab Optimized)

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTS                          │
│          (Web Browser / Postman / Mobile)            │
└──────────────────────┬──────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  API Gateway    │  ← REST APIs + API Keys
              │  (AWS)          │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │ Booking  │   │ Flight   │   │ Baggage  │  ← Docker containers
   │ Service  │   │ Service  │   │ Service  │     on EC2 / ECS
   └────┬─────┘   └────┬─────┘   └────┬─────┘
        │              │              │
        ▼              ▼              ▼
   ┌──────────────────────────────────────┐
   │         EventBridge + SQS            │  ← Event-driven async
   └──────────────────┬───────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌─────────┐
   │DynamoDB │  │ Lambda   │  │   S3    │
   │(Data)   │  │(Events)  │  │(Assets) │
   └─────────┘  └──────────┘  └─────────┘
        │
   ┌────▼─────────────────────────┐
   │ CloudWatch + X-Ray           │  ← Monitoring & Tracing
   │ (Dashboards, Alarms, Logs)   │
   └──────────────────────────────┘
```

### 💰 Estimated Total Cost

| Scenario | Est. Cost |
|----------|-----------|
| Light usage (2-3 hrs/day for 2 weeks) | **~$15–25** |
| Heavy usage (6+ hrs/day with RDS + ElastiCache) | **~$40–60** |
| **Your budget** | **$120.89** ✅ |

> [!CAUTION]
> **Always stop/terminate EC2, RDS, and ElastiCache instances after each session.** These charge per hour even when idle. Set a **billing alarm at $50** in CloudWatch so you never get surprised.

> [!TIP]
> If a service is blocked in your Academy Lab, **don't panic**. The professional alternatives listed above are equally valid — in fact, building custom solutions (like your own JWT auth) often scores **higher** because it shows deeper understanding.
