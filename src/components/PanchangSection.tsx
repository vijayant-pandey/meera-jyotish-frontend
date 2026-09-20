import { useEffect, useMemo, useRef, useState } from "react";
import { autocompletePlaces, fetchPanchang, resolvePlace } from "../api";
import type { DailyPanchang, PlaceSuggestion } from "../types";
import { useSiteContent } from "../useSiteContent";
import PanchangChart, { type ClockMode } from "./PanchangChart";

const DEFAULT_PLACE = {
  label: "Jabalpur, India",
  lat: 23.170152,
  lng: 79.932451,
  timezone: "Asia/Kolkata"
};

function formatTime(iso: string, timeZone: string, mode: ClockMode): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: mode === "12",
    timeZone
  });
}

/** "upto 05:51 PM", with the date appended when it runs past midnight. */
function until(iso: string, timeZone: string, dayIso: string, mode: ClockMode): string {
  const time = formatTime(iso, timeZone, mode);
  const endDay = new Date(iso).toLocaleDateString("en-CA", { timeZone });
  if (endDay === dayIso) {
    return `upto ${time}`;
  }
  const date = new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone
  });
  return `upto ${time}, ${date}`;
}

/** "(Today)", "(1 Day)", "(3 Days)" relative to the panchang's own date. */
function inDays(target: string, fromIso: string): string {
  const days = Math.round(
    (new Date(`${target}T00:00:00`).getTime() - new Date(`${fromIso}T00:00:00`).getTime()) /
      86_400_000
  );
  if (days <= 0) {
    return "(Today)";
  }
  return days === 1 ? "(1 Day)" : `(${days} Days)`;
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <p className="panchang-line">
      <span>{label}:</span> <strong>{value}</strong>
    </p>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="dp-panel">
      <header>{title}</header>
      <div className="dp-panel-body">{children}</div>
    </section>
  );
}

export function PanchangSection() {
  const content = useSiteContent();
  const [place, setPlace] = useState(DEFAULT_PLACE);
  const [panchang, setPanchang] = useState<DailyPanchang | null>(null);
  const [error, setError] = useState("");
  const [clockMode, setClockMode] = useState<ClockMode>("12");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [reloads, setReloads] = useState(0);
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (typeof fetchPanchang !== "function") {
      return;
    }
    void Promise.resolve(fetchPanchang(place.lat, place.lng, place.timezone, place.label))
      .then((data) => {
        if (!cancelled) {
          setPanchang(data);
          setError("");
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Could not load panchang.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [place, reloads]);

  // The clocks tick locally every second. The panchang itself changes slowly, so
  // it is refetched on a much longer timer rather than once a second.
  useEffect(() => {
    const ticker = window.setInterval(() => setNow(new Date()), 1000);
    const refetch = window.setInterval(() => setReloads((value) => value + 1), 300_000);
    return () => {
      window.clearInterval(ticker);
      window.clearInterval(refetch);
    };
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    if (debounce.current) {
      window.clearTimeout(debounce.current);
    }
    debounce.current = window.setTimeout(() => {
      void autocompletePlaces(term)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 350);
    return () => {
      if (debounce.current) {
        window.clearTimeout(debounce.current);
      }
    };
  }, [query]);

  const choose = async (suggestion: PlaceSuggestion) => {
    try {
      const resolved = await resolvePlace(suggestion.provider, suggestion.providerId);
      setPlace({
        label: resolved.label,
        lat: resolved.lat,
        lng: resolved.lng,
        timezone: resolved.timezone
      });
      setQuery("");
      setSuggestions([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not resolve that place.");
    }
  };

  const zone = panchang?.timezone ?? place.timezone;

  // Ghati/pal/vipal advance from the server's sunrise, recomputed locally so the
  // display ticks without calling the API every second.
  const vedic = useMemo(() => {
    if (!panchang) {
      return null;
    }
    let seconds = (now.getTime() - new Date(panchang.sunrise).getTime()) / 1000;
    if (seconds < 0) {
      seconds += 86_400;
    }
    const units = seconds / 24;
    return {
      ghati: Math.floor(units / 60),
      pal: Math.floor(units % 60),
      vipal: Math.floor((units * 60) % 60)
    };
  }, [panchang, now]);

  const upcomingFestivals = panchang
    ? content.festivals
        .filter((item) => item.occursOn >= panchang.day)
        .sort((a, b) => a.occursOn.localeCompare(b.occursOn))
    : [];

  return (
    <section className="site-section panchang-section">
      <div className="section-heading row-heading">
        <div>
          <p className="eyebrow">Panchang</p>
          <h2>Today at {place.label}</h2>
        </div>
        <div className="panchang-search">
          <input
            type="text"
            value={query}
            placeholder="Change location"
            aria-label="Search for a location"
            onChange={(event) => setQuery(event.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="panchang-suggestions">
              {suggestions.map((item) => (
                <li key={`${item.provider}-${item.providerId}`}>
                  <button type="button" onMouseDown={() => void choose(item)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {!panchang && !error && <p className="admin-empty">Calculating panchang...</p>}

      {panchang && (
        <>
          <div className="dp-chart-bar">
            <div className="dp-toggle">
              <button
                type="button"
                className={clockMode === "12" ? "active" : ""}
                onClick={() => setClockMode("12")}
              >
                12 Hour
              </button>
              <button
                type="button"
                className={clockMode === "24" ? "active" : ""}
                onClick={() => setClockMode("24")}
              >
                24 Hour
              </button>
            </div>
            <ul className="dp-chart-legend">
              <li>
                <span className="dp-swatch dp-swatch-day" /> Day
              </li>
              <li>
                <span className="dp-swatch dp-swatch-night" /> Night
              </li>
              <li>
                <span className="dp-swatch dp-swatch-bad" /> Inauspicious choghadiya
              </li>
            </ul>
          </div>

          <PanchangChart panchang={panchang} mode={clockMode} />

          <div className="dp-grid">
            <Panel title="Panchang for Today">
              <p className="dp-place">{panchang.location}</p>
              <p className="dp-date">
                {panchang.weekday},{" "}
                {new Date(`${panchang.day}T00:00:00`).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
              <Line label="Sunrise" value={formatTime(panchang.sunrise, zone, clockMode)} />
              <Line label="Sunset" value={formatTime(panchang.sunset, zone, clockMode)} />
              <Line
                label="Tithi"
                value={`${panchang.tithi.name} ${until(panchang.tithi.endsAt, zone, panchang.day, clockMode)}`}
              />
              <Line
                label="Nakshatra"
                value={`${panchang.nakshatra.name} ${until(panchang.nakshatra.endsAt, zone, panchang.day, clockMode)}`}
              />
              <Line
                label="Yoga"
                value={`${panchang.yoga.name} ${until(panchang.yoga.endsAt, zone, panchang.day, clockMode)}`}
              />
              {panchang.karanas.map((karana, index) => (
                <Line
                  key={`${karana.name}-${index}`}
                  label="Karana"
                  value={`${karana.name} ${until(karana.endsAt, zone, panchang.day, clockMode)}`}
                />
              ))}
              <Line label="Paksha" value={panchang.paksha} />
              <Line label="Weekday" value={panchang.vara} />
              <Line label="Amanta Month" value={panchang.amantaMonth} />
              <Line label="Purnimanta Month" value={panchang.purnimantaMonth} />
              <Line label="Moonsign" value={panchang.moonsign} />
              <Line label="Sunsign" value={panchang.sunsign} />
              <Line label="Pravishte/Gate" value={String(panchang.pravishte)} />
              <Line label="Shaka Samvat" value={panchang.shakaSamvat} />
              <Line label="Vikram Samvat" value={panchang.vikramSamvat} />
              <Line label="Gujarati Samvat" value={panchang.gujaratiSamvat} />
            </Panel>

            <Panel title="Graha Positions">
              <p className="dp-date">
                {new Date(panchang.moment).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: zone
                })}
              </p>
              <table className="dp-graha-table">
                <tbody>
                  {panchang.grahas.map((graha) => (
                    <tr key={graha.name}>
                      <td>{graha.sanskrit}</td>
                      <td>{graha.sign}</td>
                      <td className="nowrap">{graha.longitude.toFixed(2)}&deg;</td>
                      <td className={graha.motion === "Vakri" ? "dp-vakri" : ""}>{graha.motion}</td>
                      <td className={graha.visibility === "Asta" ? "dp-asta" : ""}>
                        {graha.visibility}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="dp-foot">
                Margi is direct motion, Vakri retrograde. Asta means too near the Sun to be seen.
              </p>
            </Panel>

            <Panel title="Upcoming Upavas and Festivals">
              {upcomingFestivals.length === 0 && <p className="admin-empty">Nothing listed yet.</p>}
              <ul className="dp-list">
                {upcomingFestivals.slice(0, 12).map((item) => (
                  <li key={`${item.name}-${item.occursOn}`}>
                    {item.imageUrl && <img src={item.imageUrl} alt="" aria-hidden="true" />}
                    <div>
                      <strong>
                        {item.name} <em>{inDays(item.occursOn, panchang.day)}</em>
                      </strong>
                      <span>
                        {new Date(`${item.occursOn}T00:00:00`).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          weekday: "long"
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Upcoming Planetary Events">
              {content.planetaryEvents.length === 0 && (
                <p className="admin-empty">Nothing listed yet.</p>
              )}
              <ul className="dp-list">
                {content.planetaryEvents.map((item) => (
                  <li key={item.title}>
                    <div>
                      <strong>
                        {item.title} <em>{inDays(item.occursAt.slice(0, 10), panchang.day)}</em>
                      </strong>
                      <span>
                        {new Date(item.occursAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          weekday: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Rashifal for Today">
              {content.rashifal.length === 0 && <p className="admin-empty">Nothing listed yet.</p>}
              <ul className="dp-list dp-rashifal">
                {content.rashifal.map((item) => (
                  <li key={item.sign}>
                    {item.imageUrl && <img src={item.imageUrl} alt="" aria-hidden="true" />}
                    <div>
                      <strong>{item.sign}</strong>
                      <span>{item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title={`Vedic Time for ${panchang.location}`}>
              <div className="dp-clock">
                <strong>
                  {String(vedic?.ghati ?? 0).padStart(2, "0")}:
                  {String(vedic?.pal ?? 0).padStart(2, "0")}:
                  {String(vedic?.vipal ?? 0).padStart(2, "0")}
                </strong>
                <span>Ghati : Pal : Vipal</span>
              </div>
              <div className="dp-sun-row">
                <span>Sunrise {formatTime(panchang.sunrise, zone, clockMode)}</span>
                <span>Sunset {formatTime(panchang.sunset, zone, clockMode)}</span>
              </div>
              <p className="dp-samvat">
                {panchang.amantaMonth}, {panchang.paksha.replace(" Paksha", "")}{" "}
                {panchang.tithi.name}, {panchang.vikramSamvat} Vikrama Samvata &middot; {panchang.vara}
              </p>

              <div className="dp-clock dp-clock-gregorian">
                <strong>
                  {now.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                    timeZone: zone
                  })}
                </strong>
                <span>Hours : Minutes : Seconds</span>
              </div>
              <p className="dp-foot">
                {now.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: zone
                })}
              </p>
            </Panel>
          </div>
        </>
      )}
    </section>
  );
}

export default PanchangSection;
