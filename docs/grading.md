# Nexora Learn - Grading Engine, Revisions & Result Release

## 1. Supported Question Types & Auto-Grading

Nexora Learn implements a deterministic grading engine that operates without opaque scoring or AI hallucinations:

| Question Type | Grading Strategy | Description |
| :--- | :--- | :--- |
| **SINGLE_CHOICE** | Automated Exact Match | Selected option key is strictly compared against the designated correct option. |
| **TRUE_FALSE** | Automated Boolean Match | Selected value is normalized and compared against boolean expectation. |
| **MULTIPLE_SELECT** | Automated Exact-Set Match | All correct options must be selected, and no incorrect options may be included (order-independent). |
| **SHORT_ANSWER** | Automated Normalized Match | User input is trimmed, converted to lowercase, internal whitespace collapsed, and compared against the array of teacher-specified accepted synonyms. |
| **ESSAY** | Manual Rubric Evaluation | Queued for instructor review (`AWAITING_GRADING`). Supports point assignment within $[0, \text{maxPoints}]$ and structured feedback. |

## 2. Manual Essay Grading & Grade Revisions

When an instructor evaluates an essay response:
1. The score is validated server-side ($0 \le \text{score} \le \text{pointsPossible}$).
2. A `GradeRevision` record is written capturing:
   - Previous score & new score
   - Previous feedback & new feedback
   - Instructor identity (`graderId`)
   - Explicit audit timestamp and reason
3. Historical revisions remain permanently queryable for academic grade appeals.

## 3. Result Release Lifecycle

Attempts progress through distinct stages:
1. `IN_PROGRESS`: Student actively testing.
2. `SUBMITTED`: Objective items scored; awaiting essay review or release trigger.
3. `AWAITING_GRADING`: Essay responses present in grading queue.
4. `GRADED`: All items scored, final percentages calculated.
5. `RELEASED`: Student authorized to view finalized score breakdown, instructor rubric feedback, and correct answers.
