import { formatTime, type ClockMode } from "./EclipsePage";

/** Controls shared by the yearly almanac pages: year strip and clock format. */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "2026-02-26T12:17:04+05:30" -> "February 26, 2026, Thursday" from the place's own date. */
export function placeDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${MONTHS[month - 1]} ${day}, ${year}, ${weekday}`;
}

/** "February 26, 2026, Thursday at 12:17 PM". */
export function placeDateTime(iso: string, mode: ClockMode, seconds = false): string {
  return `${placeDate(iso)} at ${formatTime(iso, mode === "24plus" ? "24" : mode, iso.slice(0, 10), seconds)}`;
}

export function YearStrip({ year, onChange }: { year: number; onChange: (year: number) => void }) {
  const thisYear = new Date().getFullYear();
  return (
    <nav className="cg-strip ec-years" aria-label="Year">
      <button type="button" onClick={() => onChange(year - 1)}>
        &#8249; Prev Year ({year - 1})
      </button>
      <button type="button" className={year === thisYear ? "active" : ""} onClick={() => onChange(thisYear)}>
        Current Year
      </button>
      <button type="button" onClick={() => onChange(year + 1)}>
        Next Year ({year + 1}) &#8250;
      </button>
      <label className="ss-year-pick">
        <span>Choose Year</span>
        <input
          type="number"
          min={1900}
          max={2200}
          value={year}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (value >= 1900 && value <= 2200) onChange(value);
          }}
        />
      </label>
    </nav>
  );
}

export function ClockModes({
  mode,
  onChange,
  withPlus = true
}: {
  mode: ClockMode;
  onChange: (mode: ClockMode) => void;
  withPlus?: boolean;
}) {
  const options: [ClockMode, string][] = [
    ["12", "12 Hour"],
    ["24", "24 Hour"],
    ...(withPlus ? ([["24plus", "24 Plus"]] as [ClockMode, string][]) : [])
  ];
  return (
    <div className="cg-modes" role="group" aria-label="Clock format">
      {options.map(([value, text]) => (
        <button
          type="button"
          key={value}
          className={mode === value ? "active" : ""}
          onClick={() => onChange(value)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

/** Reads and writes one query parameter, so a chosen planet survives a reload
 * and can be linked to. */
export function readQuery(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

export function writeQuery(values: Record<string, string | null>): void {
  const search = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(values)) {
    if (value === null) search.delete(key);
    else search.set(key, value);
  }
  const query = search.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
}
