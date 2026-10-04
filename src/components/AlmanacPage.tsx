import { useEffect, useState } from "react";
import { fetchAlmanacSection } from "../api";
import type { AlmanacSection } from "../types";
import PlacePicker, { loadStoredPlace, type PickedPlace } from "./PlacePicker";

/** Astrological glyphs for the hora lords. */
const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄"
};

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="group-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="2.5"
          x2="12"
          y2="5.5"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="group-icon" aria-hidden="true">
      <path d="M16.5 3a9 9 0 1 0 4.5 12A7.5 7.5 0 0 1 16.5 3Z" />
    </svg>
  );
}

function isoDay(value: Date): string {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}

function shiftDay(iso: string, days: number): string {
  const base = new Date(`${iso}T00:00:00`);
  base.setDate(base.getDate() + days);
  return isoDay(base);
}

/**
 * Renders any almanac section.
 *
 * Every section endpoint returns the same columns/rows shape, so adding a new
 * one is an entry in ALMANAC_ROUTES below plus a section on the backend - not a
 * new page. Redesign happens here once and applies to all of them.
 */

export type AlmanacRoute = {
  /** The backend section key. */
  section: string;
  /** Heading shown while loading, before the server's own title arrives. */
  label: string;
};

/** slug under /sections/ -> which backend section renders it. */
export const ALMANAC_ROUTES: Record<string, AlmanacRoute> = {
  "rahu-kalam": { section: "muhurta", label: "Rahu Kalam" },
  "abhijit-nakshatra": { section: "muhurta", label: "Abhijit Muhurta" },
  muhurt: { section: "muhurta", label: "Muhurta" },
  hora: { section: "hora", label: "Hora" },
  chaughadiya: { section: "chaughadiya", label: "Choghadiya" },
  "solar-eclipse": { section: "eclipses", label: "Solar Eclipse" },
  "lunar-eclipse": { section: "eclipses", label: "Lunar Eclipse" },
  "graha-vakri-margi": { section: "retrogrades", label: "Graha Vakri and Margi" },
  "graha-asta-uday": { section: "retrogrades", label: "Graha Motion" },
  festivals: { section: "festivals", label: "Festivals" },
  vrat: { section: "festivals", label: "Vrat" },
  "yearly-festival-calendar": { section: "festivals", label: "Festival Calendar" }
};

/**
 * Sections like Hora and Choghadiya split into day and night. Rows carry a
 * "group" key for that; everything else renders as a single table.
 */
function groupRows(rows: Record<string, string>[]): [string, Record<string, string>[]][] {
  if (!rows.some((row) => row.group)) {
    return [["", rows]];
  }
  const order: string[] = [];
  const grouped = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const key = row.group ?? "";
    if (!grouped.has(key)) {
      grouped.set(key, []);
      order.push(key);
    }
    grouped.get(key)!.push(row);
  }
  return order.map((key) => [key, grouped.get(key)!]);
}

export function AlmanacPage({ route }: { route: AlmanacRoute }) {
  // Remembered across pages, so the location is picked once not per section.
  const [place, setPlace] = useState<PickedPlace>(() => loadStoredPlace());
  const [day, setDay] = useState<string>(() => isoDay(new Date()));
  const [data, setData] = useState<AlmanacSection | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setData(null);
    void fetchAlmanacSection(route.section, place, { on: day })
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Could not load this section.");
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
  }, [route.section, place, day]);

  return (
    <main className="app-shell almanac-page">
      <header className="page-head">
        <h1>{data?.title ?? route.label}</h1>
        <p>
          {data?.subtitle ?? "Calculated from the ephemeris."}
          {data?.location ? ` · ${data.location}` : ""}
        </p>
      </header>

      <div className="almanac-controls">
        <PlacePicker value={place} onChange={setPlace} />
        <div className="date-nav">
          <label htmlFor="almanac-date">
            <span>Date</span>
          </label>
          <div className="date-nav-row">
            <button type="button" aria-label="Previous day" onClick={() => setDay(shiftDay(day, -1))}>
              &#8249; Prev
            </button>
            <input
              id="almanac-date"
              type="date"
              value={day}
              onChange={(event) => event.target.value && setDay(event.target.value)}
            />
            <button type="button" onClick={() => setDay(isoDay(new Date()))}>
              Today
            </button>
            <button type="button" aria-label="Next day" onClick={() => setDay(shiftDay(day, 1))}>
              Next &#8250;
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="admin-empty">Calculating…</p>}
      {error && <div className="error-banner">{error}</div>}

      {data && !loading && (
        <section className="panel">
          {data.rows.length === 0 ? (
            <p className="admin-empty">Nothing falls in this range.</p>
          ) : (
            groupRows(data.rows).map(([group, rows]) => (
              <div className="almanac-group" key={group || "all"}>
                {group && (
                  <h2 className="almanac-group-title">
                    {/night/i.test(group) ? <MoonIcon /> : <SunIcon />}
                    {group}
                  </h2>
                )}
                <div className="table-wrap">
                  <table className="planet-table almanac-table">
                    <thead>
                      <tr>
                        {data.columns.map((column) => (
                          <th key={column.key}>{column.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={index} className={row.tone ? `tone-${row.tone}` : undefined}>
                          {data.columns.map((column, columnIndex) => {
                            const value = row[column.key] ?? "";
                            const glyph = columnIndex === 0 ? PLANET_GLYPH[value] : undefined;
                            return (
                              <td key={column.key}>
                                {glyph && (
                                  <span className="planet-glyph" aria-hidden="true">
                                    {glyph}
                                  </span>
                                )}
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
          {data.note && (
            <p className="table-note">
              <strong>Note:</strong> {data.note}
            </p>
          )}
        </section>
      )}
    </main>
  );
}

export default AlmanacPage;
