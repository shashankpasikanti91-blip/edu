# SRP Education AI

**AI-powered multi-tenant education platform for students, institutions, and teachers.**

Built by **SRP AI Labs** — Student Success & Institutional Intelligence Platform.

| | |
|---|---|
| **Live URL** | [https://edu.srpailabs.com](https://edu.srpailabs.com) |
| **VPS** | Hostinger — 5.223.67.236 |
| **Deploy path** | `/var/www/srp-edu` |
| **Backend port** | `5050` (internal `5000`) |
| **Frontend port** | `3020` (internal `3000`) |
| **DB port** | `5435` (localhost-only) |
| **CI/CD** | GitHub Actions → SSH deploy on push to `main` |

---

## Overview

SRP Education AI is a production-grade SaaS platform that serves two parallel business models:

- **B2B (Institution Model):** Schools, colleges, coaching centers, and universities onboard as isolated tenants with full management dashboards, branding, analytics, and add-on modules.
- **B2C (Direct Student Model):** Individual students sign up directly for a personal AI-powered study dashboard with auto-generated student IDs, referral codes, and optional institution linking.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| State Management | Zustand |
| Forms | React Hook Form + Zod validation |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL 16 + Prisma ORM (64 models, 22 enums) |
| Authentication | JWT (access 15min + refresh 7d), Argon2id password hashing |
| AI Engine | OpenRouter API (GPT-4.1 primary, GPT-4o fallback) |
| Payments | Razorpay (India) + Stripe (International) |
| Email | Nodemailer (SMTP) |
| Security | Helmet, CORS, HPP, rate limiting, tenant isolation |
| Deployment | Docker multi-stage builds, Nginx reverse proxy, Cloudflare SSL |
| Hosting | Hostinger VPS (5.223.67.236) |

---

## Project Structure

```
SRP Education AI/
├── backend/                        # Express + TypeScript REST API
│   ├── Dockerfile                  # Multi-stage Node 20 Alpine build
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma           # 64-model PostgreSQL schema
│   │   └── seed.ts                 # Seeds plans, add-ons, subjects, admin
│   └── src/
│       ├── app.ts                  # Express app, middleware, routes
│       ├── server.ts               # HTTP server entry point
│       ├── config/
│       │   ├── database.ts         # Prisma client singleton
│       │   └── env.ts              # Environment config
│       ├── middleware/
│       │   ├── auth.ts             # JWT verification
│       │   ├── rbac.ts             # Role-based access control
│       │   ├── tenant.ts           # Tenant isolation
│       │   ├── validate.ts         # Zod request validation
│       │   ├── rateLimiter.ts      # Rate limiting
│       │   └── errorHandler.ts     # Global error handler
│       ├── modules/                # 16 feature modules
│       │   ├── auth/               # Signup, login, JWT, sessions, reset
│       │   ├── user/               # Profile, dashboard stats
│       │   ├── tenant/             # Multi-tenant CRUD
│       │   ├── institution/        # Institution management + sub-users
│       │   ├── student/            # B2C dashboard, notes, plans, referrals
│       │   ├── content/            # Content library CRUD
│       │   ├── subscription/       # Plans, billing, coupons, invoices
│       │   ├── addon/              # Add-on modules for institutions
│       │   ├── ai/                 # OpenRouter AI chat + quick queries
│       │   ├── analytics/          # Platform & tenant analytics
│       │   ├── audit/              # Audit log queries
│       │   ├── notification/       # In-app notifications
│       │   ├── branding/           # Tenant branding
│       │   ├── payment/            # Razorpay & Stripe processing
│       │   ├── taxonomy/           # Academic boards, streams, subjects
│       │   └── upload/             # Secure file uploads
│       └── shared/
│           ├── constants/
│           ├── errors/
│           ├── services/
│           ├── types/
│           └── utils/
├── frontend/                       # Next.js 14 + Tailwind CSS
│   ├── Dockerfile                  # Multi-stage standalone build
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── components/
│       │   ├── Navbar.tsx           # Shared navigation
│       │   └── Footer.tsx           # Shared footer
│       ├── lib/
│       │   ├── api.ts              # Axios client with token refresh
│       │   ├── utils.ts            # Utility functions
│       │   └── mathRenderer.tsx    # KaTeX math rendering
│       ├── store/
│       │   └── authStore.ts        # Zustand auth state
│       ├── types/
│       │   └── index.ts            # TypeScript interfaces
│       └── app/
│           ├── layout.tsx          # Root layout
│           ├── globals.css         # Global styles + Tailwind
│           ├── page.tsx            # Landing page
│           ├── login/              # Login
│           ├── signup/             # Signup (student + institution)
│           ├── forgot-password/    # Password reset
│           ├── pricing/            # Plans, add-ons, comparison table
│           ├── about/              # About page
│           ├── contact/            # Contact form
│           ├── terms/              # Terms of Service
│           ├── privacy/            # Privacy Policy
│           └── dashboard/          # Protected area (25 sub-routes)
│               ├── layout.tsx      # Sidebar navigation
│               ├── page.tsx        # Role-based dashboard
│               ├── ai-assistant/   # AI chat
│               ├── exam-prep/      # Quiz & exam prep
│               ├── notes/          # Notes CRUD
│               ├── planner/        # Study plans
│               ├── progress/       # Progress tracking
│               ├── resources/      # Resource library
│               ├── referrals/      # Referral system
│               ├── billing/        # Billing dashboard
│               ├── notifications/  # Notifications
│               ├── wellness/       # Pomodoro + wellness
│               ├── analytics/      # Admin analytics
│               ├── addons/         # Add-on management
│               ├── branding/       # Tenant branding
│               ├── settings/       # Profile settings
│               ├── admin/          # Admin controls
│               ├── tenants/        # Super admin tenant mgmt
│               ├── manage-users/   # User management
│               ├── departments/    # Departments
│               ├── files/          # File management
│               ├── academic-profile/
│               ├── current-affairs/
│               ├── dictionary/
│               └── onboarding/     # Institution setup wizard
├── nginx/
│   └── edu.srpailabs.com.conf      # Nginx reverse proxy config
├── docker-compose.yml              # Development stack
├── docker-compose.prod.yml         # Production stack
├── SETUP.md                        # Setup & deployment guide
└── readme.md                       # This file
```

---

## Features

### Authentication & Security
- Email/password signup and login with Argon2id hashing
- JWT access tokens (15min) + rotating refresh tokens (7d)
- Email verification and password reset flows
- Session management with multi-device tracking
- Account lockout after 5 failed attempts (30min lock)
- Rate limiting: global (100 req/15min) + auth (20 req/15min)
- Full audit logging with IP + user agent
- Email enumeration prevention on password reset

### Multi-Tenant Architecture
- Strict tenant data isolation enforced via middleware
- Tenant types: School, College, University, Coaching Institute, Training Center
- Custom branding per tenant (logo, colors, subdomain)
- Tenant-aware queries across all modules

### Role-Based Access Control (7 Roles)
| Role | Scope |
|------|-------|
| Super Admin | Platform-wide management |
| Institution Owner | Full tenant management |
| Institution Admin | Tenant administration |
| Department Admin | Department-scoped |
| Teacher | Class/subject-scoped |
| Student | Self-scoped |
| Parent | Linked student scope |

### AI Study Assistant
- Persistent chat sessions with full history
- Quick single-shot queries
- Educational system prompt with guardrails
- Context-aware responses (last 20 messages)
- Auto-generated chat titles
- Model fallback (GPT-4.1 → GPT-4o)

### Student Features (B2C)
- Auto-generated student IDs (`IND-STU-000001`)
- Personal referral codes
- Notes, study plans, progress tracking
- Quiz engine and exam prep
- AI tutor access
- Pomodoro timer and wellness tools
- KaTeX math rendering in AI responses

### Institution Features (B2B)
- White-label branding (logo, colors, subdomain)
- Student & teacher management
- Department and course organization
- Content library with approval workflow
- Add-on module marketplace
- Analytics dashboard
- Institution onboarding wizard

### Subscription & Payments

**Student Plans:**

| Plan | Price | Key Features |
|------|-------|--------------|
| Free | ₹0/mo | Basic AI, 3 quizzes/mo, 100MB notes |
| Pro | ₹149/mo | Unlimited AI & quizzes, study planner, analytics |
| Career Premium | ₹399/mo | Everything + IELTS/GRE prep, resume builder, placement tools |

**Institution Plans:**

| Plan | Price | Users |
|------|-------|-------|
| School Starter | ₹9,999/mo | Up to 300 |
| Campus Growth | ₹24,999/mo | Up to 1,000 |
| University Pro | ₹79,999/mo | Up to 5,000 |
| Enterprise | Custom | Unlimited |

**Add-On Modules (8):**

| Module | Price |
|--------|-------|
| Attendance Tracker | ₹499/mo |
| Billing & Finance | ₹999/mo |
| Parent Portal | ₹299/mo |
| Transport Manager | ₹399/mo |
| Fee Reminder | ₹199/mo |
| WhatsApp Integration | ₹599/mo |
| LMS Module | ₹799/mo |
| AI Analytics | ₹699/mo |

Annual billing saves ~17% (2 months free).

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/v1/auth/signup` | No |
| POST | `/api/v1/auth/login` | No |
| POST | `/api/v1/auth/refresh-token` | No |
| POST | `/api/v1/auth/forgot-password` | No |
| POST | `/api/v1/auth/reset-password` | No |
| POST | `/api/v1/auth/verify-email` | No |
| POST | `/api/v1/auth/logout` | Yes |
| POST | `/api/v1/auth/logout-all` | Yes |
| GET | `/api/v1/auth/sessions` | Yes |
| GET | `/api/v1/auth/me` | Yes |

### Users & Students
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/users/profile` | Yes |
| PATCH | `/api/v1/users/profile` | Yes |
| GET | `/api/v1/users/dashboard` | Yes |
| GET | `/api/v1/students/dashboard` | Yes |
| GET/POST | `/api/v1/students/notes` | Yes |
| GET/POST | `/api/v1/students/plans` | Yes |
| GET | `/api/v1/students/referrals` | Yes |
| POST | `/api/v1/students/referrals/invite` | Yes |

### Subscriptions & Billing
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/subscriptions/plans` | Yes |
| POST | `/api/v1/subscriptions` | Yes |
| POST | `/api/v1/subscriptions/:id/renew` | Yes |
| POST | `/api/v1/subscriptions/:id/upgrade` | Yes |
| POST | `/api/v1/subscriptions/:id/cancel` | Yes |
| GET | `/api/v1/subscriptions/billing/dashboard` | Yes |

### AI Assistant
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/ai/chats` | Yes |
| POST | `/api/v1/ai/chats` | Yes |
| GET | `/api/v1/ai/chats/:id/messages` | Yes |
| POST | `/api/v1/ai/chats/:id/messages` | Yes |
| DELETE | `/api/v1/ai/chats/:id` | Yes |
| POST | `/api/v1/ai/quick-query` | Yes |

### Tenants & Analytics
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/tenants` | SuperAdmin |
| POST | `/api/v1/tenants` | SuperAdmin |
| GET | `/api/v1/tenants/:id` | Admin |
| PATCH | `/api/v1/tenants/:id` | Admin |
| GET | `/api/v1/analytics/platform` | SuperAdmin |
| GET | `/api/v1/analytics/tenant/:id` | Admin |

### Add-Ons
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/addons/modules` | No |
| GET | `/api/v1/addons/tenant` | Yes |
| POST | `/api/v1/addons/tenant/activate` | Admin |
| POST | `/api/v1/addons/tenant/deactivate` | Admin |

### Other Modules
| Module | Base Path |
|--------|-----------|
| Content | `/api/v1/content` |
| Branding | `/api/v1/branding` |
| Notifications | `/api/v1/notifications` |
| Payments | `/api/v1/payments` |
| Uploads | `/api/v1/uploads` |
| Audit | `/api/v1/audit` |
| Health | `/api/v1/health` |

---

## Database Schema

**64 Prisma models** organized across:

- **Auth & Users:** User, Session, VerificationToken, AuthProvider, Permission, UserPermission, AuditLog
- **Profiles:** StudentProfile, TeacherProfile, ParentProfile, InstitutionProfile
- **Academics:** Department, Course, Subject, Enrollment, Topic, AcademicBoard, AcademicStream, CourseCatalog, SubjectCatalog
- **Content:** ContentItem, ContentFile, ContentPermission, Resource, SavedResource
- **Assessment:** Quiz, Question, QuizAttempt, QuizAnswer, Assessment, AssessmentAttempt, ExamPrepSession
- **Student Tools:** Note, StudyPlan, IndividualStudentAcademic
- **Subscriptions:** Plan, Subscription, Invoice, Payment, SubscriptionAlert, Coupon
- **Tenants:** Tenant, TenantSettings, TenantBranding, Branch
- **Add-Ons:** AddOnModule, TenantAddOn
- **AI:** AiChat, AiChatMessage
- **Analytics:** AnalyticsEvent, AnalyticsSnapshot, AnalyticsGoal, AnalyticsGoalProgress, AnalyticsReport, AnalyticsExport
- **Other:** Notification, Referral, ReferralReward, PolicyAcceptance, SupportTicket, FeatureFlag, Upload, IdCounter, RoleTemplate

**22 Enums** including UserRole, AccountStatus, InstitutionType, TenantType, ContentType, PlanInterval, SubscriptionStatus, PaymentProvider, BrandingTier, and more.

---

## Security

- **Password hashing:** Argon2id with memory-hard settings
- **JWT:** Short-lived access tokens (15min) + rotating refresh tokens (7d)
- **Rate limiting:** Global + auth-specific endpoint limits
- **Account lockout:** 5 failed attempts → 30min lock
- **Input validation:** Zod schemas on all endpoints
- **HTTP security:** Helmet (CSP, HSTS, X-Frame-Options, etc.)
- **CORS:** Restricted to frontend origin
- **HPP:** HTTP parameter pollution protection
- **Tenant isolation:** Middleware enforces data boundaries
- **RBAC:** 7-role permission system
- **Audit logging:** All auth events with IP + user agent
- **Non-root Docker:** Both containers run as unprivileged users
- **SSL/TLS:** Cloudflare origin certificates + Nginx TLS 1.2/1.3

---

## Deployment Architecture

```
Internet → Cloudflare (SSL/CDN) → Nginx (VPS 5.223.67.236)
                                      ├── /api/*     → edu-backend (port 5050)
                                      ├── /uploads/* → edu-backend (port 5050)
                                      └── /*         → edu-frontend (port 3020)

Docker Compose (docker-compose.prod.yml):
  ├── edu-db        PostgreSQL 16 Alpine  (port 5435, 256MB limit)
  ├── edu-backend   Node.js 20 Alpine     (port 5050, 384MB limit)
  └── edu-frontend  Next.js standalone    (port 3020, 256MB limit)
  └── Network: srp-edu-network (bridge)
```

---

## Seeded Data

| Data | Details |
|------|---------|
| Super Admin | `admin@srpeducation.ai` / `Admin@12345` |
| Institution Owner | `owner@demoschool.edu` / `Owner@12345` |
| Demo Tenant | Demo International School |
| Student Plans | Free (₹0), Pro (₹149/mo), Premium (₹399/mo) |
| Institution Plans | Starter, Growth, University, Enterprise |
| Add-On Modules | 8 modules (Attendance, Billing, Parent Portal, Transport, Fee Reminder, WhatsApp, LMS, AI Analytics) |
| Subjects | Mathematics, Physics, Chemistry, Biology, English, Computer Science |
| Coupons | LAUNCH50 (50% off), SCHOOL20 (20% off) |

> **Change default passwords immediately in production.**

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_ACCESS_SECRET` | Access token signing secret (32+ chars) | Yes |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (32+ chars) | Yes |
| `PORT` | Backend server port (default: 5000) | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features | Yes |
| `OPENROUTER_MODEL` | Primary AI model (default: openai/gpt-4.1) | No |
| `SMTP_HOST` | Email SMTP host | No |
| `SMTP_USER` | Email SMTP username | No |
| `SMTP_PASS` | Email SMTP password | No |
| `RAZORPAY_KEY_ID` | Razorpay key for payments | No |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | No |
| `NEXT_PUBLIC_API_URL` | Backend API URL for frontend | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application display name | No |

---

## Quick Start

See **[SETUP.md](SETUP.md)** for full setup and deployment instructions.

```bash
# Local development
docker compose up db -d
cd backend && npm install && npx prisma generate && npx prisma db push && npx ts-node prisma/seed.ts && npm run dev
# In another terminal:
cd frontend && npm install && npm run dev

# Production deployment
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml exec edu-backend npx prisma db push
docker compose -f docker-compose.prod.yml exec edu-backend npx ts-node prisma/seed.ts
```

---

## Repository

| | |
|---|---|
| GitHub | `git@github.com:shashankpasikanti91-blip/edu.git` |
| Domain | `edu.srpailabs.com` |
| VPS | Hostinger `5.223.67.236` |

---

*SRP AI Labs — Building trusted AI-powered education technology.*
# SRP Education AI

> Build a production-grade, multi-tenant AI Education Platform for SRP AI Labs called **"SRP Education AI"**.

---

## IMPORTANT EXECUTION RULES

- No vibe coding.
- No rushed UI.
- No messy file structure.
- No unsafe shortcuts.
- No fake demo logic pretending to be production-ready.
- No illegal content ingestion.
- No copyrighted textbook copying without permission.
- No hacking-related functionality.
- No weak authentication flow.
- No cross-tenant data leakage.
- No unhandled errors shown to users.
- Code must be written like a senior engineering team built it.

---

## PRODUCT GOAL

Create a trusted, scalable, professional AI-powered education platform for schools, colleges, universities, coaching centers, teachers, students, and parents. The platform must support clean multi-tenant architecture, strong role-based permissions, secure login, student-safe UX, institution management, content management, and a polished marketing website.

### Dual Business Model

The platform operates two parallel business models:

**B2B — Institution Model:**
Schools, colleges, coaching centers onboard as tenants. They manage students, teachers, departments, and content within their isolated tenant.

**B2C — Direct Student Model:**
Individual students sign up directly without an institution. They get a personal AI-powered study dashboard, their own student ID (format: `IND-STU-000001`), and can optionally link to an institution later.

### Platform Identity

This is not just an LMS. This is not just a chatbot. This is not just ERP.

**This is a Student Success & Institutional Intelligence Platform.**

Main purpose: Guide every student — from confusion to confidence, from low performance to measurable progress.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript + Tailwind CSS + component architecture |
| Backend | Node.js + NestJS preferred (or Express with enterprise structure) |
| Database | PostgreSQL |
| ORM | Prisma preferred |
| Auth | Secure email/password auth, Google OAuth, session/JWT with refresh strategy |
| AI Engine | OpenRouter API (GPT-4.1 primary, GPT-4o fallback) |
| Storage | Secure file upload architecture |
| Validation | Zod / class-validator |
| Logging | Structured logs |
| Analytics | Power BI integration layer for institutional and platform analytics |
| Deployment | Docker-ready setup |
| Environment | Environment variable management |

---

## DESIGN DIRECTION

- Professional education SaaS UI
- Calm, premium, trustworthy interface
- Minimal, elegant, not over-colorful
- Accessible and responsive
- Clean cards, structured forms, proper spacing
- Suitable for students, teachers, admins, and institutions
- Modern landing page with strong branding
- Login/signup pages that look polished and trusted
- Show/hide password support
- Friendly validation messages
- Strong empty states and error states
- No childish design language

---

## ARCHITECTURE REQUIREMENTS

Build proper modular architecture with separation of concerns.

### Required Core Modules

1. Marketing Website
2. Authentication
3. Tenant Management
4. Role-Based Access Control
5. User Profile Management
6. Institution Management
7. Student Management
8. Teacher Management
9. Content Library
10. AI Assistant Integration Layer
11. Legal / Policy Pages
12. Admin Dashboard
13. Audit Logs
14. Notifications
15. File Uploads
16. Settings
17. Analytics & Reporting (Power BI)

---

## MULTI-TENANT REQUIREMENTS

This is a **strict multi-tenant system**.

### Tenant Types

- School
- College
- University
- Coaching Institute
- Training Center

### Rules

- Every tenant must have isolated data
- All queries must respect tenant boundaries
- No user can access another tenant's data
- Tenant-aware middleware/guards required
- Tenant ID must be enforced across backend services
- Super Admin can manage all tenants
- Institution Admin only manages their own tenant
- Teachers and students only access role-allowed data inside their tenant

---

## ROLE-BASED ACCESS CONTROL (RBAC)

Implement strong RBAC with expandable permissions.

### Roles

| Role | Scope |
|---|---|
| Super Admin | Platform-wide |
| Institution Owner | Tenant-wide |
| Institution Admin | Tenant-wide |
| Department Admin | Department-scoped |
| Teacher | Class/subject-scoped |
| Student | Self-scoped |
| Parent | Linked student scope (future) |

### Permissions Matrix

**Super Admin:**
- Create/manage tenants
- View platform analytics (Power BI dashboards)
- Manage plans/subscriptions
- Manage global content categories
- View audit logs
- Suspend abusive tenants/users

**Institution Owner / Admin:**
- Manage institution profile
- Invite staff
- Approve teachers/students
- Manage departments/classes/courses
- Manage institution content
- Configure tenant settings
- View tenant analytics (Power BI reports)

**Teacher:**
- Manage classes/subjects
- Upload notes/material
- Create assignments/quizzes
- Review student performance
- Interact with student learning tools
- View teaching analytics

**Student:**
- View courses/subjects
- Access uploaded content allowed by tenant
- Use AI study assistant
- Attempt quizzes/tests
- View their own progress
- Edit only limited profile fields

**Parent:**
- View linked student performance data if enabled by institution

---

## AUTHENTICATION REQUIREMENTS

Build secure auth flows:

- Manual signup
- Manual login
- Google OAuth login
- Forgot password
- Reset password
- Email verification
- Resend verification
- Show/hide password in forms
- Session expiry handling
- Secure logout
- Device/session tracking design
- Rate limiting on login/signup/reset
- Lockout strategy for abuse prevention
- Secure password hashing (bcrypt/argon2)
- Secure token management (JWT + refresh tokens)

---

## PROFILE RULES

### Editable Fields (by user)

- Profile photo
- Display name
- Phone number
- Preferred language
- Timezone
- Optional bio (for teacher)

### Restricted / Locked Fields

- Legal full name (after verification)
- Verified email (change through secure verification flow only)
- Institution ID
- Student ID / Employee ID
- Tenant mapping
- Assigned role
- Approval status

> Student profiles should not be fully editable without controls.
> Admins must have authority to approve sensitive identity changes.

### User Profile Structure

Create clean profile settings screens and backend models for:
- Student Profile
- Teacher Profile
- Institution Admin Profile
- Super Admin Profile
- Institution Public Profile

**Student Fields:**
full name, display name, email, phone, date of birth (configurable), class/year, department, roll number/student ID, institution, preferred language, profile image, guardian contact (optional), account status, verification status

**Teacher Fields:**
full name, email, phone, designation, department, specialization, qualifications, profile image, institution mapping, account status, verification status

---

## MARKETING WEBSITE REQUIREMENTS

Build a professional public website for SRP Education AI.

### Pages

- Home
- Features
- Solutions for Schools
- Solutions for Colleges/Universities
- AI Study Assistant
- Pricing
- About
- Contact
- FAQ
- Privacy Policy
- Terms of Service
- Acceptable Use Policy
- Content & Copyright Policy

### Landing Page Sections

- Hero section
- Platform overview
- Benefits for students
- Benefits for teachers
- Benefits for institutions
- AI-powered learning features
- Secure and trusted platform section
- Testimonials placeholder
- CTA banners
- Footer with policies and company info

### Logo / Branding

- Add logo placeholder component
- Support tenant branding in future
- Marketing pages should support SRP Education AI branding
- Auth pages should support logo and clean educational hero visuals
- Use placeholder student/teacher/institution imagery in a professional style only

---

## CONTENT LIBRARY REQUIREMENTS

Create a content module for storing and managing educational materials safely.

### Content Types

- Notes
- Revision sheets
- Question banks
- Flashcards
- Assignments
- Mock tests
- Teacher-uploaded resources
- Institution resources
- Licensed/open materials metadata

### Legal / Content Rules

- Do NOT build illegal textbook scraping features
- Do NOT assume copyrighted books can be copied
- Build a metadata-based content ingestion model
- Support user-uploaded and institution-uploaded content
- Support flagging copyrighted/abusive content
- Add content ownership tracking
- Add content approval workflow for admins

---

## AI ASSISTANT MODULE

Create an AI integration layer for future educational assistants.

### Use Cases

- Ask doubts
- Summarize notes
- Explain topics simply
- Create revision plans
- Generate quizzes from allowed content
- Give study guidance

### AI Trust Rules

- Never present uncertain answers as fact
- Provide confidence or caution states where needed
- Avoid unsafe academic misuse patterns
- Add disclaimer hooks for AI-generated educational support
- Keep AI as assistant, not fake authority

---

## B2C DIRECT STUDENT MODEL

### Overview

Individual students can sign up without any institution. They receive a personal AI-powered study environment.

### B2C Student Pricing

| Plan | Price | Features |
|---|---|---|
| Free | ₹0/mo | Basic AI (5 queries/day), notes, limited quizzes |
| Pro | ₹149/mo | Unlimited AI, revision planner, progress tracking |
| Premium | ₹399/mo | Everything + exam coaching, priority AI, analytics |

### B2C Features

- Auto-generated Student ID: `IND-STU-000001` (sequential via `IdCounter` table)
- Personal referral code for viral growth
- Standalone dashboard without tenant dependency
- Profile: grade, goal, course, exam countdown, preferred language
- Optional institution linking (B2C → B2B upgrade path)
- Progress tracking, quiz history, study plans, AI chats

### Referral & Growth System

- Every B2C student gets a unique referral code on signup
- Referral link format: `/signup?ref=CODE&mode=student`
- Track referral conversions and reward eligibility
- Email invite system for friends
- Referral dashboard showing invites sent, conversions, rewards

---

## ADD-ON MODULE SYSTEM

### Overview

Institutions can purchase modular add-ons beyond their base subscription to extend platform capabilities.

### Available Modules

| Slug | Module Name | Monthly | Yearly | Description |
|---|---|---|---|---|
| `ATTENDANCE` | Attendance Tracker | ₹499/mo | ₹4,999/yr | Digital attendance with reports |
| `BILLING_FINANCE` | Billing & Finance | ₹999/mo | ₹9,999/yr | Fee management, invoicing, receipts |
| `PARENT_PORTAL` | Parent Portal | ₹299/mo | ₹2,999/yr | Parent access to student data |
| `TRANSPORT` | Transport Manager | ₹399/mo | ₹3,999/yr | Route management, tracking |
| `FEE_REMINDER` | Fee Reminder | ₹199/mo | ₹1,999/yr | Automated fee notifications |
| `WHATSAPP` | WhatsApp Integration | ₹599/mo | ₹5,999/yr | WhatsApp messaging and alerts |
| `LMS` | LMS Module | ₹799/mo | ₹7,999/yr | Full learning management system |
| `AI_ANALYTICS` | AI Analytics | ₹699/mo | ₹6,999/yr | AI-powered institutional insights |

### Add-On Architecture

- Each module stored in `AddOnModule` table with pricing and feature list
- `TenantAddOn` junction table tracks which tenant has which module active
- 14-day free trial support per module
- Billing summary API aggregates monthly/yearly cost across all active modules
- Feature flag pattern: `addon.service.hasAddOn(tenantId, slug)` checks activation

---

## OPENROUTER AI INTEGRATION

### Architecture

```
Student Query → Backend AI Service → OpenRouter API → Response
                     ↓
              System Prompt (educational guardrails)
              Student Context (level, subject, goals)
              Conversation History (last 20 messages)
```

### Configuration

| Setting | Value |
|---|---|
| Provider | OpenRouter (`https://openrouter.ai/api/v1`) |
| Primary Model | `openai/gpt-4.1` |
| Fallback Model | `openai/gpt-4o` |
| API Key | Stored in `OPENROUTER_API_KEY` env variable |

### Features

- **Persistent Chats**: Full chat history stored in `AiChat` + `AiChatMessage` tables
- **Quick Queries**: Stateless single-shot queries without persistence
- **Context Window**: Last 20 messages sent as conversation context
- **Auto Titles**: First chat message auto-generates a title
- **Fallback**: If primary model fails, automatically retries with fallback model
- **Educational System Prompt**: AI is constrained to educational assistant role

### AI Guardrails

The system prompt enforces:
- Educational-only responses
- Supportive, clear, structured answers
- Step-by-step explanations with examples
- No harmful, misleading, or off-topic content
- Appropriate difficulty based on student level

---

## STUDENT SUCCESS INTELLIGENCE SYSTEM

This platform serves ALL student types — not just top performers:

- High performers
- Average students
- Low-performing students
- Repeating/failing students
- Drop-risk students
- Slow learners
- Distracted students
- Competitive exam students
- Institution-managed students

**Core mission:** Help every student improve step by step and achieve real academic goals.

### Strict Quality Rules

- No vibe coding
- No fake AI intelligence
- No generic chatbot behavior
- No blind answer flow
- No random out-of-topic AI responses
- No misleading confidence
- No unsafe or harmful study advice
- No poorly structured dashboards
- No noisy UI
- Must feel like serious student success software

---

### 1. Student Ability Assessment Engine

On first signup or first login, create an optional guided assessment.

**Purpose:** Understand current level, learning style, and support needs.

**Assessment Inputs:**
- Current class/course/year
- Recent marks/percentage
- Strong subjects
- Weak subjects
- Exam fear level
- Daily study time
- Preferred language
- Career goal
- Confidence level
- Attention/focus level self-rating
- Past failed subjects (optional)
- Upcoming exam date

**Mini Diagnostic Quizzes:**
- Math basics
- Language comprehension
- Logical reasoning
- Subject readiness by level

**Output classifies student into support bands:**

| Band | Label | Description |
|---|---|---|
| Band A | Advanced / High Performer | Excels across subjects, needs challenges |
| Band B | Good / Stable | Strong base, needs growth direction |
| Band C | Average / Needs Structure | Requires daily planning and revision cycles |
| Band D | Weak / At Risk | Needs core concept rebuilding and confidence |
| Band E | Critical / Repeating / Drop-risk | Requires rescue mode and daily accountability |

> **Never shame the student. Use supportive language only.**

---

### 2. Personalized Dashboard by Student Type

Dashboard must adapt based on student band.

**Band A (Advanced):**
- Advanced challenges
- Competitive prep
- Fast-track goals
- Rank analytics

**Band B (Good):**
- Growth plan
- Performance improvement tasks
- Consistency tracking

**Band C (Average):**
- Daily planner
- Simplified notes
- Weekly revision cycles
- Habit building

**Band D (Weak):**
- Core concepts rebuild
- Short lessons
- Guided practice
- Confidence boosters
- Mentor reminders

**Band E (Critical):**
- Rescue mode
- Fail subject recovery plan
- Micro-study sessions
- Daily accountability
- Exam survival strategy
- Strong alerts to stay active

---

### 3. Repeating / Failing Student Support Mode

Important for India and many academic systems.

**Examples:** Students failing Engineering Maths M1, M2, supply papers, backlog subjects.

**Recovery Mode Features:**
- Identify repeated failed subjects
- Break syllabus into small units
- Previous paper pattern analysis
- Most scoring chapters first
- 30-day comeback plan
- Easy explanation mode
- Confidence rebuild messaging
- Daily progress streak

**Goal:** Help backlog students clear subjects.

---

### 4. Drop-Risk Detection System

**Early Warning Signs:**
- Low login activity
- Many incomplete quizzes
- Falling scores
- Repeated weak topics
- No study activity near exams
- Failed multiple tests
- Long inactivity

**Triggered Actions:**
- Motivational nudges
- Simpler study plans
- Teacher/admin alerts (institution mode)
- Parent alerts if enabled
- Recovery recommendations

---

### 5. Strict AI Education Guardrails

Students may ask irrelevant, distracting, or harmful prompts. AI must remain strict and goal-focused.

**Block or redirect:**
- Out-of-topic endless chatting
- Harmful cheating requests
- Unwanted research unrelated to studies
- Spam prompts
- Abuse
- Dangerous content

**Professional redirect response:**
> "Let's focus on your academic goal. I can help with your syllabus, exam prep, revision, skills, or career learning."

AI must stay in the educational lane at all times.

---

### 6. AI Response Quality Control

Before every answer, AI should infer:
- Student level
- Subject
- Difficulty
- Goal urgency
- Language preference
- Weakness profile

Responses must include (when useful):
- Simple explanation
- Steps
- Examples
- Key formulas
- Short summary
- Practice questions
- Revision tips

**Never give over-complex answers to weak students.**
**Never oversimplify for advanced students.**

---

### 7. Institution Dashboard Enhancement

**Admin Dashboard should show:**
- Student performance bands
- At-risk students count
- Repeaters/backlog students
- Subject-wise failure trends
- Class engagement levels
- Attendance trends (if enabled)
- Intervention suggestions
- Teacher impact analytics

**Teacher Dashboard should show:**
- Weak students list
- Students needing follow-up
- Common weak topics
- Quiz completion rate
- Recovery mode students
- Suggested remedial content

---

### 8. Direct Student (B2C) Dashboard Enhancement

Single student users must see:
- Current level band
- Daily mission
- Upcoming exam countdown
- Strong subjects
- Weak subjects
- Improvement score
- Suggested next lesson
- Focus timer
- Motivation tracker
- Upgrade options

---

### 9. Goal Achievement Engine

Every student must set a goal.

**Examples:**
- Pass M1 backlog
- Score above 80%
- Clear semester exams
- Improve English speaking
- Crack IELTS
- Get placement ready

**System converts goal into plan:**
- Daily tasks
- Weekly milestones
- Mock tests
- Progress score
- Estimated readiness

---

### 10. India-First Reality Mode

Design for real student diversity:
- Top rankers
- Rural learners
- Low confidence students
- Regional language learners
- Backlog students
- Time-poor working students
- Degree + competitive exam mix users

Support multilingual growth architecture.

---

### 11. UX Rules

- Calm professional UI
- No childish clutter
- No fake gamification overload
- Progress visible
- Clean charts
- Encouraging but serious tone
- Fast mobile responsive design

---

### 12. Engineering Rules

- No vibe coding
- Clean architecture
- Modular services
- Real database logic
- Proper analytics pipeline
- Secure tenant isolation
- Role-based permissions
- Strong validation
- Graceful errors
- Production-ready code

---

### 13. Success Metrics

Track real outcomes:
- Students improved score %
- Backlog clear rate
- Daily active learners
- Quiz completion
- Goal completion rate
- Institution renewals
- Student referrals

---

### 14. Final Product Identity

This is not just an LMS. This is not just a chatbot. This is not just ERP.

**This is a Student Success & Institutional Intelligence Platform.**

Main purpose: Guide every student from confusion to confidence and from low performance to measurable progress.

The platform must make students feel engaged, build their confidence, and drive real interest in learning through every interaction.

---

## ANALYTICS & POWER BI INTEGRATION

### Overview

Build a proper analytics and reporting layer with Power BI integration for institutional and platform-wide insights. The analytics module must support **past performance review**, **present status monitoring**, and **future goal tracking**.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐   ┌───────────────┐   ┌────────────────────────┐ │
│  │ Raw Data │──▶│ ETL Pipeline  │──▶│ Analytics Data Store   │ │
│  │ (Postgres)│   │ (Transform)   │   │ (Aggregated Tables)   │ │
│  └──────────┘   └───────────────┘   └─────────┬──────────────┘ │
│                                                │                │
│                    ┌───────────────────────────┼───────────┐    │
│                    │                           │           │    │
│              ┌─────▼──────┐  ┌────────────▼──┐  ┌───▼────┐    │
│              │ In-App     │  │ Power BI      │  │ Export  │    │
│              │ Dashboards │  │ Embedded      │  │ (CSV/   │    │
│              │ (Charts.js)│  │ Reports       │  │  PDF)   │    │
│              └────────────┘  └───────────────┘  └────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Power BI Analyst Requirements

Build a structured analytics framework that covers three temporal dimensions:

#### 1. Past Analytics (Historical Review)

- Student performance history (grades, quiz scores, assignment completion)
- Teacher activity logs (content uploads, interactions, assessments created)
- Institution growth metrics (enrollment trends, retention rates)
- Content usage patterns (most accessed materials, peak usage times)
- Attendance and engagement historical data
- Revenue and subscription history per tenant
- Audit trail analytics

#### 2. Present Analytics (Live Monitoring)

- Active users per tenant (real-time or near real-time)
- Current enrollment status across departments
- Ongoing assessment completion rates
- Content library utilization (current month)
- System health metrics
- Active subscription status
- Pending approvals and flagged content
- Current student progress vs. course milestones

#### 3. Future Analytics (Goal Setting & Predictions)

- Student performance projections based on historical trends
- Predicted enrollment growth per institution
- Course completion forecasts
- Content demand forecasting
- Revenue projection models
- Student at-risk identification (likely to drop or underperform)
- Capacity planning for institutions
- Goal-setting dashboards for students and teachers

### Power BI Integration Specifications

```
Backend API Layer (Analytics Service)
├── /api/analytics/platform        → Super Admin: platform-wide metrics
├── /api/analytics/tenant/:id      → Institution: tenant-scoped metrics
├── /api/analytics/student/:id     → Student: personal progress data
├── /api/analytics/teacher/:id     → Teacher: class/subject analytics
├── /api/analytics/department/:id  → Department: department-level rollup
├── /api/analytics/reports/export  → Export: CSV, PDF, XLSX generation
└── /api/analytics/powerbi/embed   → Power BI: embedded report tokens
```

### Analytics Database Tables

- `analytics_events` — raw event tracking
- `analytics_snapshots` — periodic aggregated snapshots
- `analytics_goals` — goal definitions and targets
- `analytics_goal_progress` — progress tracking against goals
- `analytics_reports` — saved/scheduled report configurations
- `analytics_exports` — export history and file references

### Dashboard Analytics Widgets

**Super Admin:**
- Platform user growth chart (past 12 months)
- Active tenants heatmap
- Revenue trends
- Content moderation queue size
- System performance overview

**Institution Admin:**
- Enrollment funnel
- Student performance distribution
- Teacher engagement scores
- Department comparison charts
- Month-over-month growth

**Teacher:**
- Class average progress
- Assignment submission rates
- Quiz score distribution
- Student engagement timeline
- Content effectiveness metrics

**Student:**
- Personal progress radar chart
- Subject-wise performance trends
- Study time tracking
- Goal completion percentage
- Predicted performance indicators

---

## ADMIN DASHBOARDS

### Super Admin Dashboard

- Total tenants
- Active users
- Platform activity
- Subscription overview
- Flagged content/users
- Recent audits
- Power BI embedded platform reports

### Institution Admin Dashboard

- Student count
- Teacher count
- Active courses
- Content usage
- Pending approvals
- Recent activity
- Power BI embedded tenant reports

### Teacher Dashboard

- Classes
- Subject content
- Assignments
- Student engagement
- Content uploads
- Teaching analytics

### Student Dashboard

- Enrolled subjects
- Recent notes
- AI study assistant access
- Revision reminders
- Quiz attempts
- Progress snapshot
- Personal goal tracker

---

## DATABASE REQUIREMENTS

Design a proper PostgreSQL schema with clean relationships and indexing.

### Core Models / Tables

- `tenants`
- `tenant_settings`
- `users`
- `user_roles`
- `permissions`
- `sessions`
- `auth_providers`
- `email_verifications`
- `password_resets`
- `student_profiles`
- `teacher_profiles`
- `institution_profiles`
- `departments`
- `courses`
- `subjects`
- `enrollments`
- `content_items`
- `content_files`
- `content_permissions`
- `uploads`
- `assessments`
- `assessment_attempts`
- `notifications`
- `audit_logs`
- `subscriptions`
- `plans`
- `policy_acceptance`
- `support_tickets`
- `feature_flags` (optional)

### Analytics Tables

- `analytics_events`
- `analytics_snapshots`
- `analytics_goals`
- `analytics_goal_progress`
- `analytics_reports`
- `analytics_exports`

### Schema Rules

- Timestamps on all tables (`created_at`, `updated_at`)
- Soft delete where appropriate (`deleted_at`)
- Indexes on `tenant_id`, `email`, `status`, `role`
- Referential integrity with foreign keys
- Migration-ready schema (Prisma migrations)
- Auditability for sensitive operations

---

## SECURITY REQUIREMENTS

Treat this as a **high-trust student platform**.

Must include:
- Password hashing using strong standards (bcrypt/argon2)
- Strict input validation
- Backend DTO/schema validation
- RBAC guards
- Tenant guards
- Secure file upload handling
- MIME/type validation
- Size limits
- Anti-abuse/rate limits
- Secure headers (helmet)
- XSS prevention
- SQL injection prevention through ORM and validation
- CSRF protections where relevant
- Sanitized logs (no secrets/PII in logs)
- Protected admin routes
- Audit trail for role changes and sensitive edits

---

## ERROR HANDLING REQUIREMENTS

This platform cannot feel unreliable.

Implement:
- Global exception handling
- API error formatter (consistent error response shape)
- Clean user-safe messages
- Structured backend logs
- Validation error mapping
- Graceful fallback states in UI
- Friendly empty states
- Retry pattern only where safe
- Never expose stack traces to end users
- Loading states, disabled states, and boundary components in frontend

---

## LEGAL / POLICY REQUIREMENTS

Generate structured pages and placeholder legal text architecture for:

- Terms of Service
- Privacy Policy
- Acceptable Use Policy
- Content Policy
- Copyright Complaint Policy
- Refund Policy placeholder
- Data Retention / Deletion Policy

> **Important:** Make the project ready for legal review. Do not generate misleading legal claims. Mark legal text clearly as **draft templates pending professional legal approval**.

---

## FRONTEND PAGES — BUILD ORDER

| # | Page |
|---|---|
| 1 | Home page |
| 2 | Pricing page |
| 3 | Contact page |
| 4 | Login page |
| 5 | Signup page |
| 6 | Forgot password page |
| 7 | Reset password page |
| 8 | Email verification page |
| 9 | Dashboard shell (role-based) |
| 10 | Profile settings page |
| 11 | Tenant setup / institution onboarding page |
| 12 | Legal pages |
| 13 | Not found / error pages |
| 14 | Analytics / Reports pages |

---

## BACKEND APIs — BUILD ORDER

| # | API Module |
|---|---|
| 1 | Auth APIs |
| 2 | Tenant creation APIs |
| 3 | User onboarding APIs |
| 4 | Profile APIs |
| 5 | Role/permission APIs |
| 6 | Institution settings APIs |
| 7 | Content library APIs |
| 8 | Dashboard summary APIs |
| 9 | Audit log APIs |
| 10 | Notification APIs |
| 11 | Analytics APIs (with Power BI embed support) |

---

## PROJECT STRUCTURE

### Backend Structure

```
backend/
├── Dockerfile
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── powerbi.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── tenant.ts
│   │   ├── rbac.ts
│   │   ├── rateLimiter.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── tenant/
│   │   ├── institution/
│   │   ├── student/
│   │   ├── teacher/
│   │   ├── content/
│   │   ├── assessment/
│   │   ├── notification/
│   │   ├── audit/
│   │   ├── ai/
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   └── ai.routes.ts
│   │   ├── addon/
│   │   │   ├── addon.controller.ts
│   │   │   ├── addon.service.ts
│   │   │   └── addon.routes.ts
│   │   ├── analytics/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.routes.ts
│   │   │   ├── analytics.validation.ts
│   │   │   └── powerbi.service.ts
│   │   ├── subscription/
│   │   └── upload/
│   ├── shared/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── fixtures/
```

### Frontend Structure

```
frontend/
├── Dockerfile
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Home / Landing
│   │   ├── (marketing)/
│   │   │   ├── features/
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── faq/
│   │   │   ├── solutions/
│   │   │   │   ├── schools/
│   │   │   │   └── colleges/
│   │   │   └── ai-assistant/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── (legal)/
│   │   │   ├── privacy/
│   │   │   ├── terms/
│   │   │   ├── acceptable-use/
│   │   │   └── content-policy/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── analytics/
│   │   │   ├── content/
│   │   │   ├── assessments/
│   │   │   ├── notifications/
│   │   │   ├── ai-assistant/
│   │   │   ├── progress/
│   │   │   ├── referrals/
│   │   │   ├── addons/
│   │   │   ├── billing/
│   │   │   ├── branding/
│   │   │   └── admin/
│   │   ├── onboarding/
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── charts/
│   │   └── shared/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── powerbi.ts
│   ├── hooks/
│   ├── store/
│   └── types/
```

---

## TESTING REQUIREMENTS

Set up the foundation for:

- Unit tests
- Auth flow tests
- RBAC tests
- Tenant isolation tests
- Profile update tests
- API validation tests
- Analytics data accuracy tests

---

## EXECUTION ORDER

| Step | Task |
|---|---|
| 1 | Define architecture and folder structure |
| 2 | Design PostgreSQL schema (including analytics tables) |
| 3 | Create backend base app and modules |
| 4 | Create auth and tenant modules |
| 5 | Create RBAC guards and profile modules |
| 6 | Create frontend app shell |
| 7 | Build marketing pages |
| 8 | Build login/signup/profile flows |
| 9 | Build dashboard layouts by role |
| 10 | Connect frontend to backend with proper API patterns |
| 11 | Build analytics module and Power BI integration |
| 12 | Add validation, error handling, and audit logs |
| 13 | Prepare legal pages and production readiness notes |
| 14 | Deploy with Docker |

---

## DELIVERABLES

1. Full project architecture
2. Folder structure
3. Database schema (with analytics tables)
4. Backend module scaffolding
5. Frontend page scaffolding
6. Auth flow implementation starter
7. Role-based dashboard shell
8. Analytics module with Power BI integration
9. Legal pages scaffold
10. Reusable UI system starter
11. README with setup instructions
12. Environment example file
13. Seed strategy for local development
14. Docker Compose deployment config

---

## SETUP INSTRUCTIONS

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose
- Power BI Embedded account (for analytics)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd srp-education-ai

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start with Docker Compose
docker-compose up --build

# Or run manually:

# Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI integration |
| `OPENROUTER_BASE_URL` | OpenRouter API base URL |
| `OPENROUTER_MODEL` | Primary AI model (e.g. `openai/gpt-4.1`) |
| `OPENROUTER_FALLBACK_MODEL` | Fallback AI model (e.g. `openai/gpt-4o`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SMTP_HOST` | Email service host |
| `SMTP_PORT` | Email service port |
| `SMTP_USER` | Email service username |
| `SMTP_PASS` | Email service password |
| `POWERBI_CLIENT_ID` | Power BI app client ID |
| `POWERBI_CLIENT_SECRET` | Power BI app client secret |
| `POWERBI_TENANT_ID` | Azure AD tenant for Power BI |
| `POWERBI_WORKSPACE_ID` | Power BI workspace ID |
| `NEXT_PUBLIC_API_URL` | Backend API URL for frontend |
| `NEXT_PUBLIC_APP_NAME` | Application display name |
| `REDIS_URL` | Redis connection (for rate limiting/caching) |

---

## OUTPUT STYLE

- Write production-ready code
- Explain major architecture decisions briefly
- Do not oversimplify
- Do not generate toy examples unless clearly marked
- Build with maintainability in mind
- Keep the product premium, secure, and professional

---

## FINAL REMINDER

This is a serious education platform involving students, institutions, trust, privacy, and long-term scale. Build it with discipline, correctness, safety, and clean engineering standards. Every module should reflect production-quality thinking, not experimental vibe coding.

This platform must serve every student type — from top rankers to backlog students, from competitive exam aspirants to slow learners. The Student Success Intelligence System ensures no student is left behind. Every interaction must build confidence and drive real academic progress.

---

*SRP AI Labs — SRP Education AI Platform*
Build a production-grade, enterprise-quality AI Education Platform for SRP AI Labs called “SRP Education AI” using modern scalable architecture and clean engineering standards.

IMPORTANT DEVELOPMENT RULES:
- No vibe coding.
- No rushed or messy code.
- Use proper software engineering principles.
- Modular architecture only.
- Strong security-first development.
- Error handling must be robust and graceful.
- High trust system for students, parents, schools, and colleges.
- No hacking-related features.
- No illegal scraping.
- No copyright violations.
- No fake data.
- No shortcuts that damage reliability.

CORE PRODUCT PURPOSE:
Create an all-in-one trusted education platform that helps students learn, prepare for exams, reduce stress, improve results, and access study tools in one place.

TARGET USERS:
- School students
- College students
- Competitive exam students
- Parents
- Teachers
- Institutions

PHASE 1 MVP FEATURES:

1. AUTHENTICATION SYSTEM
- Secure signup/login
- Email verification
- Password reset
- Role-based access:
  - Student
  - Parent
  - Teacher
  - Admin
  - Super Admin
- Session management
- Multi-device login control
- Audit logs

2. STUDENT DASHBOARD
- Personalized dashboard
- Daily study planner
- Subject progress tracker
- Exam countdown
- Recent activity
- Saved notes
- Notifications

3. AI STUDY ASSISTANT
- Ask doubts by text
- Ask doubts by image upload
- Notes summarizer
- Topic explanation in simple language
- Multi-language support:
  - English
  - Hindi
  - Telugu
  - Tamil
(add scalable language framework)

4. EXAM PREP MODULE
- Mock tests
- Quiz engine
- Previous paper practice
- Score analytics
- Weak topic recommendations

5. RESOURCE LIBRARY
- Organized notes
- Study materials
- Revision sheets
- Flashcards
- Search and filters

6. WELLNESS MODE
- Study break reminders
- Focus timer
- Motivation panel
- Burnout alerts

7. ADMIN PANEL
- Manage users
- Manage subscriptions
- Manage content
- Review abuse reports
- View analytics
- Monitor uptime
- Manage institutions

TECHNICAL REQUIREMENTS:

FRONTEND:
- React / Next.js
- TypeScript
- Responsive mobile-first UI
- Accessible design
- Fast loading UI

BACKEND:
- Node.js / NestJS or Express with structure
- REST APIs with versioning
- Proper controller/service/repository layers

DATABASE:
- PostgreSQL preferred
- Proper schema design
- Indexing
- Backups
- Migration system

SECURITY:
- JWT / secure sessions
- Encrypted passwords (bcrypt/argon2)
- Rate limiting
- Input validation
- XSS protection
- SQL injection prevention
- CSRF protection where required
- Secure file upload scanning
- RBAC permissions
- Activity logs

ERROR HANDLING:
- No raw crashes shown to users
- Friendly messages
- Retry logic where safe
- Logging system
- Monitoring hooks
- Validation errors explained clearly
- Auto recovery patterns

STUDENT TRUST REQUIREMENTS:
- Accurate results only
- If uncertain, clearly say uncertain
- Never hallucinate marks/results
- Never fake attendance/progress
- Never lose user notes
- Autosave drafts
- Data privacy first

PERFORMANCE:
- Optimized queries
- Lazy loading
- CDN-ready assets
- Caching support
- Handle thousands of concurrent users

COMPLIANCE / ETHICS:
- No illegal content
- No copyrighted textbook copying
- Only user-uploaded or licensed material
- GDPR-style privacy ready
- Parent/student trust focused

UI STYLE:
- Premium modern dashboard
- Clean and calm student-friendly colors
- Professional, not childish
- Smooth animations
- High trust visual identity

DEVOPS:
- Environment variables
- CI/CD ready
- Docker ready
- Logging ready
- Production deployment ready

DELIVERABLES:
1. Proper folder structure
2. Full scalable codebase
3. Database schema
4. API documentation
5. Setup guide
6. Deployment guide
7. Test coverage starter suite

START BY:
1. Creating architecture
2. Creating database schema
3. Building auth module
4. Building dashboard
5. Then expand module by module

Every file must look like written by senior engineers, not random generated code.