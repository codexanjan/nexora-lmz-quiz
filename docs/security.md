# Nexora Learn - Security & Hardening Specification

## 1. Authentication & Session Security

- **Database-Backed Sessions**:
  - Rather than client-side JWTs with revocation vulnerabilities, sessions are stored in the database (`Session` model) and bound to cryptographic random 256-bit hexadecimal tokens.
  - Cookies are marked `HttpOnly`, `SameSite=Lax`, and `Secure` in production environments, mitigating XSS token extraction.
- **Password Protection**:
  - All user passwords are encrypted using `bcrypt` with salt cost 10. Passwords are never logged or stored in plaintext.
- **Active Session Auditing**:
  - Users can inspect active device sessions, remote IP addresses, and user-agent strings, with one-click revocation.

## 2. Multi-Tenant Organization Isolation

- **Scoped Queries**:
  - Every resource query (`Course`, `Quiz`, `Question`, `AuditEvent`, `Alert`) includes tenant constraints (`organizationId`).
  - Cross-tenant data leaks are prevented at the service and query layers.

## 3. Assessment Integrity & Snapshots

- **Immutable Assessment Snapshots**:
  - When a student initiates a quiz attempt, an immutable `AttemptQuestionSnapshot` is recorded for every question.
  - Subsequent edits to the teacher's Question Bank or Quiz Builder will **never mutate historical exam content or scoring rubrics**.
- **Server-Authoritative Clock**:
  - Client device system times are untrusted. Assessment deadlines are calculated and enforced strictly by server timestamps.

## 4. Input Validation & Injection Defenses

- **Zod Schema Validation**:
  - Every API endpoint validates incoming JSON bodies against strict Zod definitions before database interaction.
- **CSV Formula Injection Defense**:
  - Exported gradebook and analytics spreadsheets sanitize any cell value beginning with `=`, `+`, `-`, or `@` by prefixing a single quote (`'`), neutralizing malicious spreadsheet macro execution in Microsoft Excel or Google Sheets.
- **SQL Injection Prevention**:
  - All database queries execute via Prisma ORM parameterized statements, preventing raw SQL injection.
