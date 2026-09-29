/**
 * Nexora Learn - Deterministic Grading Engine & Timing Utilities
 * Strictly server-authoritative, transparent, with zero non-deterministic or opaque logic.
 */

export interface GradeResult {
  isCorrect: boolean;
  pointsEarned: number;
}

/**
 * Single Choice Grading
 * Matches selected option ID against correct answer
 */
export function gradeSingleChoice(
  userResponse: string | null | undefined,
  correctAnswersJson: string | null | undefined,
  maxPoints: number
): GradeResult {
  if (!userResponse || !userResponse.trim()) {
    return { isCorrect: false, pointsEarned: 0 };
  }

  const cleanUser = userResponse.trim();
  let isCorrect = false;

  try {
    const correct = JSON.parse(correctAnswersJson || "[]");
    const correctId = Array.isArray(correct) ? correct[0] : correct;
    isCorrect = String(cleanUser) === String(correctId);
  } catch {
    isCorrect = String(cleanUser) === String(correctAnswersJson).trim();
  }

  return {
    isCorrect,
    pointsEarned: isCorrect ? maxPoints : 0,
  };
}

/**
 * True / False Grading
 * Evaluates exact boolean truth values
 */
export function gradeTrueFalse(
  userResponse: string | null | undefined,
  correctAnswersJson: string | null | undefined,
  maxPoints: number
): GradeResult {
  if (!userResponse || !userResponse.trim()) {
    return { isCorrect: false, pointsEarned: 0 };
  }

  const userBool = userResponse.trim().toLowerCase() === "true";
  const expectedBool = String(correctAnswersJson).toLowerCase().includes("true");
  const isCorrect = userBool === expectedBool;

  return {
    isCorrect,
    pointsEarned: isCorrect ? maxPoints : 0,
  };
}

/**
 * Multiple Select Grading
 * Exact set matching (order independent, partial credit = 0 unless exact match)
 */
export function gradeMultipleSelect(
  userResponse: string | null | undefined,
  correctAnswersJson: string | null | undefined,
  maxPoints: number
): GradeResult {
  if (!userResponse || !userResponse.trim()) {
    return { isCorrect: false, pointsEarned: 0 };
  }

  let isCorrect = false;
  try {
    const userSelected: string[] = JSON.parse(userResponse);
    const correctSet: string[] = JSON.parse(correctAnswersJson || "[]");

    if (
      Array.isArray(userSelected) &&
      Array.isArray(correctSet) &&
      userSelected.length === correctSet.length &&
      userSelected.every((val) => correctSet.includes(val))
    ) {
      isCorrect = true;
    }
  } catch {
    isCorrect = false;
  }

  return {
    isCorrect,
    pointsEarned: isCorrect ? maxPoints : 0,
  };
}

/**
 * Short Answer Normalization & Grading
 * Normalizes input:
 * 1. Trim leading and trailing whitespace
 * 2. Collapse internal whitespace sequences to single space
 * 3. Case-insensitive lowercase comparison
 * 4. Matches against any accepted answer variant
 */
export function normalizeShortAnswer(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function gradeShortAnswer(
  userResponse: string | null | undefined,
  acceptedAnswersJson: string | null | undefined,
  maxPoints: number
): GradeResult {
  if (!userResponse || !userResponse.trim()) {
    return { isCorrect: false, pointsEarned: 0 };
  }

  const normalizedUser = normalizeShortAnswer(userResponse);
  let isCorrect = false;

  try {
    const accepted: string[] = JSON.parse(acceptedAnswersJson || "[]");
    if (Array.isArray(accepted)) {
      isCorrect = accepted.some((acc) => normalizeShortAnswer(String(acc)) === normalizedUser);
    } else {
      isCorrect = normalizeShortAnswer(String(accepted)) === normalizedUser;
    }
  } catch {
    isCorrect = normalizeShortAnswer(String(acceptedAnswersJson)) === normalizedUser;
  }

  return {
    isCorrect,
    pointsEarned: isCorrect ? maxPoints : 0,
  };
}

/**
 * Essay Manual Grading Score Validation
 * 0 <= score <= maxPoints
 */
export function validateEssayScore(
  score: number,
  maxPoints: number
): { valid: boolean; error?: string } {
  if (typeof score !== "number" || isNaN(score)) {
    return { valid: false, error: "Score must be a valid number" };
  }
  if (score < 0) {
    return { valid: false, error: "Score cannot be negative" };
  }
  if (score > maxPoints) {
    return { valid: false, error: `Score cannot exceed maximum possible points (${maxPoints})` };
  }
  return { valid: true };
}

/**
 * Server Authoritative Deadline Calculation
 * effectiveDeadline = minimum(quizClosingAt, attemptStartedAt + effectiveDuration + accommodations)
 */
export function calculateEffectiveDeadline(
  quizClosingAt: Date | null,
  attemptStartedAt: Date,
  durationMinutes: number | null,
  extraTimeMinutes: number = 0
): Date | null {
  const totalMinutes = (durationMinutes ?? 0) + extraTimeMinutes;

  let attemptDeadline: Date | null = null;
  if (totalMinutes > 0) {
    attemptDeadline = new Date(attemptStartedAt.getTime() + totalMinutes * 60 * 1000);
  }

  if (!quizClosingAt && !attemptDeadline) {
    return null;
  }

  if (quizClosingAt && attemptDeadline) {
    return quizClosingAt < attemptDeadline ? quizClosingAt : attemptDeadline;
  }

  return quizClosingAt || attemptDeadline;
}

/**
 * Progress Calculation Ratio
 */
export function calculateProgressPercentage(
  completedActivities: number,
  totalActivities: number
): number {
  if (totalActivities <= 0) return 0;
  return Math.min(100, Math.round((completedActivities / totalActivities) * 100));
}
