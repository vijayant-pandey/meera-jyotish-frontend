import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ResultsPanel from "./ResultsPanel";
import type { KundaliReport } from "../types";

const chart = {
  style: "north-india",
  ascendantSignNumber: 11,
  ascendantSignName: "Aquarius",
  houses: Array.from({ length: 12 }, (_, i) => ({
    houseNumber: i + 1,
    signNumber: ((10 + i) % 12) + 1,
    signName: "X",
    planets: []
  }))
};

const report = {
  id: "r1",
  createdAt: "2026-09-20T00:00:00Z",
  userId: "u1",
  request: {
    name: "Test",
    birthDate: "1990-12-02",
    birthTime12h: "12:50",
    meridiem: "PM",
    ayanamsha: "LAHIRI",
    place: { label: "Jabalpur", lat: 23.17, lng: 79.93, timezone: "Asia/Kolkata", precision: "city", source: "osm" }
  },
  result: {
    birthContext: {
      localDatetime: "1990-12-02T12:50:00+05:30",
      utcDatetime: "1990-12-02T07:20:00Z",
      timezone: "Asia/Kolkata",
      latitude: 23.17, longitude: 79.93, ayanamsha: "LAHIRI", julianDayUt: 2448227.8
    },
    ascendant: {
      longitude: 324.0172, signNumber: 11, signName: "Aquarius", degreeInSign: 24.017222,
      nakshatra: { number: 25, name: "Purva Bhadrapada", pada: 2, lord: "Jupiter" },
      subLord: "Mercury", signLord: "Saturn", housesRuled: [1]
    },
    chart,
    divisionalCharts: [{ key: "D1", factor: 1, title: "D-1 (Rashi)", focus: "f", chart }],
    planets: [
      {
        name: "Sun", abbreviation: "Su", longitude: 226.1139, signNumber: 8, signName: "Scorpio",
        degreeInSign: 16.113889, houseNumber: 10, retrograde: false,
        nakshatra: { number: 17, name: "Anuradha", pada: 4, lord: "Saturn" },
        combust: false, sanskritName: "Surya", relation: "Friend's House", dignity: "",
        subLord: "Jupiter", signLord: "Mars", housesRuled: [7]
      },
      {
        name: "Mars", abbreviation: "Ma", longitude: 39.97, signNumber: 2, signName: "Taurus",
        degreeInSign: 9.9709, houseNumber: 4, retrograde: true,
        nakshatra: { number: 3, name: "Krittika", pada: 4, lord: "Sun" },
        combust: false, sanskritName: "Mangal", relation: "Neutral", dignity: "",
        subLord: "Venus", signLord: "Venus", housesRuled: [3, 10]
      }
    ],
    panchang: { tithi: "t", vara: "v", nakshatra: "n", yoga: "y", karana: "k" },
    dasha: {
      system: "Vimshottari", yearDays: 365.25,
      sequence: ["Ketu"], yearsByLord: { Ketu: 7 },
      balanceAtBirth: { lord: "Moon", start: "2020-01-01T00:00:00Z", end: "2021-01-01T00:00:00Z", elapsedDays: 1, remainingDays: 1, remainingYears: 1, remainingNakshatraFraction: 0.5 },
      activeAtBirth: {
        mahadasha: "Ketu", antardasha: "Ketu", pratyantardasha: "Ketu", sookshma: "Ketu", prana: "Ketu",
        mahadashaPeriod: { level: "mahadasha", lord: "Ketu", label: "Ketu", path: ["Ketu"], start: "2020-01-01T00:00:00Z", end: "2021-01-01T00:00:00Z" },
        antardashaPeriod: { level: "antardasha", lord: "Ketu", label: "Ketu", path: ["Ketu", "Ketu"], start: "2020-01-01T00:00:00Z", end: "2021-01-01T00:00:00Z" },
        pratyantardashaPeriod: { level: "pratyantardasha", lord: "Ketu", label: "K", path: ["Ketu"], start: "2020-01-01T00:00:00Z", end: "2021-01-01T00:00:00Z" },
        sookshmaPeriod: { level: "sookshma", lord: "Ketu", label: "K", path: ["Ketu"], start: "2020-01-01T00:00:00Z", end: "2021-01-01T00:00:00Z" },
        pranaPeriod: { level: "prana", lord: "Ketu", label: "K", path: ["Ketu"], start: "2020-01-01T00:00:00Z", end: "2021-01-01T00:00:00Z" }
      },
      periods: [{ level: "mahadasha", lord: "Ketu", label: "Ketu", path: ["Ketu"], start: "2020-01-01T00:00:00Z", end: "2021-01-01T00:00:00Z" }]
    }
  }
} as unknown as KundaliReport;

describe("planet table columns", () => {
  it("fills Ruler of and B. Owner for every graha", () => {
    render(
      <ResultsPanel
        report={report}
        view="overview"
        activeChartKey="D1"
        onChartSelect={vi.fn()}
        onOpenOverview={vi.fn()}
        onOpenDasha={vi.fn()}
      />
    );

    const sunRow = screen.getByText("Surya").closest("tr") as HTMLElement;
    const sunCells = Array.from(sunRow.querySelectorAll("td")).map((c) => c.textContent);
    expect(sunCells[7]).toBe("7 Bhava");       // Ruler of
    expect(sunCells[8]).toBe("10 Bhava");      // Is In
    expect(sunCells[9]).toBe("Mars");          // B. Owner

    const marsRow = screen.getByText("Mangal").closest("tr") as HTMLElement;
    const marsCells = Array.from(marsRow.querySelectorAll("td")).map((c) => c.textContent);
    expect(marsCells[7]).toBe("3, 10 Bhava");
    expect(marsCells[9]).toBe("Venus");

    const lagnaRow = screen.getByText("Lagna").closest("tr") as HTMLElement;
    const lagnaCells = Array.from(lagnaRow.querySelectorAll("td")).map((c) => c.textContent);
    expect(lagnaCells[7]).toBe("1 Bhava");
    expect(lagnaCells[9]).toBe("Saturn");
  });
});
