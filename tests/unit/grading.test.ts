import { describe, it, expect } from "vitest";
import {
  gradeSingleChoice,
  gradeTrueFalse,
  gradeMultipleSelect,
  gradeShortAnswer,
  normalizeShortAnswer,
  validateEssayScore,
} from "@/lib/grading/engine";

describe("Grading Engine - Single Choice", () => {
  it("should award full points for exact option match", () => {
    const res = gradeSingleChoice("opt-1", JSON.stringify(["opt-1"]), 10);
    expect(res.isCorrect).toBe(true);
    expect(res.pointsEarned).toBe(10);
  });

  it("should award 0 points for incorrect option", () => {
    const res = gradeSingleChoice("opt-2", JSON.stringify(["opt-1"]), 10);
    expect(res.isCorrect).toBe(false);
    expect(res.pointsEarned).toBe(0);
  });

  it("should handle null or empty response gracefully", () => {
    const res = gradeSingleChoice(null, JSON.stringify(["opt-1"]), 10);
    expect(res.isCorrect).toBe(false);
    expect(res.pointsEarned).toBe(0);
  });
});

describe("Grading Engine - True / False", () => {
  it("should award points when user selects true and answer is true", () => {
    const res = gradeTrueFalse("true", JSON.stringify(["true"]), 5);
    expect(res.isCorrect).toBe(true);
    expect(res.pointsEarned).toBe(5);
  });

  it("should award points when user selects false and answer is false", () => {
    const res = gradeTrueFalse("false", JSON.stringify(["false"]), 5);
    expect(res.isCorrect).toBe(true);
    expect(res.pointsEarned).toBe(5);
  });

  it("should reject mismatched boolean value", () => {
    const res = gradeTrueFalse("true", JSON.stringify(["false"]), 5);
    expect(res.isCorrect).toBe(false);
    expect(res.pointsEarned).toBe(0);
  });
});

describe("Grading Engine - Multiple Select", () => {
  it("should award points for exact set match regardless of order", () => {
    const userSelected = JSON.stringify(["b", "a"]);
    const correctAnswers = JSON.stringify(["a", "b"]);
    const res = gradeMultipleSelect(userSelected, correctAnswers, 15);
    expect(res.isCorrect).toBe(true);
    expect(res.pointsEarned).toBe(15);
  });

  it("should award 0 points for partial selection (strict set matching)", () => {
    const userSelected = JSON.stringify(["a"]);
    const correctAnswers = JSON.stringify(["a", "b"]);
    const res = gradeMultipleSelect(userSelected, correctAnswers, 15);
    expect(res.isCorrect).toBe(false);
    expect(res.pointsEarned).toBe(0);
  });

  it("should award 0 points when extra incorrect option is included", () => {
    const userSelected = JSON.stringify(["a", "b", "c"]);
    const correctAnswers = JSON.stringify(["a", "b"]);
    const res = gradeMultipleSelect(userSelected, correctAnswers, 15);
    expect(res.isCorrect).toBe(false);
    expect(res.pointsEarned).toBe(0);
  });
});

describe("Grading Engine - Short Answer Normalization", () => {
  it("should normalize whitespace and case", () => {
    expect(normalizeShortAnswer("  HyperPlane   Separation ")).toBe("hyperplane separation");
  });

  it("should match when user answer differs only by casing and whitespace", () => {
    const res = gradeShortAnswer("  Hyperplane ", JSON.stringify(["hyperplane", "decision boundary"]), 10);
    expect(res.isCorrect).toBe(true);
    expect(res.pointsEarned).toBe(10);
  });

  it("should match any accepted synonym from the accepted list", () => {
    const res = gradeShortAnswer("DECISION boundary", JSON.stringify(["hyperplane", "decision boundary"]), 10);
    expect(res.isCorrect).toBe(true);
    expect(res.pointsEarned).toBe(10);
  });

  it("should reject non-matching answers without AI hallucination", () => {
    const res = gradeShortAnswer("neural network", JSON.stringify(["hyperplane"]), 10);
    expect(res.isCorrect).toBe(false);
    expect(res.pointsEarned).toBe(0);
  });
});

describe("Grading Engine - Essay Score Validation", () => {
  it("should accept valid score within [0, maxPoints]", () => {
    expect(validateEssayScore(15, 20).valid).toBe(true);
    expect(validateEssayScore(0, 20).valid).toBe(true);
    expect(validateEssayScore(20, 20).valid).toBe(true);
  });

  it("should reject negative score", () => {
    const check = validateEssayScore(-1, 20);
    expect(check.valid).toBe(false);
    expect(check.error).toContain("negative");
  });

  it("should reject score exceeding maximum possible points", () => {
    const check = validateEssayScore(25, 20);
    expect(check.valid).toBe(false);
    expect(check.error).toContain("exceed");
  });
});
