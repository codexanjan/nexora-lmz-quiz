import { describe, it, expect } from "vitest";
import { calculateProgressPercentage } from "@/lib/grading/engine";

describe("Progress Calculation Formula", () => {
  it("should calculate 0% when no activities exist", () => {
    expect(calculateProgressPercentage(0, 0)).toBe(0);
  });

  it("should calculate correct percentage according to completed / total * 100", () => {
    // 13 / 17 = 76.47% -> rounds to 76%
    expect(calculateProgressPercentage(13, 17)).toBe(76);
  });

  it("should cap at 100% when all activities are complete", () => {
    expect(calculateProgressPercentage(10, 10)).toBe(100);
    expect(calculateProgressPercentage(12, 10)).toBe(100);
  });

  it("should round correctly for fractional results", () => {
    // 1 / 3 = 33.33% -> 33%
    expect(calculateProgressPercentage(1, 3)).toBe(33);
    // 2 / 3 = 66.67% -> 67%
    expect(calculateProgressPercentage(2, 3)).toBe(67);
  });
});
