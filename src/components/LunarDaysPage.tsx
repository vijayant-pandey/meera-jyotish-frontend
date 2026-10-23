import { useEffect, useState } from "react";
import { fetchLunarDays } from "../api";
import type { LunarDayKind, LunarDayYear } from "../types";
import { ClockModes, YearStrip, placeDate } from "./astroControls";
import { formatTime, type ClockMode } from "./EclipsePage";
import PlacePicker, { loadStoredPlace, type PickedPlace } from "./PlacePicker";

const COPY: Record<LunarDayKind, { title: string; alias: string; other: string; otherPath: string }> = {
  purnima: {
    title: "Purnima Days",
    alias: "Pournami Days",
    other: "Amavasya Dates",
    otherPath: "/sections/new-moon-dates"
  },
  amavasya: {
    title: "Amavasya",
    alias: "New Moon Dates",
    other: "Purnima Dates",
    otherPath: "/sections/full-moon-dates"
  }
};

/** A full or new moon disc. */
function MoonMark({ kind }: { kind: LunarDayKind }) {
  return (
    <svg viewBox="0 0 40 40" className="ld-moon" aria-hidden="true">
      <circle cx="20" cy="20" r="16" className={kind === "purnima" ? "ld-full" : "ld-new"} />
    </svg>
  );
}

function daysUntil(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

export function LunarDaysPage({
  kind,
  onNavigate
}: {
  kind: LunarDayKind;
  onNavigate: (path: string) => void;
}) {
  const copy = COPY[kind];
  const [place, setPlace] = useState<PickedPlace>(() => loadStoredPlace());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [mode, setMode] = useState<ClockMode>("12");
  const [data, setData] = useState<LunarDayYear | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void fetchLunarDays(kind, place, year)
      .then((result) => !cancelled && setData(result))
      .catch((cause) => !cancelled && setError(cause instanceof Error ? cause.message : "Could not load the dates."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [kind, place, year]);

  const current = data && data.kind === kind ? data : null;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  // Like a printed panchang, every time carries its own date. In 24-plus
  // notation the hours instead run on from midnight of the listed day.
  const stamp = (iso: string, listed: string) => {
    if (mode === "24plus") {
      return formatTime(iso, mode, listed, false);
    }
    const label = formatTime(iso, mode, iso.slice(0, 10), false);
    const [, month, day] = iso.slice(0, 10).split("-").map(Number);
    const short = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];
    return `${label}, ${short} ${String(day).padStart(2, "0")}`;
  };

  return (
    <main className="app-shell choghadiya-page lunar-days-page">
      <header className="cg-banner ec-banner">
        <div>
          <p className="cg-banner-title">Vrat and Upavasa &rsaquo; {kind === "purnima" ? "Purnima Dates" : "Amavasya Dates"}</p>
          <h1 className="ec-title">
            {year} {copy.title} | {copy.alias} for {place.label}
          </h1>
          {current?.next && current.year === new Date().getFullYear() && (
            <p className="ld-countdown">
              <strong>{daysUntil(current.next.date)}</strong> days until {current.next.name},{" "}
              {placeDate(current.next.date)}
            </p>
          )}
        </div>
        <nav className="ec-quick" aria-label="Related pages">
          <button type="button" onClick={() => onNavigate(copy.otherPath)}>
            {copy.other}
          </button>
        </nav>
      </header>

      <YearStrip year={year} onChange={setYear} />

      <div className="cg-controls">
        <PlacePicker value={place} onChange={setPlace} />
        <div className="ec-options">
          <ClockModes mode={mode} onChange={setMode} />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && !current && <p className="admin-empty">Calculating…</p>}

      {current && (
        <section className={loading ? "ld-list loading" : "ld-list"}>
          <h2 className="cg-datetab">
            {current.year} {kind === "purnima" ? "Purnima" : "Amavasya"} Dates
          </h2>
          {current.entries.map((entry) => (
            <article
              key={`${entry.date}-${entry.names[0]}`}
              className={entry.date === todayIso ? "ld-entry today" : "ld-entry"}
            >
              <div className="ld-date">
                <MoonMark kind={kind} />
                <div>
                  <strong>{placeDate(entry.date).replace(/, (\w+)$/, "")}</strong>
                  <span>{entry.weekday}</span>
                </div>
              </div>
              <div className="ld-body">
                <ul className="ld-names">
                  {entry.names.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
                <p className="ld-paksha">{entry.paksha}</p>
                <dl className="ld-times">
                  <div>
                    <dt>Begins</dt>
                    <dd>{stamp(entry.begins, entry.date)}</dd>
                  </div>
                  <div>
                    <dt>Ends</dt>
                    <dd>{stamp(entry.ends, entry.date)}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
          <p className="cg-note">
            <strong>Notes:</strong> {current.note} Month names follow the Purnimanta calendar used in North
            India.
          </p>
        </section>
      )}

      <section className="panel ec-about">
        {kind === "purnima" ? (
          <>
            <h2>About Purnima</h2>
            <p>
              Purnima is the full moon day, the last tithi of the bright fortnight (Shukla Paksha). In
              South India it is called Pournami. Each Purnima is named for its lunar month, and many
              festivals and vrats are tied to it, from Guru Purnima to Kartika Purnima.
            </p>
            <p>
              The list shows the actual Purnima days. Some observances, such as the Satyanarayana Puja
              and the Purnima vrat, can fall a day earlier, on Chaturdashi. That happens when Purnima
              begins before midday of the previous day, so it already prevails then; the vrat day is
              listed separately when it differs.
            </p>
            <h2>Purnima fasting</h2>
            <p>
              The Purnima vrat, or Pournami Vratam, is usually kept from sunrise until the Moon is
              sighted in the evening. Because the tithi begins and ends at fixed moments, the day it is
              kept on depends on the place; choose your city before noting the dates.
            </p>
          </>
        ) : (
          <>
            <h2>About Amavasya</h2>
            <p>
              Amavasya is the new moon day, the last tithi of the dark fortnight (Krishna Paksha), when
              the Moon is closest to the Sun and cannot be seen. It is a significant day for Pitru
              Tarpan and Shraddha, offerings made to the ancestors.
            </p>
            <p>
              An Amavasya that falls on a Monday is called Somvati Amavasya, and one on a Saturday,
              Shani Amavasya. Both are considered especially meritorious. An Amavasya in an Adhika (extra)
              month carries the Adhika name. Darsha Amavasya is the name for the day of the new moon
              itself.
            </p>
            <h2>Month names</h2>
            <p>
              In the Purnimanta calendar a month runs from one full moon to the next, so an Amavasya
              takes the name of the month whose dark half it ends. In the Amanta calendar, used in much
              of South and West India, the same Amavasya ends the previous month and carries that
              name instead.
            </p>
          </>
        )}
      </section>

      <section className="ec-related" aria-label="Related">
        <h2>Other links</h2>
        <div className="ec-related-grid">
          {[
            [copy.other, copy.otherPath, kind === "purnima" ? "New moon days with tithi timings" : "Full moon days with tithi timings"],
            ["Festivals", "/sections/festivals", "Vrat and festival dates for your place"],
            ["Solar Eclipse", "/sections/solar-eclipse", "Surya Grahan dates and Sutak"],
            ["Lunar Eclipse", "/sections/lunar-eclipse", "Chandra Grahan dates and Sutak"]
          ].map(([title, path, blurb]) => (
            <button type="button" key={path} className="ec-related-card" onClick={() => onNavigate(path)}>
              <strong>{title}</strong>
              <span>{blurb}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LunarDaysPage;
