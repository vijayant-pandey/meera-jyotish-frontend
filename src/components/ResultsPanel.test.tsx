import { describe, expect, it } from "vitest";
import { buildChartRow } from "./ResultsPanel";
import type { Chart, DivisionalChartEntry } from "../types";

const chart: Chart = {
  style: "north-india",
  ascendantSignNumber: 1,
  ascendantSignName: "Aries",
  houses: []
};

const entry = (key: string): DivisionalChartEntry => ({
  key,
  factor: 1,
  title: key,
  focus: key,
  chart
});

const CHARTS = ["D1", "CHALIT", "D2", "D9", "D10"].map(entry);

function keys(selected: string) {
  const selectedEntry = CHARTS.find((c) => c.key === selected)!;
  return buildChartRow(CHARTS, selectedEntry).map((c) => c.key);
}

describe("buildChartRow", () => {
  it("shows D1, Chalit and D9 together on the D1 route", () => {
    expect(keys("D1")).toEqual(["D1", "CHALIT", "D9"]);
  });

  it("keeps the selected chart first and still shows both companions", () => {
    expect(keys("D10")).toEqual(["D10", "CHALIT", "D9"]);
  });

  it("never repeats a chart when the selection is already a companion", () => {
    expect(keys("D9")).toEqual(["D9", "CHALIT", "D1"]);
    expect(keys("CHALIT")).toEqual(["CHALIT", "D9", "D1"]);
  });

  it("always returns three cards", () => {
    for (const key of CHARTS.map((c) => c.key)) {
      expect(buildChartRow(CHARTS, CHARTS.find((c) => c.key === key)!)).toHaveLength(3);
    }
  });

  it("degrades gracefully when companions are missing", () => {
    const few = [entry("D1"), entry("D3")];
    expect(buildChartRow(few, few[1]).map((c) => c.key)).toEqual(["D3", "D1"]);
  });
});
