import { describe, it, expect } from "vitest";
import { calculateEffectiveDeadline } from "@/lib/grading/engine";

describe("Server-Authoritative Quiz Timing & Accommodations", () => {
  it("should calculate deadline strictly based on attempt start time + duration", () => {
    const startedAt = new Date("2026-10-01T10:00:00Z");
    const durationMinutes = 30; // 30 mins
    const deadline = calculateEffectiveDeadline(null, startedAt, durationMinutes);

    expect(deadline).not.toBeNull();
    expect(deadline?.toISOString()).toBe("2026-10-01T10:30:00.000Z");
  });

  it("should incorporate per-student extra time accommodations", () => {
    const startedAt = new Date("2026-10-01T10:00:00Z");
    const durationMinutes = 30;
    const extraTime = 15; // +15 mins accommodation
    const deadline = calculateEffectiveDeadline(null, startedAt, durationMinutes, extraTime);

    expect(deadline).not.toBeNull();
    expect(deadline?.toISOString()).toBe("2026-10-01T10:45:00.000Z");
  });

  it("should cap at quiz closing date if quiz closing date occurs earlier than duration", () => {
    const startedAt = new Date("2026-10-01T10:00:00Z");
    const durationMinutes = 60; // would end at 11:00:00Z
    const quizClosingAt = new Date("2026-10-01T10:20:00Z"); // closes earlier at 10:20:00Z

    const deadline = calculateEffectiveDeadline(quizClosingAt, startedAt, durationMinutes);
    expect(deadline?.toISOString()).toBe("2026-10-01T10:20:00.000Z");
  });

  it("should respect duration if quiz closes much later", () => {
    const startedAt = new Date("2026-10-01T10:00:00Z");
    const durationMinutes = 30; // ends at 10:30:00Z
    const quizClosingAt = new Date("2026-10-02T00:00:00Z"); // closes tomorrow

    const deadline = calculateEffectiveDeadline(quizClosingAt, startedAt, durationMinutes);
    expect(deadline?.toISOString()).toBe("2026-10-01T10:30:00.000Z");
  });
});
