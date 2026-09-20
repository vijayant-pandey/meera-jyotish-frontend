import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PanchangChart } from "./PanchangChart";
import type { PanchangSegment, PanchangTimeline } from "../types";

/** Jabalpur, 20 September 2026 - the day the backend tests pin to. */
const IST = "+05:30";
const on = (day: number, time: string) => `2026-09-${day}T${time}:00${IST}`;

const segment = (
  name: string,
  startsAt: string,
  endsAt: string,
  extra = ""
): PanchangSegment => ({ name, startsAt, endsAt, number: 1, extra });

const TIMELINE: PanchangTimeline = {
  sunrise: on(20, "05:58"),
  sunset: on(20, "18:09"),
  nextSunrise: on(21, "05:58"),
  vara: "Raviwara",
  tithi: [
    segment("Navami", on(20, "05:58"), on(20, "17:52"), "Shukla"),
    segment("Dashami", on(20, "17:52"), on(21, "05:58"), "Shukla")
  ],
  nakshatra: [
    segment("Purva Ashadha", on(20, "05:58"), on(21, "04:34")),
    segment("Uttara Ashadha", on(21, "04:34"), on(21, "05:58"))
  ],
  yoga: [
    segment("Saubhagya", on(20, "05:58"), on(20, "15:22")),
    segment("Shobhana", on(20, "15:22"), on(21, "05:58"))
  ],
  karana: [
    segment("Kaulava", on(20, "05:58"), on(20, "17:52")),
    segment("Taitila", on(20, "17:52"), on(21, "05:58"))
  ],
  choghadiya: [
    segment("Udvega", on(20, "05:58"), on(20, "07:29"), "Inauspicious"),
    segment("Chara", on(20, "07:29"), on(20, "09:00"), "Auspicious"),
    segment("Kala", on(20, "12:03"), on(20, "13:34"), "Inauspicious")
  ]
};

const panchang = { timezone: "Asia/Kolkata", timeline: TIMELINE };

describe("PanchangChart", () => {
  it("draws a row for each limb of the panchang", () => {
    render(<PanchangChart panchang={panchang} mode="12" />);

    for (const label of ["Tithi", "Nakshatra", "Yoga", "Karana", "Weekday"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("Navami, Shukla")).toBeInTheDocument();
    expect(screen.getByText("Purva Ashadha")).toBeInTheDocument();
    expect(screen.getByText("Saubhagya")).toBeInTheDocument();
    expect(screen.getByText("Kaulava")).toBeInTheDocument();
    expect(screen.getByText("Raviwara")).toBeInTheDocument();
  });

  it("marks sunrise, sunset and the next sunrise", () => {
    render(<PanchangChart panchang={panchang} mode="12" />);

    // Both ends of the window are sunrise, so the same label appears twice.
    expect(screen.getAllByText("05:58")).toHaveLength(2);
    expect(screen.getByText("06:09")).toBeInTheDocument();
  });

  it("labels division boundaries in the selected clock", () => {
    const { rerender } = render(<PanchangChart panchang={panchang} mode="12" />);
    // 17:52 on a 12 hour chart, without a meridiem. It is marked twice: the
    // tithi and the karana turn together, a karana being half a tithi.
    expect(screen.getAllByText("05:52")).toHaveLength(2);
    expect(screen.getByText("04:34")).toBeInTheDocument();

    rerender(<PanchangChart panchang={panchang} mode="24" />);
    expect(screen.getAllByText("17:52")).toHaveLength(2);
    expect(screen.getByText("18:09")).toBeInTheDocument();
  });

  it("names only the inauspicious choghadiya on the weekday row", () => {
    render(<PanchangChart panchang={panchang} mode="12" />);

    expect(screen.getByText("Udvega")).toBeInTheDocument();
    expect(screen.getByText("Kala")).toBeInTheDocument();
    expect(screen.queryByText("Chara")).not.toBeInTheDocument();
  });

  it("drops a segment name that would not fit inside its own segment", () => {
    // Uttara Ashadha holds for 84 minutes of a 25 hour axis, far too narrow to
    // letter without running into its neighbour.
    render(<PanchangChart panchang={panchang} mode="12" />);
    expect(screen.queryByText("Uttara Ashadha")).not.toBeInTheDocument();
  });

  it("renders nothing when the timeline is missing", () => {
    const { container } = render(
      <PanchangChart
        panchang={{ timezone: "Asia/Kolkata", timeline: undefined as unknown as PanchangTimeline }}
        mode="12"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
