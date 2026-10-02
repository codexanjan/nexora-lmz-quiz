import { describe, it, expect } from "vitest";
import { translations, SUPPORTED_LANGUAGES, SupportedLanguage } from "../../lib/i18n/translations";

describe("Multi-Language i18n System", () => {
  it("should have all supported languages registered with valid metadata", () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(6);
    const expectedCodes: SupportedLanguage[] = ["en", "es", "fr", "de", "hi", "ja"];

    for (const code of expectedCodes) {
      const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
      expect(found).toBeDefined();
      expect(found?.name).toBeTruthy();
      expect(found?.nativeName).toBeTruthy();
      expect(found?.flag).toBeTruthy();
    }
  });

  it("should contain all key navigation and action keys in English", () => {
    const en = translations.en;
    expect(en["brand.name"]).toBe("NEXORA LEARN");
    expect(en["nav.dashboard"]).toBeDefined();
    expect(en["nav.courses"]).toBeDefined();
    expect(en["nav.quizzes"]).toBeDefined();
    expect(en["action.start_quiz"]).toBeDefined();
    expect(en["action.complete_lesson"]).toBeDefined();
    expect(en["status.active"]).toBeDefined();
  });

  it("should provide valid translations for all supported languages", () => {
    const requiredKeys = [
      "brand.name",
      "brand.tagline",
      "nav.dashboard",
      "nav.courses",
      "nav.quizzes",
      "action.start_quiz",
      "action.submit_attempt",
      "action.complete_lesson",
      "status.active",
      "status.passed",
    ];

    const languages: SupportedLanguage[] = ["en", "es", "fr", "de", "hi", "ja"];

    for (const lang of languages) {
      const dict = translations[lang];
      expect(dict).toBeDefined();

      for (const key of requiredKeys) {
        expect(dict[key], `Missing key "${key}" in language "${lang}"`).toBeDefined();
        expect(typeof dict[key]).toBe("string");
        expect(dict[key].length).toBeGreaterThan(0);
      }
    }
  });

  it("should confirm zero AI dependency in all languages", () => {
    for (const lang of ["en", "es", "fr", "de", "hi", "ja"] as SupportedLanguage[]) {
      const zeroAiTag = translations[lang]["brand.zero_ai"];
      expect(zeroAiTag).toBeDefined();
      expect(zeroAiTag.length).toBeGreaterThan(5);
    }
  });
});
