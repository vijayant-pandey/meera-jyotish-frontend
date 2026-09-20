import { describe, expect, it } from "vitest";
import {
  canGenerateFromPlace,
  effectivePrecision,
  formatDateTime,
  formatBhavas,
  formatDms,
  formatPosition,
  isValidTime12h
} from "./utils";

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

  it("formats a degree-in-sign as zero-padded degrees-minutes-seconds", () => {
    expect(formatDms(15.803611)).toBe("15-48-13");
    expect(formatDms(9.911111)).toBe("09-54-40");
    expect(formatDms(0)).toBe("00-00-00");
  });

  it("formats a position the way classical tables do", () => {
    // Aquarius is sign 11; 24.0172 deg -> 24 deg Kumb 01' 02"
    expect(formatPosition(24.017222, 11)).toBe("24° Kumb 01′ 02″");
    expect(formatPosition(6.972222, 10)).toBe("06° Maka 58′ 20″");
  });

  it("lists ruled bhavas, or a dash when a graha rules none", () => {
    expect(formatBhavas([3, 10])).toBe("3, 10 Bhava");
    expect(formatBhavas([7])).toBe("7 Bhava");
    expect(formatBhavas([])).toBe("-");
    expect(formatBhavas(undefined)).toBe("-");
  });

  it("carries seconds into minutes rather than printing 60", () => {
    expect(formatDms(1.0 - 0.5 / 3600)).toBe("01-00-00");
    expect(formatDms(5.999999)).toBe("06-00-00");
  });
});
