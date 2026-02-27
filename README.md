# Secure Blog Platform

A production-ready monolithic-style decoupled blog platform built with NestJS (Backend) and Next.js 15 (Frontend). 
It features a secure authentication system, private dashboards, a public feed with pagination, and interactive comments and likes.

## Architecture

This project is decoupled into two primary applications interacting via a RESTful API.

- **Frontend (`/frontend`)**: Next.js 15 App Router application styled with Tailwind CSS. It uses Axios for API requests, Cookies for secure token storage, and React Context for global auth state management.
- **Backend (`/backend`)**: NestJS application acting as the master API provider.
   - **Database**: PostgreSQL (via Prisma ORM)
   - **Authentication**: JWT & Passport, hashed via bcrypt.
   - **Queue/Async Processing**: BullMQ (Redis) is used for computationally expensive operations, specifically a mock background job generating an AI summary when a blog is published.
   - **Security**: `@nestjs/throttler` protects API endpoints from brute force and DoS attacks. `@nestjs/passport` locks down protected dashboard and write-operation routes.
   - **Logging**: `nestjs-pino` is used for highly efficient, structured JSON logging.

## Setup Instructions

Ensure you have Node.js (v18+), npm/yarn, and Docker Desktop installed.

### 1. Database & Infrastructure

The project uses Docker to spin up PostgreSQL and Redis locally.

```bash
cd backend
docker-compose up -d
```

### 2. Backend Setup

Install dependencies, synchronize your database, and start the development server.

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```
The NestJS API will be running on `http://localhost:3001`.

### 3. Frontend Setup

In a new terminal window, initialize the Next.js client.

```bash
cd frontend
npm install
npm run dev
```
The Next.js App will be running on `http://localhost:3000`.

## Tradeoffs & Scaling to 1M Users

### Current Architecture Tradeoffs
1. **Monolithic Backend/Frontend**: While perfectly fine for smaller scale apps, routing all backend traffic through a single NestJS process limits vertical scalability. Microservices might be introduced later.
2. **Coupled DB Operations**: Prisma relies entirely on the Node.js event loop handling concurrent DB connections efficiently. In high load scenarios, database connection pooling limits will be hit quickly.
3. **State Management**: Using React Context for simple auth state is acceptable, but full client state management libraries (Zustand, Redux) cache responses better for complex data flows.

### Path to 1M Users
Scaling this application structure to handle 1M MAU requires infrastructure topology shifts rather than core logic rewrites.

1. **Database Layer (The likely first bottleneck)**:
   - Move from a single Postgres instance to an Active-Read Replica setup via pgBouncer or AWS RDS Proxy.
   - Add Redis caching layers around highly read endpoints (e.g. `/public/feed`, `/public/blogs/:slug`) to prevent database hits. NestJS CacheManager can easily be dropped in to handle this.
2. **Application Layer**:
   - Containerize both the NestJS API and Next.js Frontend using Docker and orchestrate with Kubernetes to allow horizontal pod autoscaling based on CPU/Memory thresholds.
   - Adopt a serverless platform (Vercel) for Next.js ensuring automatic global edge network distribution.
3. **Media Delivery**:
   - If images are introduced, they must be proxied through a CDN (Cloudflare/AWS CloudFront) instead of direct server transmission. 
4. **Queue Strategy**:
   - As BullMQ is already set up, background tasks (emails, summaries, analytics reporting) can easily be shifted out of the REST API request cycle. Dedicated worker nodes would consume these queues via Redis clusters.
