import { describe, expect, it } from "vitest";
import { DAY_BY_LORD, findZodiacSign, GEMSTONE_BY_LORD, ZODIAC_SIGNS } from "./zodiac";

// Mirrors SIGN_LORDS / EXALTATION_SIGNS in backend/app/services/astrology.py.
// If the backend tables ever change, this test should fail rather than let the
// reference pages quietly disagree with the charts the app casts.
const LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
];
const EXALTED: Record<number, string> = {
  1: "Sun", 2: "Moon", 4: "Jupiter", 6: "Mercury", 7: "Saturn", 10: "Mars", 12: "Venus"
};

describe("zodiac reference data", () => {
  it("covers all twelve rashis in order with unique slugs", () => {
    expect(ZODIAC_SIGNS).toHaveLength(12);
    expect(ZODIAC_SIGNS.map((s) => s.number)).toEqual([...Array(12)].map((_, i) => i + 1));
    expect(new Set(ZODIAC_SIGNS.map((s) => s.slug)).size).toBe(12);
  });

  it("agrees with the backend's sign lords and exaltations", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(sign.lord).toBe(LORDS[sign.number - 1]);
      expect(sign.exalted).toBe(EXALTED[sign.number] ?? null);
    }
  });

  it("gives every rashi exactly three nakshatras", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(sign.nakshatras).toHaveLength(3);
    }
  });

  it("derives gemstone and favourable day from the sign lord", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(sign.gemstone).toBe(GEMSTONE_BY_LORD[sign.lord]);
      expect(sign.luckyDay).toBe(DAY_BY_LORD[sign.lord]);
    }
  });

  it("only names real rashis in its compatibility lists", () => {
    const known = new Set(ZODIAC_SIGNS.map((s) => `${s.name} (${s.sanskrit})`));
    for (const sign of ZODIAC_SIGNS) {
      for (const other of [...sign.compatibleWith, ...sign.challengingWith]) {
        expect(known).toContain(other);
      }
    }
  });

  it("never names a rashi as both harmonious and challenging", () => {
    for (const sign of ZODIAC_SIGNS) {
      const overlap = sign.compatibleWith.filter((s) => sign.challengingWith.includes(s));
      expect(overlap).toEqual([]);
    }
  });

  it("has written content in every prose field", () => {
    for (const sign of ZODIAC_SIGNS) {
      for (const field of ["personality", "career", "relationships", "health", "finance"] as const) {
        expect(sign[field].length).toBeGreaterThan(80);
      }
      expect(sign.strengths.length).toBeGreaterThanOrEqual(5);
      expect(sign.weaknesses.length).toBeGreaterThanOrEqual(4);
      expect(sign.remedies.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("resolves both the bare slug and the /sections/<sign>-horoscope slug", () => {
    expect(findZodiacSign("aries")?.name).toBe("Aries");
    expect(findZodiacSign("aries-horoscope")?.name).toBe("Aries");
    expect(findZodiacSign("PISCES-HOROSCOPE")?.sanskrit).toBe("Meena");
    expect(findZodiacSign("match-making")).toBeUndefined();
  });
});
