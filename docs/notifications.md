# Nexora Learn - Notifications, System Alerts & Outbox Pipeline

## 1. Notification Event Pipeline (Outbox Pattern)

Nexora Learn enforces reliable notification delivery using the **Transactional Outbox Pattern**:

```
Client Mutation (e.g. Teacher publishes quiz)
       │
       ▼
Database Transaction
  ├── 1. Primary Record Update (`quiz.state = PUBLISHED`)
  ├── 2. OutboxEvent Inserted (`QUIZ_PUBLISHED`, payload, orgId)
  └── 3. AuditEvent Inserted
       │
       ▼
Background Dispatch Worker (`lib/services/event-service.ts`)
  ├── Reads unprocessed `OutboxEvent` records
  ├── Generates persistent `Notification` records for enrolled students
  ├── Generates `Alert` records for critical thresholds
  └── Marks `OutboxEvent` as processed
```

This architecture ensures that even if an email gateway or push delivery times out, **zero notifications or audit events are lost**.

## 2. Notification Types & Deep Linking

Every notification record contains a functional, authorized deep-link directly to the subject resource:

| Event Type | Recipient Role | Destination Link | Description |
| :--- | :--- | :--- | :--- |
| `COURSE_PUBLISHED` | Student | `/student/courses/[id]` | Alerts student that curriculum is available. |
| `QUIZ_PUBLISHED` | Student | `/student/quizzes/[id]` | Direct access to start or review quiz parameters. |
| `RESULT_RELEASED` | Student | `/student/results/[attemptId]` | Direct link to score breakdown and teacher comments. |
| `ATTEMPT_SUBMITTED` | Teacher | `/teacher/submissions/[attemptId]` | Direct link to review and grade pending essays. |
| `MEMBERSHIP_ROLE_CHANGED` | User | `/profile` | Confirms updated organization authorization privileges. |

## 3. Persistent Notifications vs. Ephemeral Toasts

- **Toast**: Immediate ephemeral visual acknowledgment of a local UI action (e.g., *"Answer autosaved"*, *"Lesson marked complete"*).
- **Notification**: Persistent academic record stored in the database (`UNREAD` / `READ` / `ARCHIVED`), retained across logins, and contributing to the navbar bell badge count.
