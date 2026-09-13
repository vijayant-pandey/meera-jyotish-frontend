import { describe, expect, it } from "vitest";
import { buildChildPeriods, findSelectedPeriod, pathKey } from "./dasha";
import type { DashaPeriod } from "./types";

const YEARS_BY_LORD = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17
};

const SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

describe("dasha helpers", () => {
  it("builds proportional antardashas from a parent period", () => {
    const parent: DashaPeriod = {
      level: "mahadasha",
      lord: "Venus",
      label: "Venus",
      path: ["Venus"],
      start: "2000-01-01T00:00:00.000Z",
      end: "2000-04-30T00:00:00.000Z"
    };

    const children = buildChildPeriods(parent, SEQUENCE, YEARS_BY_LORD, "antardasha");

    expect(children).toHaveLength(9);
    expect(children[0].lord).toBe("Venus");
    expect(children[1].lord).toBe("Sun");

    const firstDurationDays =
      (new Date(children[0].end).getTime() - new Date(children[0].start).getTime()) / 86_400_000;
    const secondDurationDays =
      (new Date(children[1].end).getTime() - new Date(children[1].start).getTime()) / 86_400_000;

    expect(firstDurationDays).toBeCloseTo(20, 5);
    expect(secondDurationDays).toBeCloseTo(6, 5);
  });

  it("finds an explicitly selected period before falling back", () => {
    const periods: DashaPeriod[] = [
      {
        level: "mahadasha",
        lord: "Ketu",
        label: "Ketu",
        path: ["Ketu"],
        start: "2000-01-01T00:00:00.000Z",
        end: "2000-01-08T00:00:00.000Z"
      },
      {
        level: "mahadasha",
        lord: "Venus",
        label: "Venus",
        path: ["Venus"],
        start: "2000-01-08T00:00:00.000Z",
        end: "2000-01-28T00:00:00.000Z"
      }
    ];

    const selected = findSelectedPeriod(periods, pathKey(["Venus"]), periods[0]);
    expect(selected.lord).toBe("Venus");
  });
});
