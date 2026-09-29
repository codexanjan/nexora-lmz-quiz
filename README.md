# NEXORA LEARN
### *Learn smarter. Practice better. Know what to do next.*

Nexora Learn is a full-featured, production-style modern **Learning Management System (LMS) + Assessment Platform + Learning Intelligence Engine**. 

Unlike conventional platforms that fracture courses, assessments, analytics, and notifications into disconnected silos, Nexora Learn operates as **one interconnected ecosystem**:
- When a teacher publishes a course or quiz, enrolled students immediately receive targeted notifications and actionable **NextStep™** guidance.
- When a student completes a lesson, course progress recalculates dynamically using a transparent, explainable formula ($13/17 \text{ activities} \to 76\%$).
- When taking an assessment, deadlines are strictly **server-authoritative**, accommodating individual extra time needs, and answers autosave with optimistic concurrency and incremental revision tracking to guarantee zero data loss.
- Submissions instantly grade objective questions (Single Choice, Multiple Select, True/False, Short Answer with synonym normalization) and queue essays for manual instructor evaluation.
- Teachers grade essays using rubrics, preserving an immutable **GradeRevision** history.
- Released results feed directly into the student's **Learning Pulse™** and populate the **ReviewLoop™** with prioritized remediation steps based on concept tags.
- Teachers observe live cohort trends through **Class Pulse** and pinpoint curriculum-wide weaknesses via **GapMap™**.

---

## 📸 Core Features & Novelty Systems

### 1. ⚡ Learning Pulse™
An objective, explainable learning health score (0–100) computed from:
- Required syllabus completion
- Quiz participation rate
- Finalized assessment scores
- Overdue activities
- Learning consistency  
*No opaque "AI scores"—students are explicitly shown which signals increase or decrease their pulse.*

### 2. 🧭 NextStep™ Engine
An actionable recommendation engine that inspects real database state and guides students to their highest-leverage next task (e.g. *"Complete Module 2"*, *"Take Machine Learning Foundations Quiz"*, or *"Review instructor feedback"*).

### 3. 🔁 ReviewLoop™
Post-assessment retention system. Groups questions answered incorrectly by concept tags (e.g., *Bayes Theorem*, *Precision vs. Recall*) and maps them directly back to source lessons for targeted review.

### 4. 📊 Class Pulse & GapMap™
Instructor cohort intelligence. Aggregates student error rates across all questions to identify topic-level deficits (*GapMap*), highlights students requiring intervention, and tracks syllabus completion.

### 5. ⏱️ Server-Authoritative Timing & Autosave
- Millisecond-accurate deadlines: $\min(\text{quizClosingAt}, \text{attemptStartedAt} + \text{duration} + \text{accommodations})$.
- Answers autosave incrementally with client-side debouncing and server-side revision counters.
- Multi-tab conflict detection prevents duplicate attempts or race-condition submissions.

### 6. 🛡️ Multi-Tenant Organization Scoping & Auditing
- Scoped tenant isolation (`Organization` $\to$ `Membership` $\to$ `Role`).
- Comprehensive immutable audit trail (`AuditEvent`) recording role modifications, course and quiz publications, attempt submissions, and grading revisions.
- CSV export protected against formula injection (cells starting with `=`, `+`, `-`, `@` prepended with `'`).

---

## 🛠️ Technology Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Components, Route Handlers) |
| **Language** | TypeScript |
| **Styling & Design** | Tailwind CSS, Dark Futuristic Academic Theme, Glassmorphism |
| **Component Primitives** | shadcn/ui accessible patterns, Lucide React icons |
| **Animations** | Framer Motion (respects `prefers-reduced-motion`) |
| **Visualizations** | Recharts (responsive charts with accessible tabular summaries) |
| **Persistence** | Prisma ORM, SQLite (`dev.db` for local dev) / PostgreSQL (production) |
| **Authentication** | Cryptographic random 256-bit database sessions with HttpOnly cookies, bcrypt hashing |
| **Validation** | Zod schemas on all API endpoints |
| **Event Pipeline** | Transactional Outbox Pattern (`OutboxEvent` table) |
| **Testing** | Vitest (31 unit tests covering grading, progress, timing, sanitization) |

---

## 🔑 Pre-Seeded Demo Accounts

The database comes fully populated with realistic demo courses, lessons, question bank entries, versioned quizzes, attempts, and grade revisions.

**Universal Demo Password**: `NexoraPass2026!`

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Administrator** | `admin@nexora.demo` | Tenant governance, role assignments, audit logs, system health telemetry. |
| **Instructor 1** | `teacher@nexora.demo` | Course creation, question bank, quiz builder, grading queue, gradebook, reports. |
| **Instructor 2** | `teacher2@nexora.demo` | Co-instructor assigned to secondary courses. |
| **Student 1** | `student@nexora.demo` | Enrolled in active courses, completed lessons, ready for quiz attempts, Learning Pulse 78. |
| **Student 2** | `student2@nexora.demo` | Overdue lessons, requires intervention in Class Pulse. |
| **Student 3** | `student3@nexora.demo` | Submitted assessment awaiting essay grading in teacher queue. |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v20+ or v22+
- npm v10+

### 2. Installation
```bash
# Clone or navigate to the project directory
cd "lms quiz app"

# Install dependencies
npm install
```

### 3. Database Setup & Seeding
```bash
# Push Prisma schema to SQLite database (dev.db)
npx prisma db push

# Seed demo users, organizations, courses, lessons, questions, and quizzes
npx tsx prisma/seed.ts
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

Run the complete Vitest test suite:
```bash
npx vitest run
```
Tests verify:
- **Progress Formula**: Denominator / numerator calculation, rounding, zero-activity edge cases.
- **Grading Engine**: Single choice exact matching, multiple select exact-set comparison, boolean truth evaluation, short answer normalization (whitespace collapsing, case insensitivity, synonym lists), and essay score bounds.
- **Authoritative Timing**: Deadline clipping with closing dates and accommodation calculation.
- **CSV Formula Injection**: Neutralization of dangerous spreadsheet formula characters (`=`, `+`, `-`, `@`).

---

## 📚 Technical Documentation Index

Detailed architectural and operational documentation is available in the `docs/` folder:
- [Architecture Overview](file:///docs/architecture.md)
- [Authorization & Permissions](file:///docs/permissions.md)
- [Course Progress Rules](file:///docs/progress-rules.md)
- [Server-Authoritative Quiz Timing](file:///docs/quiz-timing.md)
- [Grading Engine & Revisions](file:///docs/grading.md)
- [Notifications & Outbox Pipeline](file:///docs/notifications.md)
- [Security & Hardening](file:///docs/security.md)
- [Production Deployment Guide](file:///docs/deployment.md)
- [Database Backup & Restore](file:///docs/backup-restore.md)

---

## 🌐 Brand End State
**NEXORA LEARN**  
*Learn smarter. Understand deeper. Progress with purpose.*
