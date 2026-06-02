# AeroLink Platform — Final Report Structure Plan

---

## Table of Contents

### Front Matter
- Cover Page (Module name, student name, ID, date, word count)
- Table of Contents
- List of Figures
- List of Tables
- List of Abbreviations (JWT, RBAC, EKS, VPC, API, etc.)

---

### 1. Introduction *(~1 page)*
- 1.1 Background & Problem Statement
  - AeroLink's monolithic limitations (downtime, scaling bottlenecks, single point of failure)
  - Business drivers for cloud-native migration
- 1.2 Aims & Objectives
  - What the project sets out to achieve (map directly to the 8 tasks)
- 1.3 Scope
  - Which AeroLink services were implemented (flight booking, baggage tracking, check-in, etc.)
- 1.4 Technologies Used
  - Quick summary table: Node.js, React, DynamoDB, Docker, Kubernetes, Terraform, Nginx, Socket.IO, Artillery, Jest

---

### 2. Cloud-Based Web Application Design *(Task 1) (~4-5 pages)*
- 2.1 Architecture Overview
  - High-level description of the microservices architecture
  - **Include:** Full architecture diagram (the one we generated)
- 2.2 Microservices Breakdown
  - Table listing each service, its responsibility, port, and database table
  - `auth-service`, `flight-service`, `booking-service`, `baggage-service`, `websocket-service`, `notification-service (Lambda)`
- 2.3 Containerisation
  - Docker: Explain each Dockerfile and `docker-compose.yml`
  - Kubernetes: Explain `k8s-manifests/` — Deployments, Services, HPA
  - **Include:** Screenshot of `docker-compose up` running all services
- 2.4 Serverless Computing
  - AWS Lambda for the Notification Service
  - Explain the Terraform Lambda module and its event trigger
  - **Include:** Code snippet of `notification-service/src/handler.js`
- 2.5 Cloud-Managed Databases
  - Amazon DynamoDB: tables (`aerolink-users`, `aerolink-flights`, `aerolink-bookings`)
  - Why NoSQL was chosen (schema flexibility, low-latency key lookups, pay-per-request)
  - **Include:** Screenshot of DynamoDB local scan or table structure
- 2.6 High Availability & Multi-Region Deployment
  - VPC across 2 Availability Zones (Terraform `networking` module)
  - EKS with auto-scaling node groups (min 1, max 10)
  - Explain how multi-AZ prevents single-zone failure
  - **Include:** Terraform `main.tf` snippet showing AZ configuration
- 2.7 Horizontal Scalability
  - Kubernetes HPA (Horizontal Pod Autoscaler) in `k8s-manifests/`
  - EKS node group scaling policies
  - Stateless microservices design enabling infinite horizontal scale

---

### 3. Distributed Web Application and API Design *(Task 2) (~3-4 pages)*
- 3.1 RESTful API Design
  - Table of all API endpoints (method, path, description, service)
  - REST conventions followed (resource-based URLs, proper HTTP status codes)
  - **Include:** Screenshot of Swagger UI at `/api/v1/auth/api-docs`
- 3.2 Event-Driven Architecture
  - AWS EventBridge (simulated locally via SNS/SQS pattern)
  - Events published: `flight.created`, `booking.confirmed`, `booking.failed`, `booking.cancelled`, `booking.checked_in`
  - **Include:** Code snippet from `eventBridge.js` showing `publishEvent()`
- 3.3 API Gateway
  - Nginx as the API Gateway: routing, reverse proxy, rate limiting
  - **Include:** Key sections of `nginx.conf` showing `/api/v1/` routing rules
- 3.4 API Documentation (Swagger / OpenAPI)
  - `openapi.yaml` specification
  - Swagger UI integration via `swagger-jsdoc` + `swagger-ui-express`
  - **Include:** Screenshot of Postman collection imported from `openapi.yaml`
- 3.5 Secure Service-to-Service Communication
  - Internal Docker network isolation
  - Services communicate via internal DNS (`http://flight-service:3000`)
  - JWT token forwarded between services for authenticated calls

---

### 4. Data Security, Compliance, and Consistency *(Task 3) (~3-4 pages)*
- 4.1 Authentication & Authorisation
  - JWT-based authentication flow (register → login → token → protected routes)
  - Role-Based Access Control (RBAC): `admin` vs `user` roles
  - **Include:** Code snippet of JWT middleware and `ProtectedRoute` component
- 4.2 Encryption
  - At rest: DynamoDB server-side encryption (AES-256, AWS managed keys)
  - In transit: HTTPS/TLS termination at the API Gateway level
  - Password hashing: `bcrypt` with salt rounds
  - **Include:** Code snippet of bcrypt usage in `auth.js`
- 4.3 Compliance Considerations
  - GDPR: Right to deletion (cancel booking), data minimisation, consent
  - PCI-DSS: Payment data never stored; simulated payment gateway with tokenised transactions
- 4.4 Data Consistency in Distributed Systems
  - The CAP Theorem and why eventual consistency was chosen
  - **Saga Pattern Implementation** — detailed walkthrough:
    - Step 1: Create PENDING booking
    - Step 2: Process payment via Circuit Breaker
    - Step 3: Confirm booking or ROLLBACK
    - Step 4: Publish event to sync other services
  - **Include:** Full code walkthrough of `booking.js` Saga logic with annotations
  - **Include:** Screenshot of the Saga Pattern UI executing in the frontend

---

### 5. Real-Time Data Synchronisation *(Task 4) (~2-3 pages)*
- 5.1 WebSocket Implementation
  - `websocket-service` using Socket.IO
  - Real-time events: `seat_locked`, `join_flight`, `join_baggage`, `status_update`
  - **Include:** Code snippet of WebSocket event handlers
- 5.2 Live Seat Availability
  - When User A locks a seat, User B sees it turn red instantly
  - Prevents double-booking at the UI level before it even hits the API
  - **Include:** Screenshot showing the seat map with locked/booked seats
- 5.3 Live Baggage Tracking
  - Admin updates baggage status → WebSocket pushes to user's tracking page
  - Timeline UI updates in real-time without page refresh
  - **Include:** Screenshot of the baggage tracking timeline
- 5.4 Event-Driven Synchronisation
  - EventBridge propagates booking events to Flight Service for seat count sync
  - Explain the eventual consistency model and acceptable latency window

---

### 6. Fault Tolerance and Resilience *(Task 5) (~3 pages)*
- 6.1 Circuit Breaker Pattern
  - Implementation using `opossum` library in `booking-service`
  - Configuration: 3s timeout, 50% error threshold, 10s reset
  - Fallback mechanism when payment gateway is down
  - Events logged: `open`, `halfOpen`, `close`
  - **Include:** Code snippet of circuit breaker setup and event listeners
- 6.2 Saga Pattern Rollbacks
  - Compensation logic: if payment fails → booking status set to FAILED
  - Failure event published so downstream services don't process stale data
  - **Include:** Screenshot of the "Saga Rollback Triggered" UI
- 6.3 Auto-Scaling & Load Balancing
  - Kubernetes HPA: CPU-based auto-scaling
  - EKS node group: min 1, max 10 nodes
  - Nginx upstream load balancing across service replicas
- 6.4 High Availability & Disaster Recovery
  - Multi-AZ VPC (2 AZs with public + private subnets)
  - DynamoDB: built-in replication and 99.999% availability SLA
  - Stateless services: any pod can be killed and replaced instantly

---

### 7. Performance and Scalability Testing *(Task 6) (~2-3 pages)*
- 7.1 Load Testing
  - Tool: Artillery (`loadtest.yml`)
  - Configuration: ramp-up from 5 to 45 users/sec over 90 seconds
  - **Include:** Screenshot of Artillery terminal output
- 7.2 Results Analysis
  - Table of key metrics:

  | Metric | Value |
  |--------|-------|
  | Total Requests | 2,700 |
  | Request Rate | 35/sec |
  | p95 Response Time | 4ms |
  | p99 Response Time | 6ms |
  | Failed Users | 0 |
  | Total Duration | 1 min 34 sec |

- 7.3 Stress Testing Discussion
  - What happens when load exceeds capacity (circuit breaker opens, HPA scales pods)
  - Theoretical analysis of breaking point based on Artillery data
- 7.4 Performance Improvements
  - Caching layer (Redis/ElastiCache) for flight data
  - CDN (CloudFront) for static frontend assets
  - Database read replicas for read-heavy queries

---

### 8. Monitoring and Observability *(Task 7) (~2 pages)*
- 8.1 AWS CloudWatch Integration
  - Terraform `monitoring` module: dashboard, alarms, log groups
  - Metrics tracked: CPU, memory, request count, error rates
  - **Include:** Terraform code snippet of CloudWatch dashboard definition
- 8.2 Health Check Endpoints
  - Every microservice exposes `/health` returning `{ status: 'healthy' }`
  - Used by Kubernetes liveness/readiness probes and load balancer checks
  - **Include:** Code snippet of health endpoint
- 8.3 Application Logging
  - `console.log` / `console.error` structured logging in each service
  - Saga state machine logs: `[SAGA] Step 1:`, `[SAGA ROLLBACK]`
  - Circuit breaker state transition logs: `[CIRCUIT BREAKER] 🚨 OPEN!`
- 8.4 Distributed Tracing
  - Discuss how AWS X-Ray could be integrated for full request tracing
  - Current approach: correlation via `bookingId` across services and events

---

### 9. Testing Strategy *(Task 8) (~2-3 pages)*
- 9.1 Unit Testing
  - Jest framework for `flight-service`
  - Tests: CRUD operations, error handling, edge cases
  - **Include:** Screenshot of `npm test` passing output
- 9.2 Integration Testing
  - Docker Compose as the integration test harness (all services + DB running together)
  - End-to-end flow: register → login → search → book → check-in → track baggage
- 9.3 API Testing (Postman)
  - Imported `openapi.yaml` into Postman
  - Tested: `GET /flights` (200 OK), `POST /bookings` (409 Conflict for duplicate seat)
  - **Include:** Screenshot of Postman showing 200 success response
  - **Include:** Screenshot of Postman showing 409 conflict response
- 9.4 Performance Testing
  - Cross-reference to Section 7 (Artillery results)
- 9.5 Test Summary Table

  | Test Type | Tool | Scope | Result |
  |-----------|------|-------|--------|
  | Unit | Jest | flight-service CRUD | ✅ All Passing |
  | API | Postman | All REST endpoints | ✅ 200/409 verified |
  | Load | Artillery | API Gateway throughput | ✅ 0 failures, 4ms p95 |
  | Integration | Docker Compose | Full system E2E | ✅ All services healthy |

---

### 10. Challenges and Future Improvements *(~1-2 pages)*
- 10.1 Challenges Faced
  - DynamoDB local vs cloud authentication differences
  - WebSocket connection management across multiple containers
  - Saga pattern complexity in distributed transactions
  - Keeping microservices loosely coupled while maintaining data consistency
- 10.2 Future Improvements
  - Redis caching layer for frequently queried flight data
  - AWS CloudFront CDN for the React frontend
  - AWS X-Ray for full distributed tracing
  - CI/CD pipeline (GitHub Actions → ECR → EKS)
  - Multi-region active-active deployment with DynamoDB Global Tables
  - GraphQL API layer for more flexible client queries

---

### 11. Conclusion *(~0.5 page)*
- Summary of what was achieved
- How the system addresses AeroLink's requirements
- Reflection on learning outcomes

---

### References
- Use Harvard referencing style
- AWS documentation, Docker docs, Kubernetes docs, OWASP, GDPR articles, academic papers on Saga pattern, CAP theorem, etc.

### Appendices
- Appendix A: Full `openapi.yaml` specification
- Appendix B: `docker-compose.yml`
- Appendix C: Terraform configuration files
- Appendix D: Full Artillery load test results (`performance_report.json`)

---

## Quick Mapping: Sections → Assignment Tasks

| Assignment Task | Report Section(s) |
|---|---|
| Task 1: Cloud Architecture | Section 2 |
| Task 2: Distributed APIs | Section 3 |
| Task 3: Security & Consistency | Section 4 |
| Task 4: Real-Time Sync | Section 5 |
| Task 5: Fault Tolerance | Section 6 |
| Task 6: Performance Testing | Section 7 |
| Task 7: Monitoring | Section 8 |
| Task 8: Testing Strategy | Section 9 |

> [!TIP]
> Each section should contain **at least one code snippet**, **one screenshot**, and **one explanation paragraph** that ties it back to the AeroLink case study scenario. This is what separates a first-class submission from a generic one.
