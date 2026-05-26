# AeroLink Airline Systems — Implementation Plan

> **Timeline**: 14 Days (May 21 – June 3, 2026) + 2 days buffer
> **Effort**: 4–6 hrs/day | **Submission**: June 5, 2026
> **Account**: Personal AWS Account ($122.76 promotional credits)

---

## Project Overview

Build a cloud-native, microservices-based airline platform on AWS with 5 containerized services, event-driven architecture, real-time data sync, and a React/Next.js frontend — deployed via Terraform.

---

## Architecture Overview

```
                        ┌──────────────┐
                        │   React /    │
                        │   Next.js    │
                        │   Frontend   │
                        └──────┬───────┘
                               │
                      ┌────────▼────────┐
                      │  AWS API Gateway │ ← Rate Limiting, API Keys, Versioning
                      └────────┬────────┘
                               │
          ┌────────────┬───────┼────────┬─────────────┐
          ▼            ▼       ▼        ▼             ▼
     ┌─────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐
     │  Auth   │ │ Flight  │ │Booking │ │ Baggage  │ │ Notification │
     │ Service │ │ Service │ │Service │ │ Service  │ │   Service    │
     │ (Docker)│ │(Docker) │ │(Docker)│ │ (Docker) │ │  (Lambda)    │
     └────┬────┘ └────┬────┘ └───┬────┘ └────┬─────┘ └──────┬───────┘
          │           │          │            │               │
          └───────────┴──────┬───┴────────────┴───────────────┘
                             │
                    ┌────────▼─────────┐
                    │  EventBridge +   │ ← Event-Driven Async Communication
                    │   SQS + SNS     │
                    └────────┬─────────┘
                             │
               ┌─────────────┼─────────────┐
               ▼             ▼             ▼
          ┌─────────┐  ┌──────────┐  ┌─────────┐
          │DynamoDB │  │   S3     │  │  SSM    │
          │ (Data)  │  │ (Assets) │  │(Config) │
          └─────────┘  └──────────┘  └─────────┘
               │
     ┌─────────▼──────────────────┐
     │  CloudWatch + X-Ray        │ ← Monitoring, Logging, Tracing
     │  (Dashboards + Alarms)     │
     └────────────────────────────┘
```

---

## Tech Stack (Finalized)

| Layer | Technology |
|-------|-----------|
| Frontend | React / Next.js |
| Backend | Node.js (Express.js) per microservice |
| Containerization | Docker + Docker Compose (local) + EKS (AWS) |
| Serverless | AWS Lambda (Notification Service) |
| API Gateway | AWS API Gateway (REST, versioned) |
| Auth | Custom JWT service (jsonwebtoken + bcrypt) with RBAC |
| Database | DynamoDB (primary) + DynamoDB Global Tables (multi-region) |
| Messaging | EventBridge + SQS + SNS |
| Caching | ElastiCache (Redis) — for flight search performance |
| Monitoring | CloudWatch (dashboards, alarms) + X-Ray (tracing) |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| API Docs | Swagger / OpenAPI 3.0 |
| Testing | Jest (unit) + Supertest (integration) + Postman (API) + Artillery (load) |

---

## Microservices Breakdown

| Service | Responsibilities | Database Tables | Events Published |
|---------|-----------------|----------------|-----------------|
| **Auth Service** | Register, login, JWT tokens, RBAC (admin/staff/passenger) | `Users` | `user.registered`, `user.login` |
| **Flight Service** | CRUD flights, search, schedules, pricing, seat map | `Flights`, `Seats` | `flight.created`, `flight.updated`, `seat.updated` |
| **Booking Service** | Create/cancel bookings, seat allocation, payment processing | `Bookings`, `Payments` | `booking.created`, `booking.cancelled`, `payment.processed` |
| **Baggage Service** | Register baggage, track status, update location | `Baggage` | `baggage.checked-in`, `baggage.status-changed` |
| **Notification Service** (Lambda) | Listen to events, send notifications (email/SMS simulation) | `Notifications` | — (consumer only) |

---

## Project Structure

```
AeroLink_Airline_Systems/
├── terraform/                    # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── modules/
│   │   ├── api-gateway/
│   │   ├── dynamodb/
│   │   ├── eks/
│   │   ├── eventbridge/
│   │   ├── lambda/
│   │   ├── cloudwatch/
│   │   └── iam/
│   └── environments/
│       ├── dev.tfvars
│       └── prod.tfvars
│
├── services/                     # Backend Microservices
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/       # JWT verify, RBAC
│   │   │   ├── models/
│   │   │   ├── routes/           # /api/v1/auth/*
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── app.js
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── flight-service/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── booking-service/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── baggage-service/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── notification-service/     # Lambda function
│       ├── src/
│       │   └── handler.js
│       ├── tests/
│       └── package.json
│
├── frontend/                     # React / Next.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/             # API calls
│   │   └── styles/
│   ├── package.json
│   └── Dockerfile
│
├── api-docs/                     # Swagger / OpenAPI
│   └── openapi.yaml
│
├── scripts/                      # Utility scripts
│   ├── seed-db.js                # Database seeding (Enhancement #7)
│   └── local-setup.sh
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions (Enhancement #1)
│
├── docker-compose.yml            # Local development
├── docker-compose.prod.yml
└── README.md
```

---

## 14-Day Implementation Schedule

---

### Phase 1: Foundation (Day 1–2)

#### 📅 Day 1 — May 21 (Thursday): Project Setup & Infrastructure Base

**Assignment Tasks Covered**: Task 1 (Architecture Design — partial)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Initialize project structure | Create all folders, `package.json` files, base configs | 45 min |
| 2 | Set up Git repository | Init repo, `.gitignore`, initial commit | 15 min |
| 3 | Create base Dockerfile template | Multi-stage build (Enhancement #5) for Node.js services | 30 min |
| 4 | Create `docker-compose.yml` | All 4 containerized services + DynamoDB Local | 45 min |
| 5 | Terraform base setup | Provider config, state management, IAM base roles | 1 hr |
| 6 | Terraform DynamoDB module | Tables for Users, Flights, Seats, Bookings, Payments, Baggage, Notifications | 1 hr |
| 7 | Verify local Docker Compose runs | All containers start with health checks | 30 min |

**Day 1 Deliverable**: Project skeleton running locally with Docker Compose + Terraform base ready

---

#### 📅 Day 2 — May 22 (Friday): Auth Service + API Gateway Foundation

**Assignment Tasks Covered**: Task 1, Task 2 (API Design), Task 3 (Security — partial)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Auth Service — Registration | `/api/v1/auth/register` — hash password (bcrypt), store in DynamoDB | 1 hr |
| 2 | Auth Service — Login | `/api/v1/auth/login` — verify credentials, return JWT token | 45 min |
| 3 | Auth Service — RBAC middleware | Role-based access (admin, staff, passenger) middleware | 45 min |
| 4 | Auth Service — Health endpoint | `/health` returns service status (Enhancement #2) | 15 min |
| 5 | Rate limiting middleware | Express rate limiter on auth endpoints (Enhancement #4) | 30 min |
| 6 | Terraform API Gateway module | REST API with `/api/v1/` prefix (Enhancement #3), stages (dev/prod) | 1 hr |
| 7 | Auth Service unit tests | Register, login, JWT validation, RBAC tests | 45 min |

**Day 2 Deliverable**: Working auth system with JWT + RBAC + API Gateway routing

---

### Phase 2: Core Microservices (Day 3–6)

#### 📅 Day 3 — May 23 (Saturday): Flight Service

**Assignment Tasks Covered**: Task 1, Task 2, Task 4 (Real-time — partial)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Flight CRUD APIs | Create, read, update, delete flights — `/api/v1/flights` | 1.5 hr |
| 2 | Flight search & filtering | Search by route, date, price range with DynamoDB queries | 1 hr |
| 3 | Seat map management | Seat availability per flight, real-time seat status | 1 hr |
| 4 | Publish events to EventBridge | `flight.created`, `flight.updated`, `seat.updated` events | 45 min |
| 5 | Health endpoint + rate limiting | Reuse middleware from Auth Service | 15 min |
| 6 | Flight Service unit tests | CRUD, search, seat availability tests | 30 min |

**Day 3 Deliverable**: Flight management with real-time seat updates via EventBridge

---

#### 📅 Day 4 — May 24 (Sunday): Booking Service + Saga Pattern

**Assignment Tasks Covered**: Task 2, Task 3 (Saga Pattern, Consistency), Task 4

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Booking CRUD APIs | Create, view, cancel bookings — `/api/v1/bookings` | 1.5 hr |
| 2 | Seat allocation logic | Reserve seat on booking, release on cancellation | 45 min |
| 3 | Payment processing (simulated) | Payment endpoint with tokenized card data (PCI-DSS) | 45 min |
| 4 | Saga pattern implementation | Booking → Payment → Seat Allocation (rollback on failure) | 1.5 hr |
| 5 | Publish events | `booking.created`, `booking.cancelled`, `payment.processed` | 30 min |
| 6 | Booking Service unit tests | Booking flow, saga rollback, payment tests | 30 min |

**Day 4 Deliverable**: Complete booking flow with distributed transaction handling (Saga)

---

#### 📅 Day 5 — May 25 (Monday): Baggage Service + Notification Service

**Assignment Tasks Covered**: Task 2, Task 4 (Real-time sync)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Baggage CRUD APIs | Register, track, update baggage — `/api/v1/baggage` | 1 hr |
| 2 | Baggage status workflow | Checked-in → Loading → In-flight → Arrived → Collected | 45 min |
| 3 | Publish baggage events | `baggage.checked-in`, `baggage.status-changed` | 30 min |
| 4 | Notification Service (Lambda) | Listen to EventBridge events, create notification records | 1.5 hr |
| 5 | Terraform Lambda module | Deploy notification Lambda + EventBridge rules | 45 min |
| 6 | Baggage + Notification tests | Status transitions, event consumption tests | 30 min |

**Day 5 Deliverable**: Full baggage tracking + event-driven notification system

---

#### 📅 Day 6 — May 26 (Tuesday): Event-Driven Integration + Real-Time Sync

**Assignment Tasks Covered**: Task 4 (Full), Task 2 (Service-to-service)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Terraform EventBridge module | Event bus, rules, targets for all services | 1 hr |
| 2 | SQS queues per service | Each service gets its own queue + DLQ (fault tolerance) | 1 hr |
| 3 | DynamoDB Streams setup | Flight/Booking table streams → Lambda triggers | 45 min |
| 4 | Real-time sync pipeline | Flight update → EventBridge → update Booking + Baggage + Notification | 1 hr |
| 5 | WebSocket / Socket.io setup | Real-time push to frontend for seat/flight updates | 1 hr |
| 6 | Integration tests | End-to-end event flow: booking → payment → seat → notification | 30 min |

**Day 6 Deliverable**: All services communicating via events with real-time data sync working

---

### Phase 3: Frontend (Day 7–8)

#### 📅 Day 7 — May 27 (Wednesday): Frontend Core Pages

**Assignment Tasks Covered**: Task 1 (Web Application), Task 4 (Real-time UI)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Initialize Next.js project | Project setup with folder structure, routing | 30 min |
| 2 | Auth pages | Login, Register pages with JWT token storage | 1 hr |
| 3 | Flight search page | Search flights, filter results, view details | 1.5 hr |
| 4 | Live flight board | Real-time flight status board (WebSocket connected) | 1 hr |
| 5 | Booking page | Select flight → choose seat → payment → confirmation | 1 hr |
| 6 | API service layer | Axios/fetch wrapper for all microservice calls | 30 min |

**Day 7 Deliverable**: Core frontend pages connected to backend APIs

---

#### 📅 Day 8 — May 28 (Thursday): Frontend Remaining + Admin Dashboard

**Assignment Tasks Covered**: Task 1, Task 4, Task 7 (Monitoring UI)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Real-time seat map | Visual seat selection with live availability updates | 1.5 hr |
| 2 | Baggage tracking page | Track baggage with status timeline | 1 hr |
| 3 | Admin dashboard | Admin panel — manage flights, view bookings, system stats | 1.5 hr |
| 4 | Role-based UI routing | Show/hide pages based on user role (admin/staff/passenger) | 30 min |
| 5 | Frontend Dockerfile | Containerize frontend for deployment | 30 min |
| 6 | Responsive design polish | Mobile-friendly layout, clean UI | 30 min |

**Day 8 Deliverable**: Complete frontend with all pages, admin panel, and real-time features

---

### Phase 4: Cloud Deployment & Resilience (Day 9–10)

#### 📅 Day 9 — May 29 (Friday): Full AWS Deployment via Terraform

**Assignment Tasks Covered**: Task 1 (Full deployment), Task 5 (Fault tolerance — partial)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Terraform EKS module | EKS cluster, Fargate profiles, node groups, Kubernetes manifests | 1.5 hr |
| 2 | ECR setup | Push Docker images to ECR | 30 min |
| 3 | ALB (Application Load Balancer) | Route traffic to EKS services with health checks | 1 hr |
| 4 | Auto-scaling policies | CPU-based and request-count-based scaling rules | 45 min |
| 5 | Multi-AZ deployment | Configure services across multiple availability zones | 30 min |
| 6 | SSM Parameter Store | Store all secrets/configs securely (Enhancement #6) | 45 min |
| 7 | Full deployment test | `terraform apply` → verify all services running on AWS via EKS | 30 min |
| 8 | Demo Window Strategy | Immediate `terraform destroy` after grading to preserve $122 budget | 15 min |

**Day 9 Deliverable**: Entire system live on AWS via EKS (Terraform), managed cost efficiently

---

#### 📅 Day 10 — May 30 (Saturday): Fault Tolerance + Security Hardening

**Assignment Tasks Covered**: Task 3 (Full security), Task 5 (Full fault tolerance)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Circuit breaker implementation | Wrap service-to-service calls with circuit breaker logic | 1 hr |
| 2 | Retry with exponential backoff | Configure SQS retry policies + code-level retries | 45 min |
| 3 | DLQ monitoring | Dead letter queues with CloudWatch alarms on message count | 30 min |
| 4 | Encryption at rest | Enable KMS encryption on DynamoDB tables + S3 buckets | 30 min |
| 5 | GDPR endpoints | Data export (`GET /api/v1/users/me/data`) + deletion (`DELETE /api/v1/users/me`) | 1 hr |
| 6 | CORS + input validation | Sanitize all inputs, configure CORS properly | 30 min |
| 7 | Disaster recovery documentation | Document recovery procedures, backup strategies | 30 min |

**Day 10 Deliverable**: Production-grade security + fault tolerance fully implemented

---

### Phase 5: Testing & Monitoring (Day 11–12)

#### 📅 Day 11 — May 31 (Sunday): Testing Suite

**Assignment Tasks Covered**: Task 6 (Performance), Task 8 (Testing strategy)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Complete unit tests | All services — aim for 70%+ coverage | 1.5 hr |
| 2 | Integration tests | Cross-service API tests with Supertest | 1 hr |
| 3 | Postman collections | Organized by service, with test scripts + environment variables | 1 hr |
| 4 | Load testing (Artillery/k6) | 100+ concurrent users on booking flow | 1 hr |
| 5 | Stress testing | Find breaking point, document results | 30 min |
| 6 | Performance graphs | Latency, throughput, error rate charts | 30 min |

**Day 11 Deliverable**: Full test suite with results + performance graphs

---

#### 📅 Day 12 — June 1 (Monday): Monitoring + CI/CD

**Assignment Tasks Covered**: Task 7 (Monitoring), Enhancement #1 (CI/CD)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | CloudWatch custom dashboard | Widgets for all services — CPU, memory, errors, latency | 1 hr |
| 2 | CloudWatch alarms | High error rate, high latency, DLQ depth alerts → SNS | 45 min |
| 3 | X-Ray distributed tracing | Instrument all services with AWS X-Ray SDK | 1 hr |
| 4 | Structured logging | JSON logs with correlation IDs across services | 45 min |
| 5 | GitHub Actions CI/CD pipeline | Build → Test → Push to ECR → Deploy (Note: switch Dockerfiles back to npm ci) | 1.5 hr |
| 6 | Database seeding script | One command to populate demo data (Enhancement #7) | 30 min |

**Day 12 Deliverable**: Full monitoring dashboard + CI/CD pipeline running

---

### Phase 6: Documentation & Submission (Day 13–14)

#### 📅 Day 13 — June 2 (Tuesday): Swagger Docs + Report Writing

**Assignment Tasks Covered**: Deliverables (Report + API Docs)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | OpenAPI 3.0 spec | Complete API documentation for all endpoints | 1 hr |
| 2 | Swagger UI hosting | Live Swagger UI accessible from deployed system | 30 min |
| 3 | Architecture diagrams | Professional diagrams (draw.io) — system, sequence, deployment | 1.5 hr |
| 4 | Report — Architecture section | Design decisions, justifications, diagrams | 1 hr |
| 5 | Report — Security & compliance | Encryption, auth, GDPR, PCI-DSS approach | 1 hr |
| 6 | Report — Implementation overview | Service descriptions, tech choices, code highlights | 30 min |

**Day 13 Deliverable**: API docs complete + report 60% done

---

#### 📅 Day 14 — June 3 (Wednesday): Report Completion + Presentation

**Assignment Tasks Covered**: Deliverables (Report + Presentation)

| # | Task | Details | Time |
|---|------|---------|------|
| 1 | Report — Testing & performance | Test results, performance graphs, analysis | 1 hr |
| 2 | Report — Challenges & future improvements | Honest reflection + professional recommendations | 30 min |
| 3 | Report — Final review & formatting | PDF export, consistent formatting, table of contents | 30 min |
| 4 | Presentation slides (15 min) | Problem → Architecture → Demo → Results → Q&A | 1.5 hr |
| 5 | Demo rehearsal | Full system demo walkthrough — time it | 1 hr |
| 6 | Source code packaging | Clean up, README, ZIP for submission | 30 min |

**Day 14 Deliverable**: Report (PDF) + Presentation + Source code (ZIP) — all submission-ready

---

### 📅 Buffer Days — June 4–5 (Thursday–Friday)

| Task | Purpose |
|------|---------|
| Fix any bugs discovered | Last-minute issues |
| Polish report & slides | Final formatting |
| Final `terraform apply` test | Ensure everything deploys cleanly |
| Practice viva demo | Smooth, confident presentation |
| **Submit by June 5, 23:59** | 🎯 |

---

## Enhancement Integration Map

Shows exactly **which day** each enhancement gets built:

| # | Enhancement | Integrated On |
|---|------------|--------------|
| 1 | CI/CD Pipeline (GitHub Actions) | Day 12 |
| 2 | Health Check Endpoints | Day 2 (then every service) |
| 3 | API Versioning (`/api/v1/`) | Day 2 (then every service) |
| 4 | Rate Limiting & Throttling | Day 2 (then every service) |
| 5 | Docker Multi-Stage Builds | Day 1 |
| 6 | Centralized Config (SSM) | Day 9 |
| 7 | Database Seeding Scripts | Day 12 |

---

## Assignment Task Coverage Map

Shows exactly **which days** cover each assignment task:

| Assignment Task | Days Covered |
|----------------|-------------|
| Task 1: Cloud Architecture Design | Day 1, 2, 9 |
| Task 2: Distributed APIs & Communication | Day 2, 3, 4, 5, 6 |
| Task 3: Security & Compliance | Day 2, 4, 10 |
| Task 4: Real-Time Data Sync | Day 3, 5, 6, 7, 8 |
| Task 5: Fault Tolerance & Resilience | Day 9, 10 |
| Task 6: Performance Testing | Day 11 |
| Task 7: Monitoring & Observability | Day 12 |
| Task 8: Testing Strategy | Day 2–6 (unit), Day 11 (full) |
| **Enhancements (7)** | Day 1, 2, 9, 12 |
| **Report & Presentation** | Day 13, 14 |

---

## Verification Plan

### Automated Tests
- `npm test` per service — Jest unit tests (70%+ coverage target)
- `npm run test:integration` — Supertest cross-service tests
- Postman collection runner — automated API test suite
- Artillery load test — `artillery run load-test.yml`
- GitHub Actions — green pipeline on every push

### Manual Verification
- `terraform apply` → all services running on AWS
- `terraform destroy` → all services stopped (clean teardown)
- CloudWatch dashboard — all widgets showing data
- X-Ray — trace a booking request across all services
- Live demo — complete booking flow: search → book → pay → track baggage
- Chaos test — stop a service, verify circuit breaker + DLQ catches events

### Submission Checklist
- [ ] Report PDF — all sections complete
- [ ] Source code ZIP — all services, Terraform, Docker, API docs
- [ ] Presentation slides — 15-minute walkthrough
- [ ] System deployed and accessible on AWS for demo
- [ ] Demo data seeded and ready

> [!IMPORTANT]
> **Every day has a clear deliverable.** If you finish early, move to the next day. If you fall behind, the buffer days (June 4–5) are your safety net. The priority order in the analysis ensures you never miss a critical task even if time runs short.
