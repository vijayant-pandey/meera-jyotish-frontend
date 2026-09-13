import { describe, expect, it } from "vitest";
import { canGenerateFromPlace, effectivePrecision, formatDateTime, isValidTime12h } from "./utils";

describe("utils", () => {
  it("validates 12-hour time strings", () => {
    expect(isValidTime12h("07:35")).toBe(true);
    expect(isValidTime12h("13:35")).toBe(false);
  });

  it("upgrades precision to manual when edited", () => {
    expect(effectivePrecision("city", true)).toBe("manual");
    expect(effectivePrecision("city", false)).toBe("city");
  });

  it("checks whether a place is ready for generation", () => {
    expect(
      canGenerateFromPlace({
        label: "Delhi, India",
        lat: 28.6139,
        lng: 77.209,
        timezone: "Asia/Kolkata",
        precision: "city",
        source: "manual"
      })
    ).toBe(true);
  });

  it("formats datetimes with a timezone safely", () => {
    expect(formatDateTime("2024-01-01T12:00:00Z", "UTC")).toContain("2024");
  });
});
