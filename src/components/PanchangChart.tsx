import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { DailyPanchang, PanchangSegment } from "../types";

export type ClockMode = "12" | "24";

const HOUR = 3_600_000;

/* Geometry. The chart is drawn at natural pixel size rather than scaled from a
   viewBox, so labels stay the same size whatever the section is widened to. */
const PAD_LEFT = 84;
const PAD_RIGHT = 18;
const AXIS_Y = 54;
const ROWS_TOP = 78;
const ROW_H = 46;
const ROW_COUNT = 5; // tithi, nakshatra, yoga, karana, weekday
const HEIGHT = ROWS_TOP + ROW_COUNT * ROW_H + 18;
/* Below this the choghadiya names stop fitting, so the wrapper scrolls rather
   than the chart shrinking into illegibility. */
const MIN_WIDTH = 900;
const FALLBACK_WIDTH = 1040;
/* Rough advance of the 11px label font, used only to decide whether a name fits
   inside its segment - being a little pessimistic is the safe direction. */
const CHAR_PX = 5.6;

const at = (iso: string) => new Date(iso).getTime();

function fits(text: string, width: number): boolean {
  return width > text.length * CHAR_PX + 8;
}

/** The meridiem is dropped: position along the axis already says which half of
 *  the day a time falls in, which is how a printed panchang chart reads. */
function clockLabel(moment: number, zone: string, mode: ClockMode): string {
  return new Date(moment)
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: mode === "12",
      timeZone: zone
    })
    .replace(/\s*[ap]\.?\s*m\.?$/i, "");
}

/** Just the hour number, as it reads along the axis. */
function hourLabel(moment: number, zone: string, mode: ClockMode): string {
  return new Date(moment)
    .toLocaleString("en-GB", { hour: "numeric", hour12: mode === "12", timeZone: zone })
    .replace(/\D/g, "");
}

/** Start of the clock hour containing `moment`, in the panchang's own zone.
 *  Read back from the formatted parts so half-hour offsets like IST land right. */
function floorToHour(moment: number, zone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour12: false,
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(new Date(moment));
  const part = (type: string) => Number(parts.find((entry) => entry.type === type)?.value ?? 0);
  return moment - (part("minute") * 60 + part("second")) * 1000;
}

function SunGlyph({ x, y, className }: { x: number; y: number; className: string }) {
  return (
    <g className={className} transform={`translate(${x} ${y})`}>
      <path d="M -7 0 A 7 7 0 0 1 7 0 Z" />
      <line x1={-11} y1={0} x2={11} y2={0} />
    </g>
  );
}

/** Tracks the rendered width of the wrapper so the chart can be drawn to fit. */
function useMeasuredWidth() {
  const box = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState(0);

  useEffect(() => {
    const node = box.current;
    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      if (next > 0) {
        setMeasured(next);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [box, Math.max(MIN_WIDTH, measured || FALLBACK_WIDTH)] as const;
}

/* Only these two fields are read, so say so: it keeps the chart usable from a
   plain timeline without hauling a whole report along. */
type ChartProps = {
  panchang: Pick<DailyPanchang, "timezone" | "timeline">;
  mode: ClockMode;
};

export function PanchangChart({ panchang, mode }: ChartProps) {
  const line = panchang.timeline;
  const zone = panchang.timezone;
  const [box, width] = useMeasuredWidth();

  const axis = useMemo(() => {
    if (!line) {
      return null;
    }
    const sunrise = at(line.sunrise);
    const nextSunrise = at(line.nextSunrise);
    // Pad out to whole hours at both ends so the sun markers sit inside the
    // plot rather than flush against its edges.
    const from = floorToHour(sunrise, zone);
    const floored = floorToHour(nextSunrise, zone);
    const to = floored === nextSunrise ? floored : floored + HOUR;
    const ticks: number[] = [];
    for (let tick = from; tick <= to; tick += HOUR) {
      ticks.push(tick);
    }
    return { sunrise, nextSunrise, sunset: at(line.sunset), from, to, ticks };
  }, [line, zone]);

  if (!line || !axis) {
    return null;
  }

  const plot = width - PAD_LEFT - PAD_RIGHT;
  const x = (moment: number) => PAD_LEFT + ((moment - axis.from) / (axis.to - axis.from)) * plot;

  const rows: { label: string; segments: PanchangSegment[] }[] = [
    { label: "Tithi", segments: line.tithi },
    { label: "Nakshatra", segments: line.nakshatra },
    { label: "Yoga", segments: line.yoga },
    { label: "Karana", segments: line.karana }
  ];
  const weekdayBaseline = ROWS_TOP + rows.length * ROW_H + 22;
  const inauspicious = line.choghadiya.filter((segment) => segment.extra === "Inauspicious");

  const sunEvents = [
    { key: "sunrise", moment: axis.sunrise, rising: true },
    { key: "sunset", moment: axis.sunset, rising: false },
    { key: "next-sunrise", moment: axis.nextSunrise, rising: true }
  ];

  return (
    <div className="dp-chart" ref={box}>
      <svg
        className="dp-chart-svg"
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`Panchang for ${line.vara}, sunrise ${clockLabel(axis.sunrise, zone, mode)} to the next sunrise: tithi, nakshatra, yoga, karana and choghadiya`}
      >
        {/* Night is the ground; the daylight stretch is painted over it. */}
        <rect className="dp-chart-night" x={PAD_LEFT} y={0} width={plot} height={HEIGHT} />
        <rect
          className="dp-chart-day"
          x={x(axis.sunrise)}
          y={0}
          width={Math.max(0, x(axis.sunset) - x(axis.sunrise))}
          height={HEIGHT}
        />

        <line
          className="dp-chart-axis"
          x1={PAD_LEFT}
          y1={AXIS_Y}
          x2={PAD_LEFT + plot}
          y2={AXIS_Y}
        />
        {axis.ticks.map((tick) => (
          <g key={tick}>
            <line
              className="dp-chart-tick"
              x1={x(tick)}
              y1={AXIS_Y - 4}
              x2={x(tick)}
              y2={AXIS_Y + 4}
            />
            <text className="dp-chart-hour" x={x(tick)} y={AXIS_Y + 18} textAnchor="middle">
              {hourLabel(tick, zone, mode)}
            </text>
          </g>
        ))}

        {sunEvents.map((event) => (
          <g key={event.key}>
            <line
              className="dp-chart-sunline"
              x1={x(event.moment)}
              y1={AXIS_Y}
              x2={x(event.moment)}
              y2={HEIGHT - 2}
            />
            <text
              className="dp-chart-suntime"
              x={x(event.moment)}
              y={AXIS_Y - 21}
              textAnchor="middle"
            >
              {clockLabel(event.moment, zone, mode)}
            </text>
            <SunGlyph
              x={x(event.moment)}
              y={AXIS_Y}
              className={event.rising ? "dp-chart-sun" : "dp-chart-sun dp-chart-sun-set"}
            />
          </g>
        ))}

        {rows.map((row, index) => {
          const baseline = ROWS_TOP + index * ROW_H + 22;
          return (
            <g key={row.label}>
              <text
                className="dp-chart-row-label"
                x={PAD_LEFT - 10}
                y={baseline + 4}
                textAnchor="end"
              >
                {row.label}
              </text>
              <line
                className="dp-chart-band"
                x1={x(axis.sunrise)}
                y1={baseline}
                x2={x(axis.nextSunrise)}
                y2={baseline}
              />

              {row.segments.map((segment) => {
                const from = x(at(segment.startsAt));
                const to = x(at(segment.endsAt));
                const name = segment.extra ? `${segment.name}, ${segment.extra}` : segment.name;
                if (!fits(name, to - from)) {
                  return null;
                }
                return (
                  <text
                    key={segment.startsAt}
                    className="dp-chart-segment"
                    x={(from + to) / 2}
                    y={baseline - 9}
                    textAnchor="middle"
                  >
                    {name}
                  </text>
                );
              })}

              {/* Every boundary but the last, which is just the window closing. */}
              {row.segments.slice(0, -1).map((segment) => {
                const edge = x(at(segment.endsAt));
                return (
                  <g key={`edge-${segment.endsAt}`}>
                    <line
                      className="dp-chart-edge"
                      x1={edge}
                      y1={baseline - 30}
                      x2={edge}
                      y2={baseline + 30}
                    />
                    <path
                      className="dp-chart-arrow"
                      d={`M ${edge - 10} ${baseline} L ${edge - 3} ${baseline - 4} L ${edge - 3} ${baseline + 4} Z`}
                    />
                    <path
                      className="dp-chart-arrow"
                      d={`M ${edge + 10} ${baseline} L ${edge + 3} ${baseline - 4} L ${edge + 3} ${baseline + 4} Z`}
                    />
                    <text className="dp-chart-time" x={edge} y={baseline + 17} textAnchor="middle">
                      {clockLabel(at(segment.endsAt), zone, mode)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Weekday row: the vara, marked with the inauspicious choghadiya. */}
        <text
          className="dp-chart-row-label"
          x={PAD_LEFT - 10}
          y={weekdayBaseline + 4}
          textAnchor="end"
        >
          Weekday
        </text>
        <line
          className="dp-chart-band"
          x1={x(axis.sunrise)}
          y1={weekdayBaseline}
          x2={x(axis.nextSunrise)}
          y2={weekdayBaseline}
        />
        {inauspicious.map((segment) => {
          const from = x(at(segment.startsAt));
          const to = x(at(segment.endsAt));
          return (
            <g key={segment.startsAt}>
              <line
                className="dp-chart-bad"
                x1={from}
                y1={weekdayBaseline}
                x2={to}
                y2={weekdayBaseline}
              />
              {fits(segment.name, to - from) && (
                <text
                  className="dp-chart-bad-label"
                  x={(from + to) / 2}
                  y={weekdayBaseline - 9}
                  textAnchor="middle"
                >
                  {segment.name}
                </text>
              )}
            </g>
          );
        })}
        <text
          className="dp-chart-vara"
          x={(x(axis.sunrise) + x(axis.nextSunrise)) / 2}
          y={weekdayBaseline + 27}
          textAnchor="middle"
        >
          {line.vara}
        </text>
      </svg>
    </div>
  );
}

/* The section around this re-renders once a second to tick its clocks. The
   chart only changes when the panchang is refetched, so memoise it. */
export default memo(PanchangChart);
