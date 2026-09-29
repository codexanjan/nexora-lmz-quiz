# Nexora Learn - Authorization & Permissions Specification

## 1. Multi-Tenant Role Model

Nexora Learn enforces tenant-isolated authorization across three distinct entities:

```
User (Global Identity)
   ├── Membership (Organization A) -> Role: STUDENT
   └── Membership (Organization B) -> Role: TEACHER
```

Users do not possess one monolithic global role. Instead, their capabilities are scoped to their active organizational membership:
- `STUDENT`: Learns within assigned/enrolled courses, takes authorized quizzes, views personal grades, reviews mistake loops, and monitors personal Learning Pulse™.
- `TEACHER`: Manages owned and co-assigned courses, authors question bank versions, designs and publishes immutable quizzes, reviews student submissions, grades essay responses with rubric revisions, and monitors Class Pulse & GapMap™.
- `ADMIN`: Manages organizational memberships, promotes/demotes roles, inspects tamper-proof audit trails, and audits system health telemetry.

## 2. Server-Authoritative Permission Guards

Client-side UI hides inaccessible routes and buttons, but **every server action and route handler executes rigorous server-side verification**:

| Guard Function | Scope | Enforcement Rule |
| :--- | :--- | :--- |
| `requireAuth()` | All Protected Routes | Verifies active session token from HttpOnly cookie against database. |
| `requireRole([roles])` | Role-Restricted Pages | Asserts that active membership role exists in the allowed set. |
| `canViewCourse(userId, courseId)` | Course Read Access | Admins have full org access; Teachers can view if assigned or created; Students can view only if course is `PUBLISHED` and they are enrolled. |
| `canManageCourse(userId, courseId)` | Course Write Access | Admins or assigned teachers only. |
| `canViewAttempt(userId, attemptId)` | Assessment Read | Student can view only their own attempt; Teachers can view if assigned to the parent course. |
| `canGradeAttempt(userId, attemptId)` | Assessment Evaluation | Assigned teachers or admins only. |

## 3. Privacy & Non-Leakage Principle

If a student attempts to query a resource belonging to another student or an unpublished course, the system returns a generic `404 Not Found` or `403 Forbidden` response without disclosing whether the resource identifier exists, preventing enumeration attacks.
