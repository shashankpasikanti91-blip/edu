# SRP Education AI — Setup & Deployment Guide

## Architecture Overview

```
SRP Education AI/
├── backend/                    # Express + TypeScript REST API (port 5000)
│   ├── prisma/
│   │   ├── schema.prisma       # 55-table PostgreSQL schema
│   │   └── seed.ts             # Seeds plans, add-ons, subjects, admin user
│   ├── src/
│   │   ├── app.ts              # Express app, middleware, route mounting
│   │   ├── server.ts           # HTTP server entry point
│   │   ├── config/             # env.ts, database.ts
│   │   ├── middleware/         # auth, rbac, tenant, validate, rateLimiter, errorHandler
│   │   └── modules/
│   │       ├── auth/           # Signup, login, JWT, sessions, password reset
│   │       ├── user/           # Profile, dashboard stats
│   │       ├── tenant/         # Multi-tenant management
│   │       ├── student/        # B2C dashboard, notes, study plans, referrals
│   │       ├── content/        # Content library CRUD
│   │       ├── subscription/   # Plans, billing, coupons, invoices
│   │       ├── addon/          # Add-on modules for institutions
│   │       ├── ai/             # OpenRouter AI chat integration
│   │       ├── analytics/      # Platform & tenant analytics
│   │       ├── audit/          # Audit log queries
│   │       ├── notification/   # In-app notifications
│   │       ├── branding/       # Tenant branding (logo, colors, subdomain)
│   │       ├── payment/        # Razorpay & Stripe payment processing
│   │       └── upload/         # Secure file uploads
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # Next.js 14 + TypeScript + Tailwind CSS (port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Landing page
│   │   │   ├── login/                  # Login
│   │   │   ├── signup/                 # Signup (student + institution modes)
│   │   │   ├── forgot-password/        # Password reset
│   │   │   ├── pricing/               # Pricing (plans + add-ons)
│   │   │   ├── about/                 # About page
│   │   │   ├── contact/               # Contact form
│   │   │   ├── terms/                 # Terms of Service
│   │   │   ├── privacy/              # Privacy Policy
│   │   │   └── dashboard/
│   │   │       ├── page.tsx            # Role-based dashboard + sidebar
│   │   │       ├── ai-assistant/       # AI chat interface
│   │   │       ├── exam-prep/          # Quiz & exam prep
│   │   │       ├── notes/              # Notes CRUD
│   │   │       ├── planner/            # Study plan manager
│   │   │       ├── progress/           # Progress tracking
│   │   │       ├── resources/          # Resource library
│   │   │       ├── referrals/          # Referral system
│   │   │       ├── billing/            # Billing dashboard
│   │   │       ├── notifications/      # Notification center
│   │   │       ├── wellness/           # Pomodoro timer + wellness
│   │   │       ├── analytics/          # Admin analytics
│   │   │       ├── addons/             # Add-on management
│   │   │       ├── branding/           # Tenant branding
│   │   │       ├── settings/           # Profile settings
│   │   │       └── tenants/            # Super admin tenant management
│   │   ├── lib/api.ts          # Axios client with token refresh
│   │   ├── store/authStore.ts  # Zustand auth state
│   │   └── types/index.ts      # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # PostgreSQL + Backend + Frontend
└── readme.md                   # Product specification
```

## Tech Stack

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | Next.js 14, React 18, TypeScript, Tailwind CSS |
| State       | Zustand                                        |
| Forms       | React Hook Form + Zod validation               |
| Backend     | Express.js, TypeScript                         |
| Database    | PostgreSQL 16 + Prisma ORM (55 tables)         |
| Auth        | JWT (access 15m + refresh 7d), Argon2id        |
| AI          | OpenRouter API (GPT-4.1 primary, GPT-4o fallback) |
| Payments    | Razorpay + Stripe (mock in dev)                |
| Email       | Nodemailer (SMTP)                              |
| Security    | Helmet, CORS, HPP, rate limiting               |
| Deployment  | Docker + Docker Compose                        |

## Prerequisites

- Node.js >= 20.x
- Docker & Docker Compose (for PostgreSQL)
- npm

## Quick Start (Local Development)

### 1. Start PostgreSQL

```bash
docker compose up db -d
```

This starts PostgreSQL 16 on port **5433** (mapped from 5432 inside container).

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment

```bash
# Backend — copy and edit
cd backend
cp .env.example .env
# Edit DATABASE_URL to: postgresql://postgres:postgres@localhost:5433/srp_education_ai
# Generate JWT secrets (see below)

# Frontend — copy and edit
cd ../frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

**Generate secure JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Set up database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npx ts-node prisma/seed.ts
```

### 5. Start development servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Visit **http://localhost:3000** in your browser.

## Docker Deployment (Full Stack)

```bash
cd "SRP Education AI"

# Build and start all services
docker compose up --build -d

# Run database setup
docker compose exec backend npx prisma db push
docker compose exec backend npx ts-node prisma/seed.ts
```

Services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5433

## API Endpoints (v1)

### Authentication
| Method | Endpoint                       | Description              | Auth |
|--------|--------------------------------|--------------------------|------|
| POST   | `/api/v1/auth/signup`          | Create new account       | No   |
| POST   | `/api/v1/auth/login`           | Login                    | No   |
| POST   | `/api/v1/auth/refresh-token`   | Refresh JWT tokens       | No   |
| POST   | `/api/v1/auth/forgot-password` | Request password reset   | No   |
| POST   | `/api/v1/auth/reset-password`  | Reset password           | No   |
| POST   | `/api/v1/auth/verify-email`    | Verify email address     | No   |
| POST   | `/api/v1/auth/logout`          | Logout current session   | Yes  |
| POST   | `/api/v1/auth/logout-all`      | Logout all devices       | Yes  |
| GET    | `/api/v1/auth/sessions`        | List active sessions     | Yes  |
| GET    | `/api/v1/auth/me`              | Get current user         | Yes  |

### Users
| Method | Endpoint                   | Description          | Auth |
|--------|----------------------------|----------------------|------|
| GET    | `/api/v1/users/profile`    | Get user profile     | Yes  |
| PATCH  | `/api/v1/users/profile`    | Update profile       | Yes  |
| GET    | `/api/v1/users/dashboard`  | Get dashboard stats  | Yes  |

### Students (B2C)
| Method | Endpoint                          | Description              | Auth |
|--------|-----------------------------------|--------------------------|------|
| GET    | `/api/v1/students/dashboard`      | Student dashboard data   | Yes  |
| PUT    | `/api/v1/students/profile`        | Update student profile   | Yes  |
| GET    | `/api/v1/students/progress`       | Progress summary         | Yes  |
| GET    | `/api/v1/students/referrals`      | Referral info            | Yes  |
| POST   | `/api/v1/students/referrals/invite` | Send referral invite   | Yes  |
| POST   | `/api/v1/students/link-institution` | Link to institution    | Yes  |
| GET    | `/api/v1/students/notes`          | List notes               | Yes  |
| POST   | `/api/v1/students/notes`          | Create note              | Yes  |
| GET    | `/api/v1/students/notes/:id`      | Get note                 | Yes  |
| PATCH  | `/api/v1/students/notes/:id`      | Update note              | Yes  |
| DELETE | `/api/v1/students/notes/:id`      | Delete note              | Yes  |
| GET    | `/api/v1/students/plans`          | List study plans         | Yes  |
| POST   | `/api/v1/students/plans`          | Create study plan        | Yes  |
| PATCH  | `/api/v1/students/plans/:id`      | Update study plan        | Yes  |
| DELETE | `/api/v1/students/plans/:id`      | Delete study plan        | Yes  |

### Subscriptions
| Method | Endpoint                                | Description              | Auth  |
|--------|-----------------------------------------|--------------------------|-------|
| GET    | `/api/v1/subscriptions/plans`           | List all plans           | Yes   |
| GET    | `/api/v1/subscriptions/plans/:id`       | Get plan details         | Yes   |
| POST   | `/api/v1/subscriptions/plans`           | Create plan              | Admin |
| PUT    | `/api/v1/subscriptions/plans/:id`       | Update plan              | Admin |
| DELETE | `/api/v1/subscriptions/plans/:id`       | Deactivate plan          | Admin |
| GET    | `/api/v1/subscriptions`                 | Get subscription         | Yes   |
| POST   | `/api/v1/subscriptions`                 | Create subscription      | Yes   |
| POST   | `/api/v1/subscriptions/:id/renew`       | Renew subscription       | Yes   |
| POST   | `/api/v1/subscriptions/:id/upgrade`     | Upgrade plan             | Yes   |
| POST   | `/api/v1/subscriptions/:id/cancel`      | Cancel subscription      | Yes   |
| GET    | `/api/v1/subscriptions/billing/dashboard` | Billing overview       | Yes   |

### Add-Ons
| Method | Endpoint                          | Description              | Auth  |
|--------|-----------------------------------|--------------------------|-------|
| GET    | `/api/v1/addons/modules`          | List available add-ons   | No    |
| GET    | `/api/v1/addons/tenant`           | Get tenant's add-ons     | Yes   |
| GET    | `/api/v1/addons/tenant/check/:slug` | Check if add-on active | Yes   |
| GET    | `/api/v1/addons/tenant/billing`   | Add-on billing summary   | Yes   |
| POST   | `/api/v1/addons/tenant/activate`  | Activate add-on          | Admin |
| POST   | `/api/v1/addons/tenant/deactivate` | Deactivate add-on       | Admin |

### AI Assistant
| Method | Endpoint                           | Description              | Auth |
|--------|------------------------------------|--------------------------|------|
| GET    | `/api/v1/ai/chats`                 | List chat sessions       | Yes  |
| POST   | `/api/v1/ai/chats`                 | Create new chat          | Yes  |
| GET    | `/api/v1/ai/chats/:id/messages`    | Get chat messages        | Yes  |
| POST   | `/api/v1/ai/chats/:id/messages`    | Send message             | Yes  |
| DELETE | `/api/v1/ai/chats/:id`             | Delete chat              | Yes  |
| POST   | `/api/v1/ai/quick-query`           | Single-shot AI query     | Yes  |

### Tenants
| Method | Endpoint                        | Description              | Auth       |
|--------|---------------------------------|--------------------------|------------|
| GET    | `/api/v1/tenants`               | List tenants             | SuperAdmin |
| POST   | `/api/v1/tenants`               | Create tenant            | SuperAdmin |
| GET    | `/api/v1/tenants/:id`           | Get tenant details       | Admin      |
| PATCH  | `/api/v1/tenants/:id`           | Update tenant            | Admin      |
| POST   | `/api/v1/tenants/:id/activate`  | Activate tenant          | SuperAdmin |
| POST   | `/api/v1/tenants/:id/suspend`   | Suspend tenant           | SuperAdmin |

### Analytics
| Method | Endpoint                          | Description              | Auth       |
|--------|-----------------------------------|--------------------------|------------|
| GET    | `/api/v1/analytics/platform`      | Platform-wide metrics    | SuperAdmin |
| GET    | `/api/v1/analytics/tenant/:id`    | Tenant metrics           | Admin      |

### Other Modules
| Module        | Base Path               | Description                      |
|---------------|-------------------------|----------------------------------|
| Notifications | `/api/v1/notifications` | In-app notification management   |
| Content       | `/api/v1/content`       | Content library CRUD             |
| Branding      | `/api/v1/branding`      | Tenant branding customization    |
| Payments      | `/api/v1/payments`      | Razorpay/Stripe payment handling |
| Uploads       | `/api/v1/uploads`       | File upload management           |
| Audit         | `/api/v1/audit`         | Audit log queries                |
| Health        | `/api/v1/health`        | API health check                 |

## Security Features

- **Password hashing**: Argon2id with memory-hard settings
- **JWT tokens**: Short-lived access tokens (15 min) + rotating refresh tokens (7 days)
- **Rate limiting**: Global (100 req/15min) + auth endpoints (20 req/15min)
- **Account lockout**: 5 failed attempts → 30 minute lock
- **Input validation**: Zod schemas on all endpoints
- **HTTP security**: Helmet (CSP, HSTS, X-Frame-Options, etc.)
- **CORS**: Restricted to frontend origin
- **HPP**: HTTP parameter pollution protection
- **Tenant isolation**: Middleware enforces tenant boundaries on all queries
- **RBAC**: Role-based access control with 7 roles
- **Audit logging**: All auth events logged with IP + user agent
- **Email enumeration prevention**: Forgot password always returns success

## Seeded Data

After running the seed script:

| Data                | Details                                        |
|---------------------|------------------------------------------------|
| Super Admin         | admin@srpeducation.ai / Admin@12345            |
| Institution Owner   | owner@demoschool.edu / Owner@12345             |
| Demo Tenant         | Demo International School                      |
| B2C Student Plans   | Free (₹0), Pro (₹149/mo), Premium (₹399/mo)   |
| B2B Institution Plans | Starter (₹9,999), Growth (₹24,999), University (₹79,999), Enterprise (custom) |
| Add-On Modules      | 8 modules (Attendance, Billing, Parent Portal, Transport, Fee Reminder, WhatsApp, LMS, AI Analytics) |
| Subjects            | Mathematics, Physics, Chemistry, Biology, English, Computer Science |
| Coupons             | LAUNCH50 (50% off), SCHOOL20 (20% off)        |

> **Important**: Change default passwords immediately in production.

## Environment Variables

| Variable                 | Description                                    | Required |
|--------------------------|------------------------------------------------|----------|
| `DATABASE_URL`           | PostgreSQL connection string                   | Yes      |
| `JWT_ACCESS_SECRET`      | JWT access token signing secret (32+ chars)    | Yes      |
| `JWT_REFRESH_SECRET`     | JWT refresh token signing secret (32+ chars)   | Yes      |
| `PORT`                   | Backend server port (default: 5000)            | No       |
| `FRONTEND_URL`           | Frontend URL for CORS (default: http://localhost:3000) | No |
| `OPENROUTER_API_KEY`     | OpenRouter API key for AI features             | Yes      |
| `OPENROUTER_MODEL`       | Primary AI model (default: openai/gpt-4.1)     | No       |
| `SMTP_HOST`              | Email SMTP host                                | No       |
| `SMTP_USER`              | Email SMTP username                            | No       |
| `SMTP_PASS`              | Email SMTP password                            | No       |
| `RAZORPAY_KEY_ID`        | Razorpay key (for payments)                    | No       |
| `STRIPE_SECRET_KEY`      | Stripe secret key (for payments)               | No       |
| `NEXT_PUBLIC_API_URL`    | Backend API URL for frontend                   | Yes      |
| `NEXT_PUBLIC_APP_NAME`   | Application display name                       | No       |
