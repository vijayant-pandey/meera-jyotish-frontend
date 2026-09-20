import { useMemo } from "react";
import type { Chart, DivisionalChartEntry } from "../types";

interface NorthIndianChartProps {
  chart: Chart;
  divisionalCharts?: DivisionalChartEntry[];
  selectedChartKey?: string;
  onSelectChart?: (chartKey: string) => void;
  /** Overrides the heading when the card shows a fixed chart rather than a chosen one. */
  eyebrow?: string;
  title?: string;
  focus?: string;
  /** Companion cards in a chart row are fixed, so they render without the picker. */
  showSelector?: boolean;
}

const HOUSE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 220, y: 92 },
  2: { x: 120, y: 55 },
  3: { x: 50, y: 125 },
  4: { x: 110, y: 210 },
  5: { x: 60, y: 320 },
  6: { x: 120, y: 375 },
  7: { x: 220, y: 330 },
  8: { x: 320, y: 390 },
  9: { x: 390, y: 330 },
  10: { x: 320, y: 210 },
  11: { x: 380, y: 120 },
  12: { x: 320, y: 55 }
};

function formatPlanetLines(planets: string[]): string[] {
  if (planets.length === 0) {
    return [];
  }

  const lines: string[] = [];
  for (let index = 0; index < planets.length; index += 3) {
    lines.push(planets.slice(index, index + 3).join(" "));
  }
  return lines;
}

function houseCopy(signNumber: number, planets: string[], isAscendant: boolean): string[] {
  const lines = [`S${signNumber}`];
  if (isAscendant) {
    lines.push("Asc");
  }
  return [...lines, ...formatPlanetLines(planets)];
}

export function NorthIndianChart({
  chart,
  divisionalCharts,
  selectedChartKey,
  onSelectChart,
  eyebrow = "Birth Chart",
  title,
  focus,
  showSelector = true
}: NorthIndianChartProps) {
  const chartOptions = useMemo<DivisionalChartEntry[]>(
    () =>
      divisionalCharts && divisionalCharts.length > 0
        ? divisionalCharts
        : [
            {
              key: "D1",
              factor: 1,
              title: "D-1 (Rashi)",
              focus: "Physical body and overall life",
              chart
            }
          ],
    [chart, divisionalCharts]
  );
  const selectedChart =
    chartOptions.find((option) => option.key === selectedChartKey) ?? chartOptions[0];

  return (
    <div className="chart-card">
      <div className="chart-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title ?? "North India Style"}</h3>
        </div>
        <div className="chart-controls">
          <p className="chart-meta">Ascendant: {selectedChart.chart.ascendantSignName}</p>
          <p className="chart-submeta">{focus ?? selectedChart?.focus}</p>
          {showSelector && (
            <label className="chart-selector">
              <span>Select Chart</span>
              <select
                value={selectedChart?.key ?? chartOptions[0]?.key ?? "D1"}
                onChange={(event) => onSelectChart?.(event.target.value)}
              >
                {chartOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.title}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      <svg viewBox="0 0 440 440" className="north-chart" role="img" aria-label="North India birth chart">
        <rect x="24" y="24" width="392" height="392" className="chart-line chart-outline" />
        <path d="M220 24 L416 220 L220 416 L24 220 Z" className="chart-line" />
        <path d="M24 24 L220 220 L24 416" className="chart-line" />
        <path d="M416 24 L220 220 L416 416" className="chart-line" />

        {selectedChart?.chart.houses.map((house) => {
          const position = HOUSE_POSITIONS[house.houseNumber];
          if (!position) {
            return null;
          }
          const lines = houseCopy(
            house.signNumber,
            house.planets,
            house.houseNumber === 1
          );

          return (
            <g key={house.houseNumber} transform={`translate(${position.x}, ${position.y})`}>
              <text className="house-label" y={-16}>
                H{house.houseNumber}
              </text>
              {lines.map((line, index) => (
                <text
                  key={`${house.houseNumber}-${line}`}
                  className={index === 0 ? "house-sign" : "house-planets"}
                  y={index * 16}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default NorthIndianChart;
