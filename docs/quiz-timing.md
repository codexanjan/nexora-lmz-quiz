# Nexora Learn - Server-Authoritative Quiz Timing & Autosave

## 1. Authoritative Timing Engine

In Nexora Learn, the browser timer is strictly informational. Assessment deadlines are calculated and enforced server-side:

$$\text{effectiveDeadline} = \min\left(\text{quizClosingAt}, \text{attemptStartedAt} + \text{durationMinutes} + \text{accommodations}\right)$$

### Verification Rules:
1. **Per-Student Accommodations**:
   - Students with registered accommodations (e.g., $+15$ minutes extra time) receive extended effective durations calculated by the server.
   - Accommodation metadata is never leaked in client responses to other students.
2. **Every Mutation Enforces Deadline**:
   - Every autosave request (`/api/attempts/[id]/save`) and final submission request (`/api/attempts/[id]/submit`) compares the current server timestamp against `deadlineAt`.
   - Late requests after `deadlineAt` are strictly rejected with an authoritative timestamp.
3. **Auto-Finalization**:
   - If an attempt expires before the student clicks submit, the system finalizes the latest accepted saved answers, transitions the status to `SUBMITTED`, logs an `ATTEMPT_EXPIRED` audit event, and dispatches auto-grading.

## 2. Autosave with Revision Tracking

To guarantee zero answer loss without write conflicts:
1. **Debounced Client Sync**:
   - As students type or select options, state is held in memory and debounced to the server every $800\text{ms}$.
2. **Revision Counters**:
   - Each answer record maintains an incremental `revision` number.
   - Out-of-order network packets arriving late will not overwrite a newer answer revision.
3. **Optimistic Concurrency & Multiple Tab Protection**:
   - Attempts track active session identifiers. If a user submits from Tab A, Tab B receives an immediate notice on subsequent save: `"This attempt has already been submitted."`
