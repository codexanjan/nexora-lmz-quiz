import { describe, it, expect } from "vitest";
import { sanitizeCsvField } from "@/lib/utils";

describe("CSV Formula Injection Defense", () => {
  it("should escape regular strings with quotes", () => {
    expect(sanitizeCsvField("Anjan Shrestha")).toBe('"Anjan Shrestha"');
  });

  it("should neutralize formula trigger '=' with a leading quote", () => {
    expect(sanitizeCsvField("=SUM(A1:A10)")).toBe("\"'=SUM(A1:A10)\"");
  });

  it("should neutralize formula trigger '+' with a leading quote", () => {
    expect(sanitizeCsvField("+cmd|' /C calc'!A0")).toBe("\"'+cmd|' /C calc'!A0\"");
  });

  it("should neutralize formula trigger '-' with a leading quote", () => {
    expect(sanitizeCsvField("-2+3*cmd")).toBe("\"'-2+3*cmd\"");
  });

  it("should neutralize formula trigger '@' with a leading quote", () => {
    expect(sanitizeCsvField("@SUM(1,2)")).toBe("\"'@SUM(1,2)\"");
  });

  it("should escape double quotes correctly", () => {
    expect(sanitizeCsvField('He said "Hello"')).toBe('"He said ""Hello"""');
  });

  it("should handle null and undefined safely", () => {
    expect(sanitizeCsvField(null)).toBe('""');
    expect(sanitizeCsvField(undefined)).toBe('""');
  });
});
