# Nexora Learn - Course Progress Rules & Explainability

## 1. Core Calculation Formula

Course progress in Nexora Learn is 100% deterministic and explainable:

$$\text{Course Progress (\%)} = \min\left(100, \left\lfloor \frac{\text{Completed Required Published Activities}}{\text{Total Required Published Activities}} \times 100 \right\rceil\right)$$

### Key Rules:
1. **Required Activities Only**:
   - Only lessons with `isRequired = true` and quizzes with `isRequired = true` contribute to the denominator.
   - Optional or supplemental resources do not penalize students who do not complete them.
2. **Published State Dependency**:
   - Only activities belonging to published courses and published modules are counted. Draft lessons created by teachers do not suddenly deflate student percentages.
3. **No Proof-of-Time Fallacy**:
   - Time spent idling on a page is never counted as "learning". Progress requires intentional active completion (clicking "Complete Lesson" or submitting and achieving passing marks on a quiz).
4. **Explainable UI**:
   - The user interface always displays the underlying numerator and denominator alongside the percentage:
     ```
     13 / 17 required activities completed (76%)
     ```

## 2. Activity Completion Criteria

- **Lessons**:
  - The student navigates through the curriculum and triggers "Mark as Completed".
  - A `LessonProgress` record is upserted with `isCompleted = true`, `completedAt = NOW()`, and `lastAccessedAt = NOW()`.
- **Quizzes**:
  - An attempt is graded and passes the quiz's `passingPercentage` threshold (`isPassed = true`).
  - If the quiz allows multiple attempts, the configured grade selection policy determines the gradebook standing (`HIGHEST`, `LATEST`, or `FIRST`).
