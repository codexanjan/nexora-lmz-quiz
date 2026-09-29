import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "TEACHER"]).optional().default("STUDENT"),
});

export const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  enrollmentCode: z.string().optional(),
  enrollmentLimit: z.number().int().positive().optional(),
});

export const moduleSchema = z.object({
  courseId: z.string(),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  orderIndex: z.number().int().default(0),
});

export const lessonSchema = z.object({
  moduleId: z.string(),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  content: z.string().min(5, "Content is required"),
  durationMinutes: z.number().int().positive().default(15),
  isRequired: z.boolean().default(true),
  videoUrl: z.string().url().optional().or(z.literal("")),
  takeaways: z.string().optional(),
  orderIndex: z.number().int().default(0),
});

export const questionSchema = z.object({
  courseId: z.string().optional().nullable(),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_SELECT", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"]),
  prompt: z.string().min(3, "Question prompt is required"),
  options: z.string().optional().nullable(), // JSON array
  correctAnswers: z.string().optional().nullable(), // JSON array or boolean/string
  acceptedAnswers: z.string().optional().nullable(), // JSON array
  explanation: z.string().optional().nullable(),
  rubric: z.string().optional().nullable(),
  points: z.number().min(0.5).default(1.0),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  tags: z.string().optional().nullable(),
});

export const quizSchema = z.object({
  courseId: z.string(),
  moduleId: z.string().optional().nullable(),
  title: z.string().min(3, "Quiz title must be at least 3 characters"),
  instructions: z.string().optional().nullable(),
  timeLimitMinutes: z.number().int().min(1, "Time limit must be at least 1 minute").default(30),
  maxAttempts: z.number().int().min(1, "At least 1 attempt is required").default(1),
  passingPercentage: z.number().min(0).max(100).default(70.0),
  randomizeQuestions: z.boolean().default(false),
  randomizeAnswers: z.boolean().default(false),
  navigationPolicy: z.enum(["FREE", "SEQUENTIAL"]).default("FREE"),
  resultReleasePolicy: z.enum(["IMMEDIATE", "AFTER_CLOSE", "MANUAL"]).default("IMMEDIATE"),
  showCorrectAnswers: z.enum(["NEVER", "ALWAYS", "AFTER_CLOSE"]).default("ALWAYS"),
  showExplanations: z.enum(["NEVER", "ALWAYS", "AFTER_CLOSE"]).default("ALWAYS"),
  gradeSelectionRule: z.enum(["HIGHEST", "LATEST", "FIRST"]).default("HIGHEST"),
  isRequired: z.boolean().default(true),
  questionIds: z.array(z.string()).min(1, "At least one question is required"),
});

export const autosaveAnswerSchema = z.object({
  attemptId: z.string(),
  questionVersionId: z.string(),
  response: z.string().nullable().optional(),
  isFlagged: z.boolean().default(false),
  revision: z.number().int().default(1),
});

export const submitAttemptSchema = z.object({
  attemptId: z.string(),
});

export const gradeRevisionSchema = z.object({
  attemptId: z.string(),
  answerId: z.string().optional().nullable(),
  newScore: z.number().min(0),
  newFeedback: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

export const enrollmentCodeSchema = z.object({
  code: z.string().min(3, "Enrollment code must be at least 3 characters"),
});
