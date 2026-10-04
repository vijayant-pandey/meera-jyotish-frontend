import { useEffect, useState } from "react";
import { fetchRahuKaal } from "../api";
import type { RahuKaal } from "../types";
import AlmanacPage, { ALMANAC_ROUTES } from "./AlmanacPage";
import PlacePicker, { loadStoredPlace, type PickedPlace } from "./PlacePicker";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

type ClockMode = "12" | "24" | "24plus";

function isoDay(value: Date): string {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}

function shiftDay(iso: string, days: number): string {
  const base = new Date(`${iso}T00:00:00`);
  base.setDate(base.getDate() + days);
  return isoDay(base);
}

function withMonth(iso: string, month: number): string {
  const [year, , day] = iso.split("-").map(Number);
  const lastDay = new Date(year, month + 1, 0).getDate();
  return isoDay(new Date(year, month, Math.min(day, lastDay)));
}

function withDay(iso: string, day: number): string {
  const [year, month] = iso.split("-").map(Number);
  return isoDay(new Date(year, month - 1, day));
}

function daysInMonth(iso: string): number {
  const [year, month] = iso.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function formatTime(iso: string, mode: ClockMode, dayStart: string): string {
  const when = new Date(iso);
  if (mode === "12") {
    return when.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  if (mode === "24") {
    return `${pad(when.getHours())}:${pad(when.getMinutes())}`;
  }
  const midnight = new Date(`${dayStart}T00:00:00`);
  const hours = Math.floor((when.getTime() - midnight.getTime()) / 3600000);
  return `${pad(hours)}:${pad(when.getMinutes())}`;
}

/** Rahu: the serpent's head over a shadowed disc. */
function RahuBadge() {
  return (
    <svg viewBox="0 0 64 64" className="rk-badge" aria-hidden="true">
      <circle cx="32" cy="32" r="30" className="rk-badge-disc" />
      <path
        className="rk-badge-mark"
        d="M18 40c0-11 6-18 14-18s14 7 14 18"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="44" r="7" className="rk-badge-mark-fill" />
      <path
        className="rk-badge-mark"
        d="M18 40c-3 0-5-2-5-5M46 40c3 0 5-2 5-5"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The eight divisions of daylight, with the weekday whose Rahu Kaal lands in
 * each. The first slice is always empty: no weekday puts Rahu in period one,
 * which is why that period is held to be free of him.
 */
function WeekdayWheel({ data }: { data: RahuKaal }) {
  const radius = 92;
  const centre = 104;
  const slice = 360 / 8;

  const point = (angle: number, r: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return [centre + r * Math.cos(radians), centre + r * Math.sin(radians)];
  };

  return (
    <svg viewBox="0 0 208 208" className="rk-wheel" role="img" aria-label="Rahu Kaal by weekday">
      {data.weekdayWheel.map((item, index) => {
        const from = index * slice;
        const to = from + slice;
        const [x1, y1] = point(from, radius);
        const [x2, y2] = point(to, radius);
        const [lx, ly] = point(from + slice / 2, radius * 0.66);
        const today = item.weekday === data.weekday;
        return (
          <g key={item.period}>
            <path
              d={`M ${centre} ${centre} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
              className={
                item.weekday ? (today ? "rk-slice today" : "rk-slice") : "rk-slice empty"
              }
            />
            <text
              x={lx}
              y={ly}
              className="rk-slice-label"
              textAnchor="middle"
              transform={`rotate(${from + slice / 2} ${lx} ${ly})`}
            >
              {item.weekday || "Free"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function RahuKaalPage() {
  const [place, setPlace] = useState<PickedPlace>(() => loadStoredPlace());
  const [day, setDay] = useState<string>(() => isoDay(new Date()));
  const [mode, setMode] = useState<ClockMode>("12");
  const [data, setData] = useState<RahuKaal | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError("");
    void fetchRahuKaal(place, day)
      .then((result) => !cancelled && setData(result))
      .catch(
        (cause) =>
          !cancelled &&
          setError(cause instanceof Error ? cause.message : "Could not load Rahu Kaal.")
      );
    return () => {
      cancelled = true;
    };
  }, [place, day]);

  const [year, month] = day.split("-").map(Number);
  const monthIndex = month - 1;
  const dayNumber = Number(day.split("-")[2]);

  const begins = data ? new Date(data.start).getTime() : 0;
  const ends = data ? new Date(data.end).getTime() : 0;
  const status = !data ? "" : now < begins ? "Starts in" : now < ends ? "Running" : "Over";
  const target = status === "Starts in" ? begins : ends;
  const remaining = Math.max(0, target - now);
  const pad = (value: number) => String(value).padStart(2, "0");
  const countdown =
    status === "Over"
      ? "00:00:00"
      : `${pad(Math.floor(remaining / 3600000))}:${pad(
          Math.floor((remaining % 3600000) / 60000)
        )}:${pad(Math.floor((remaining % 60000) / 1000))}`;

  return (
    <main className="app-shell choghadiya-page rahu-page">
      <header className="cg-banner">
        <div className="cg-banner-main rk-banner-main">
          <p className="cg-banner-title">Rahu Kaal Today</p>
          <div className="rk-banner-row">
            <RahuBadge />
            <div>
              <p className="cg-current rk-status">{status || "Calculating…"}</p>
              {data && (
                <p className="cg-current-time">
                  {formatTime(data.start, mode, data.date)} to{" "}
                  {formatTime(data.end, mode, data.date)}
                </p>
              )}
              <p className="cg-countdown">{data ? countdown : ""}</p>
              <p className="cg-place">{data?.location ?? place.label}</p>
            </div>
          </div>
        </div>
        <div className="cg-banner-date">
          <strong>{String(dayNumber).padStart(2, "0")}</strong>
          <span>
            {MONTHS[monthIndex]} {year}
          </span>
          <span>{data?.weekday ?? ""}</span>
        </div>
      </header>

      <div className="cg-modes" role="group" aria-label="Clock format">
        {([
          ["12", "12 Hour"],
          ["24", "24 Hour"],
          ["24plus", "24 Plus"]
        ] as [ClockMode, string][]).map(([value, text]) => (
          <button
            type="button"
            key={value}
            className={mode === value ? "active" : ""}
            onClick={() => setMode(value)}
          >
            {text}
          </button>
        ))}
      </div>

      <nav className="cg-strip" aria-label="Month">
        <button type="button" onClick={() => setDay(withMonth(day, (monthIndex + 11) % 12))}>
          &#8249;
        </button>
        {MONTHS.map((name, index) => (
          <button
            type="button"
            key={name}
            className={index === monthIndex ? "active" : ""}
            onClick={() => setDay(withMonth(day, index))}
          >
            {name}
          </button>
        ))}
        <button type="button" onClick={() => setDay(withMonth(day, (monthIndex + 1) % 12))}>
          &#8250;
        </button>
      </nav>

      <nav className="cg-strip cg-days" aria-label="Day of month">
        {Array.from({ length: daysInMonth(day) }, (_, index) => index + 1).map((value) => (
          <button
            type="button"
            key={value}
            className={value === dayNumber ? "active" : ""}
            onClick={() => setDay(withDay(day, value))}
          >
            {value}
          </button>
        ))}
      </nav>

      <div className="cg-controls">
        <PlacePicker value={place} onChange={setPlace} />
        <div className="date-nav">
          <label htmlFor="rk-date">
            <span>Date</span>
          </label>
          <div className="date-nav-row">
            <button type="button" onClick={() => setDay(shiftDay(day, -1))}>
              &#8249; Prev Day
            </button>
            <input
              id="rk-date"
              type="date"
              value={day}
              onChange={(event) => event.target.value && setDay(event.target.value)}
            />
            <button type="button" onClick={() => setDay(isoDay(new Date()))}>
              Today
            </button>
            <button type="button" onClick={() => setDay(shiftDay(day, 1))}>
              Next Day &#8250;
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {data && (
        <>
          <div className="rk-cards">
            <section className="rk-card">
              <header>Rahu Kaal Timing</header>
              <div className="rk-card-body">
                <RahuBadge />
                <p className="rk-time">
                  {formatTime(data.start, mode, data.date)} to{" "}
                  {formatTime(data.end, mode, data.date)}
                </p>
                <p className="rk-date">{data.dateLabel}</p>
                <p className="rk-duration">Duration {data.durationLabel}</p>
              </div>
            </section>

            <section className="rk-card">
              <header>Rahu Kaal on Weekdays</header>
              <div className="rk-card-body">
                <div className="rk-wheel-row">
                  <span className="rk-wheel-end" title={`Sunrise ${data.sunriseLabel}`}>
                    &#9728;
                    <small>{data.sunriseLabel}</small>
                  </span>
                  <WeekdayWheel data={data} />
                  <span className="rk-wheel-end" title={`Sunset ${data.sunsetLabel}`}>
                    &#9790;
                    <small>{data.sunsetLabel}</small>
                  </span>
                </div>
                <p className="rk-wheel-caption">
                  Daylight split into eight. Rahu Kaal falls in the {data.period}
                  <sup>{["th", "st", "nd", "rd"][data.period % 10] ?? "th"}</sup> period on{" "}
                  {data.weekday}.
                </p>
              </div>
            </section>
          </div>

          <p className="cg-note">
            <strong>Notes:</strong> {data.note}
          </p>
        </>
      )}

      {/* The muhurta table that used to be the whole of this page, kept below. */}
      <section className="rk-existing">
        <AlmanacPage route={ALMANAC_ROUTES["rahu-kalam"]} />
      </section>

      <section className="panel rk-about">
        <h2>About Rahu Kaal</h2>
        <p>
          Rahu is held to be an inauspicious graha, and the stretch of each day under his
          influence is avoided for auspicious work. Puja, hawan or yagya begun in Rahu Kaal is
          said not to carry its intended result, so the period is checked before starting
          anything new. Work related to Rahu himself is the exception and is considered
          favourable in it.
        </p>
        <p>
          Rahu Kaal, also spelled Rahu Kala, Rahu Kal, Rahu Kalam and Rahu Kalaam, lasts roughly
          an hour and a half. The span between sunrise and sunset is divided into eight equal
          parts, and one of those eight is Rahu&rsquo;s, decided by the weekday.
        </p>
        <p>
          Because it is built from local sunrise and sunset, the timing and the duration differ
          from place to place and from day to day. Even in one city it shifts across the year as
          the length of daylight changes, so it is worth checking for the actual date and place
          rather than reusing yesterday&rsquo;s figure.
        </p>
        <p>
          The first of the eight periods after sunrise is never Rahu&rsquo;s on any weekday, which
          is why it is treated as reliably free of him. On <strong>Monday</strong> Rahu Kaal falls
          in the 2nd period, <strong>Saturday</strong> the 3rd, <strong>Friday</strong> the 4th,{" "}
          <strong>Wednesday</strong> the 5th, <strong>Thursday</strong> the 6th,{" "}
          <strong>Tuesday</strong> the 7th and <strong>Sunday</strong> the 8th.
        </p>
      </section>
    </main>
  );
}

export default RahuKaalPage;
