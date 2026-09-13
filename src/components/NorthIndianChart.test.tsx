import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { NorthIndianChart } from "./NorthIndianChart";

describe("NorthIndianChart", () => {
  it("renders house labels and planets", () => {
    render(
      <NorthIndianChart
        chart={{
          style: "north-india",
          ascendantSignNumber: 1,
          ascendantSignName: "Aries",
          houses: Array.from({ length: 12 }, (_, index) => ({
            houseNumber: index + 1,
            signNumber: index + 1,
            signName: "Test",
            planets: index === 0 ? ["Su", "Mo"] : []
          }))
        }}
      />
    );

    expect(screen.getByText("H1")).toBeInTheDocument();
    expect(screen.getByText("S1")).toBeInTheDocument();
    expect(screen.getByText("Su Mo")).toBeInTheDocument();
  });

  it("switches to a selected divisional chart from the dropdown", () => {
    const chartOptions = [
      {
        key: "D1",
        factor: 1,
        title: "D-1 (Rashi)",
        focus: "Physical body and overall life",
        chart: {
          style: "north-india" as const,
          ascendantSignNumber: 1,
          ascendantSignName: "Aries",
          houses: Array.from({ length: 12 }, (_, index) => ({
            houseNumber: index + 1,
            signNumber: index + 1,
            signName: "Test",
            planets: index === 0 ? ["Su"] : []
          }))
        }
      },
      {
        key: "D9",
        factor: 9,
        title: "D-9 (Navamsa)",
        focus: "Marriage, partnerships, and inner strength",
        chart: {
          style: "north-india" as const,
          ascendantSignNumber: 9,
          ascendantSignName: "Sagittarius",
          houses: Array.from({ length: 12 }, (_, index) => ({
            houseNumber: index + 1,
            signNumber: ((index + 8) % 12) + 1,
            signName: "Test",
            planets: index === 0 ? ["Mo"] : []
          }))
        }
      }
    ];

    function ChartHarness() {
      const [selectedChartKey, setSelectedChartKey] = useState("D1");
      return (
        <NorthIndianChart
          chart={chartOptions[0].chart}
          divisionalCharts={chartOptions}
          selectedChartKey={selectedChartKey}
          onSelectChart={setSelectedChartKey}
        />
      );
    }

    render(
      <ChartHarness />
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "D9" } });

    expect(screen.getByText("Ascendant: Sagittarius")).toBeInTheDocument();
    expect(screen.getByDisplayValue("D-9 (Navamsa)")).toBeInTheDocument();
  });
});
