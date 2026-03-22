# Order_service

# Order Service – SE4010 Cloud Computing Assignment

> **Member 3 | Order Service** | Node.js + Express + MongoDB | AWS ECS Fargate + SQS

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Local Development Setup](#local-development-setup)
3. [AWS Setup Guide (Step-by-Step)](#aws-setup-guide)
4. [GitHub Actions Secrets Setup](#github-actions-secrets)
5. [SonarCloud Setup](#sonarcloud-setup)
6. [Deployment Flow](#deployment-flow)
7. [API Endpoints](#api-endpoints)
8. [Inter-Service Communication](#inter-service-communication)

---

## Project Structure

order-service/
├── src/
│ ├── config/
│ │ ├── database.js # MongoDB connection
│ │ ├── aws.js # SQS client setup
│ │ └── redis.js # Redis for caching (optional)
│ ├── controllers/
│ │ └── order.controller.js # Order CRUD operations
│ ├── middleware/
│ │ ├── auth.middleware.js # JWT + internal key auth
│ │ ├── errorHandler.js # Central error handling
│ │ └── validation.js # Request validation
│ ├── models/
│ │ ├── Order.js # Order schema
│ │ └── OrderItem.js # Order item schema
│ ├── routes/
│ │ └── order.routes.js # API routes
│ ├── services/
│ │ ├── order.service.js # Business logic
│ │ ├── user.service.js # HTTP client for User Service
│ │ ├── product.service.js # HTTP client for Product Service
│ │ └── sqs.service.js # SQS message publisher
│ ├── utils/
│ │ ├── logger.js # Winston logger
│ │ └── constants.js # Order status constants
│ ├── app.js # Express app
│ └── index.js # Entry point
├── tests/
│ └── order.test.js # Unit tests
├── .github/
│ └── workflows/
│ └── deploy.yml # CI/CD pipeline
├── Dockerfile # Multi-stage build
├── docker-compose.yml # Local development
├── swagger.yaml # OpenAPI specification
├── sonar-project.properties # SonarCloud config
├── package.json
├── .env.example
└── README.md




---

## Local Development Setup

### Prerequisites
- Node.js v20+
- MongoDB Atlas account (or local MongoDB)
- Docker Desktop (optional)
- AWS CLI (for production deployment)

### Step 1 – Clone and install dependencies
```bash
git clone https://github.com/<your-org>/order-service.git
cd order-service
npm install

### Step 2 – Clone and install dependencies
cp .env.example .env
# Edit .env with your values (see .env.example for all variables)



