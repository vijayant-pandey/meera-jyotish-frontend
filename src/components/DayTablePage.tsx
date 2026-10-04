import { useEffect, useMemo, useState } from "react";
import type { ChoghadiyaDay } from "../types";
import type { ChoghadiyaSlot } from "../types";
import PlacePicker, { loadStoredPlace, type PickedPlace } from "./PlacePicker";

export type ClockMode = "12" | "24" | "24plus";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

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
  // Clamp so moving from the 31st into a short month does not roll over.
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

/** Counts down to `until`, ticking once a second. */
function useCountdown(until: string | null): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!until) {
    return "";
  }
  const remaining = new Date(until).getTime() - now;
  if (remaining <= 0) {
    return "00:00:00";
  }
  const total = Math.floor(remaining / 1000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

/** A diya: flame, bowl and base. Drawn here rather than borrowing an asset. */
function DiyaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="cg-icon" aria-hidden="true">
      <path className="flame" d="M12 2c1.8 2.4 2.7 4 2.7 5.3a2.7 2.7 0 0 1-5.4 0C9.3 6 10.2 4.4 12 2Z" />
      <path className="bowl" d="M3.5 13.5h17c-.7 3.1-3.9 5.2-8.5 5.2s-7.8-2.1-8.5-5.2Z" />
      <rect className="bowl" x="8" y="19.3" width="8" height="1.8" rx="0.9" />
    </svg>
  );
}

/** Rahu: the eclipse glyph, a shadowed disc over the serpent's crescent. */
function RahuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="cg-icon cg-icon-rahu" aria-hidden="true">
      <path d="M6 14.5a6 6 0 0 1 12 0" />
      <circle cx="12" cy="17.5" r="3.2" />
      <path d="M6 14.5c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5" opacity="0.45" />
    </svg>
  );
}

/**
 * Renders a slot time in the chosen clock.
 *
 * "24 Plus" is the panchang convention of continuing past 24:00 rather than
 * wrapping to 00:xx, so a slot running to 1:29 AM reads 25:29 and stays
 * visually after the 11 PM slot instead of jumping to the top of the clock.
 */
function formatTime(
  iso: string,
  mode: ClockMode,
  dayStart: string,
  isEnd = false
): string {
  const when = new Date(iso);
  if (mode === "12") {
    const label = when.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    // Only the closing time carries the next day's date, which is how printed
    // panchangs set it - dating both ends makes every post-midnight row wrap.
    const sameDay = when.toDateString() === new Date(`${dayStart}T00:00:00`).toDateString();
    return isEnd && !sameDay
      ? `${label}, ${when.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}`
      : label;
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  if (mode === "24") {
    return `${pad(when.getHours())}:${pad(when.getMinutes())}`;
  }
  const midnight = new Date(`${dayStart}T00:00:00`);
  const hours = Math.floor((when.getTime() - midnight.getTime()) / 3600000);
  return `${pad(hours)}:${pad(when.getMinutes())}`;
}

function SlotRow({
  slot,
  running,
  mode,
  dayStart
}: {
  slot: ChoghadiyaSlot;
  running: boolean;
  mode: ClockMode;
  dayStart: string;
}) {
  return (
    <div className={`cg-row${running ? " running" : ""}`}>
      <div className={`cg-name tone-${slot.tone}`}>
        <DiyaIcon />
        {slot.name} - {slot.quality}
      </div>
      <div className="cg-time">
        {formatTime(slot.start, mode, dayStart)} to {formatTime(slot.end, mode, dayStart, true)}
        {slot.rahuKala && (
          <span className="cg-rahu" title="Rahu Kala">
            <RahuIcon />
            Rahu Kala
          </span>
        )}
      </div>
    </div>
  );
}

export type DayTableConfig = {
  /** Banner heading, e.g. "Aaj Ka Choghadiya" or "Running Hora". */
  bannerTitle: string;
  dayTitle: string;
  nightTitle: string;
  fetcher: (
    place: { lat: number; lng: number; timezone: string; label: string },
    on?: string
  ) => Promise<ChoghadiyaDay>;
  /** Swatch key plus label, rendered under the table. */
  legend: { tone: string; label: string }[];
  className?: string;
};

export function DayTablePage({ config }: { config: DayTableConfig }) {
  const [place, setPlace] = useState<PickedPlace>(() => loadStoredPlace());
  const [day, setDay] = useState<string>(() => isoDay(new Date()));
  const [mode, setMode] = useState<ClockMode>("12");
  const [data, setData] = useState<ChoghadiyaDay | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void config.fetcher(place, day)
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Could not load this table.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [place, day, config]);

  const slots = useMemo(() => [...(data?.day ?? []), ...(data?.night ?? [])], [data]);
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const running = slots.find(
    (slot) => new Date(slot.start).getTime() <= tick && tick < new Date(slot.end).getTime()
  );
  const countdown = useCountdown(running?.end ?? null);

  const [year, month] = day.split("-").map(Number);
  const monthIndex = month - 1;
  const dayNumber = Number(day.split("-")[2]);

  return (
    <main className={`app-shell choghadiya-page ${config.className ?? ""}`}>
      <header className="cg-banner">
        <div className="cg-banner-main">
          <p className="cg-banner-title">{config.bannerTitle}</p>
          {running ? (
            <>
              <p className={`cg-current tone-${running.tone}`}>
                {running.name} - {running.quality}
              </p>
              <p className="cg-current-time">
                {formatTime(running.start, mode, data?.date ?? day)} to{" "}
                {formatTime(running.end, mode, data?.date ?? day, true)}
              </p>
              <p className="cg-countdown">{countdown}</p>
            </>
          ) : (
            <p className="cg-current-time">
              {loading ? "Calculating…" : "Not within today's span"}
            </p>
          )}
          <p className="cg-place">{data?.location ?? place.label}</p>
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
        ] as [ClockMode, string][]).map(([value, label]) => (
          <button
            type="button"
            key={value}
            className={mode === value ? "active" : ""}
            onClick={() => setMode(value)}
          >
            {label}
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
          <label htmlFor="cg-date">
            <span>Date</span>
          </label>
          <div className="date-nav-row">
            <button type="button" onClick={() => setDay(shiftDay(day, -1))}>
              &#8249; Prev Day
            </button>
            <input
              id="cg-date"
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
          <p className="cg-datetab">{data.dateLabel}</p>

          <div className="cg-grid">
            <section className="cg-column">
              <header className="cg-column-head">
                <span className="cg-col-title day">&#9728; {config.dayTitle}</span>
                <span className="cg-col-sun">&#9788; {data.sunriseLabel}</span>
              </header>
              {data.day.map((slot) => (
                <SlotRow
                  key={slot.start}
                  slot={slot}
                  running={slot.start === running?.start}
                  mode={mode}
                  dayStart={data.date}
                />
              ))}
            </section>

            <section className="cg-column">
              <header className="cg-column-head">
                <span className="cg-col-title night">&#9790; {config.nightTitle}</span>
                <span className="cg-col-sun">&#9790; {data.sunsetLabel}</span>
              </header>
              {data.night.map((slot) => (
                <SlotRow
                  key={slot.start}
                  slot={slot}
                  running={slot.start === running?.start}
                  mode={mode}
                  dayStart={data.date}
                />
              ))}
            </section>
          </div>

          <p className="cg-note">
            <strong>Notes:</strong> {data.note}
          </p>

          <ul className="cg-legend">
            {config.legend.map((item) => (
              <li key={item.tone}>
                <span className={`swatch tone-${item.tone}`} /> {item.label}
              </li>
            ))}
            <li>
              <span className="swatch swatch-rahu" /> Rahu Kala
            </li>
          </ul>
        </>
      )}
    </main>
  );
}

export default DayTablePage;
