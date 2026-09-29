# Nexora Learn - Architecture Specification

## 1. System Overview

**Nexora Learn** is a modern Learning Management System, Assessment Platform, and Learning Intelligence engine built with Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, and SQLite / PostgreSQL.

Traditional LMS platforms separate courses, quizzes, and analytics into disconnected silos. Nexora Learn connects them via a **closed-loop domain event and outbox architecture**:
- Every lesson completed recalculates progress and unlocks quiz eligibility.
- Every quiz submitted triggers instant auto-grading and notifies teachers of pending manual essays.
- Every teacher grade release immediately updates the student's **Learning Pulse™**, groups mistakes in **ReviewLoop™**, and informs **NextStep™** guidance.
- Teacher cohort intelligence (**Class Pulse**) aggregates errors into **GapMap™** to pinpoint curriculum deficits.

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                     │
│   Next.js 14 App Router, Framer Motion, shadcn/ui, Recharts │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    API Handlers & Server Actions            │
│               Authentication, Rate Limiting, Input Zod      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Domain Services Layer                    │
│   Auth, Progress, Quiz Timing, Grading, Outbox Engine       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Persistence Layer (ACID)                 │
│         Prisma ORM, SQLite (Dev) / PostgreSQL (Prod)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Transactional Outbox & Jobs                │
│    OutboxEvent Table -> Worker -> Notifications, Audits     │
└─────────────────────────────────────────────────────────────┘
```

## 2. Layered Responsibilities

1. **Presentation Layer (`app/`, `components/`)**:
   - Zero direct database mutations.
   - Clean separation of Server Components (data fetching, session validation) and Client Components (interactive forms, autosave, animations).
   - WCAG 2.2 AA accessibility with keyboard navigation and `prefers-reduced-motion` compliance.

2. **Authorization & Session Layer (`lib/auth/`, `lib/permissions/`)**:
   - Multi-tenant organization awareness (`Organization` -> `Membership` -> `Role`).
   - Server-enforced access checks (`requireRole`, `canViewCourse`, `canGradeAttempt`, `canManageCourse`).
   - HttpOnly session cookies with cryptographic tokens stored in the database.

3. **Domain Services Layer (`lib/services/`)**:
   - `progress-service.ts`: Transparent progress calculation based on published required activities.
   - `quiz-service.ts`: Server-authoritative timing, revision-controlled autosave, and auto-grading.
   - `grading-service.ts`: Manual essay grading, `GradeRevision` auditing, and result release workflows.
   - `class-pulse-service.ts`: Real-time teacher cohort intelligence and GapMap™ concept aggregation.
   - `event-service.ts`: Transactional outbox event dispatcher.

4. **Event & Outbox Engine**:
   - Avoids lost notifications by recording domain events inside the primary database transaction (`OutboxEvent`).
   - Background processor dispatches persistent `Notification`, `Alert`, and `AuditEvent` records.
