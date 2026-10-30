import { useEffect, useMemo, useState } from "react";
import { fetchPlanetPositions } from "../api";
import type { Chart, PlanetPositions } from "../types";
import NorthIndianChart from "./NorthIndianChart";
import PlacePicker, { loadStoredPlace, type PickedPlace } from "./PlacePicker";
import { ImageCredit, bannerProps, useImageSlot } from "./Photo";

type Ayanamsha = PlanetPositions["ayanamsha"];
type LongitudeFormat = "dms" | "degrees";

const AYANAMSHAS: [Ayanamsha, string][] = [
  ["lahiri", "Lahiri / Chitra Paksha"],
  ["raman", "B.V. Raman"],
  ["kp", "Krishnamurti"],
  ["tropical", "Tropical (Sayana)"]
];

const SIGNS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
];

const SHORT: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve",
  Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Uranus: "Ur", Neptune: "Ne", Pluto: "Pl"
};

/** The current wall clock at the place, as a datetime-local value. */
function nowAt(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
  } catch {
    return new Date().toISOString().slice(0, 19);
  }
}

function shiftDays(value: string, days: number): string {
  const [day, time] = value.split("T");
  const [y, m, d] = day.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return `${next.toISOString().slice(0, 10)}T${time}`;
}

function headline(value: string): string {
  const [day, time] = value.split("T");
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const label = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
  return `${label}, ${time}`;
}

function signed(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

export function PlanetPositionsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const banner = useImageSlot("banner.planetary-positions", "solar-system");
  const [place, setPlace] = useState<PickedPlace>(() => loadStoredPlace());
  const [at, setAt] = useState(() => nowAt(loadStoredPlace().timezone));
  const [ayanamsha, setAyanamsha] = useState<Ayanamsha>("lahiri");
  const [trueNodes, setTrueNodes] = useState(false);
  const [outer, setOuter] = useState(true);
  const [format, setFormat] = useState<LongitudeFormat>("dms");
  const [data, setData] = useState<PlanetPositions | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void fetchPlanetPositions(place, { at, ayanamsha, trueNodes, outer })
      .then((result) => !cancelled && setData(result))
      .catch((cause) => !cancelled && setError(cause instanceof Error ? cause.message : "Could not load positions."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [place, at, ayanamsha, trueNodes, outer]);

  const chart: Chart | null = useMemo(() => {
    if (!data) return null;
    const asc = data.ascendantSign;
    const bySign = new Map<number, string[]>();
    for (const row of data.rows) {
      if (row.kind !== "graha") continue;
      const sign = SIGNS.indexOf(row.sign) + 1;
      const label = `${SHORT[row.english] ?? row.english.slice(0, 2)}${row.retrograde && row.english !== "Rahu" && row.english !== "Ketu" ? "(R)" : ""}`;
      bySign.set(sign, [...(bySign.get(sign) ?? []), label]);
    }
    return {
      style: "north",
      ascendantSignNumber: asc,
      ascendantSignName: SIGNS[asc - 1],
      houses: Array.from({ length: 12 }, (_, index) => {
        const signNumber = ((asc - 1 + index) % 12) + 1;
        return {
          houseNumber: index + 1,
          signNumber,
          signName: SIGNS[signNumber - 1],
          planets: bySign.get(signNumber) ?? []
        };
      })
    };
  }, [data]);

  const sidereal = ayanamsha !== "tropical";

  return (
    <main className="app-shell choghadiya-page planet-positions-page">
      <header className={`cg-banner ec-banner ${bannerProps(banner).className}`} style={bannerProps(banner).style}>
        <div>
          <p className="cg-banner-title">Astrology &rsaquo; Planetary Positions</p>
          <h1 className="ec-title">
            {sidereal ? "Nirayana or Sidereal" : "Sayana or Tropical"} Planetary Positions for {place.label}
          </h1>
          <p className="ld-countdown">{headline(at)}</p>
        </div>
        <nav className="ss-siblings" aria-label="Planet pages">
          <button type="button" onClick={() => onNavigate("/sections/graha-gochara")}>Planet Transit</button>
          <button type="button" onClick={() => onNavigate("/sections/graha-vakri-margi")}>Planet Retrograde</button>
          <button type="button" onClick={() => onNavigate("/sections/graha-asta-uday")}>Planet Combustion</button>
        </nav>
        <ImageCredit image={banner} className="on-banner" />
      </header>

      <nav className="cg-strip ec-years" aria-label="Day">
        <button type="button" onClick={() => setAt(shiftDays(at, -1))}>&#8249; Prev Day</button>
        <button type="button" onClick={() => setAt(nowAt(place.timezone))}>Now</button>
        <button type="button" onClick={() => setAt(shiftDays(at, 1))}>Next Day &#8250;</button>
        <label className="ss-year-pick">
          <span>Date and time</span>
          <input
            type="datetime-local"
            step={1}
            className="pp-datetime"
            value={at}
            onChange={(event) => {
              const value = event.target.value;
              if (value) setAt(value.length === 16 ? `${value}:00` : value);
            }}
          />
        </label>
      </nav>

      <div className="cg-controls">
        <PlacePicker
          value={place}
          onChange={(next) => {
            setPlace(next);
            setAt(nowAt(next.timezone));
          }}
        />
        <div className="pp-options">
          <label>
            <span>Ayanamsha</span>
            <select value={ayanamsha} onChange={(event) => setAyanamsha(event.target.value as Ayanamsha)}>
              {AYANAMSHAS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Longitude</span>
            <select value={format} onChange={(event) => setFormat(event.target.value as LongitudeFormat)}>
              <option value="dms">Degree, rashi, minutes, seconds</option>
              <option value="degrees">Full degrees</option>
            </select>
          </label>
          <label className="ec-seconds">
            <input type="checkbox" checked={trueNodes} onChange={(event) => setTrueNodes(event.target.checked)} />
            True Rahu / Ketu
          </label>
          <label className="ec-seconds">
            <input type="checkbox" checked={outer} onChange={(event) => setOuter(event.target.checked)} />
            Show Arun, Varun, Yama
          </label>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && !data && <p className="admin-empty">Calculating…</p>}

      {data && chart && (
        <div className={loading ? "ec-list loading" : "ec-list"}>
          <div className="pp-top">
            <div className="pp-chart">
              <NorthIndianChart chart={chart} eyebrow="Rashi Chart" title={headline(at)} showSelector={false} />
            </div>
            <div className="pp-summary">
              <dl className="ec-rows">
                <div className="ec-row">
                  <dt>Ayanamsha</dt>
                  <dd>{sidereal ? `${AYANAMSHAS.find(([v]) => v === ayanamsha)?.[1]}, ${data.ayanamshaValue}` : "None (tropical)"}</dd>
                </div>
                <div className="ec-row">
                  <dt>Rahu / Ketu</dt>
                  <dd>{data.trueNodes ? "True (Spashta)" : "Mean"}</dd>
                </div>
                <div className="ec-row">
                  <dt>Lagna</dt>
                  <dd>{data.rows[0].longitude}</dd>
                </div>
                <div className="ec-row">
                  <dt>Timezone</dt>
                  <dd>{data.timezone}</dd>
                </div>
              </dl>
              <ul className="cg-legend pp-legend">
                <li>↺ Vakri (retrograde)</li>
                <li>🔥 Asta (combust)</li>
              </ul>
            </div>
          </div>

          <div className="table-wrap">
            <table className="planet-table pp-table">
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>Longitude</th>
                  <th>Nakshatra</th>
                  <th>Padam</th>
                  <th>Nakshatra Lord / Sub Lord</th>
                  <th>Full Degree</th>
                  <th>Latitude / Shara</th>
                  <th>Speed (deg/day)</th>
                  <th>Right Ascension</th>
                  <th>Declination / Kranti</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.name} className={row.kind === "node-alt" ? "pp-alt" : undefined}>
                    <td className="pp-name">
                      {row.name}
                      {row.retrograde && row.kind !== "lagna" && <span title="Vakri"> ↺</span>}
                      {row.combust && <span title="Asta"> 🔥</span>}
                    </td>
                    <td>{format === "dms" ? row.longitude : `${row.fullDegree.toFixed(2)}°`}</td>
                    <td>{row.nakshatra}</td>
                    <td>{row.pada}</td>
                    <td>
                      {row.nakshatraLord}, {row.subLord}
                    </td>
                    <td>{row.fullDegree.toFixed(2)}</td>
                    <td>{row.latitude}</td>
                    <td>{signed(row.speed)}</td>
                    <td>{signed(row.rightAscension)}</td>
                    <td>{signed(row.declination)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="cg-datetab pp-cards-title">Planet details</h2>
          <div className="pp-cards">
            {data.rows
              .filter((row) => row.kind !== "node-alt")
              .map((row) => (
                <section className="rk-card" key={row.name}>
                  <header>
                    {row.name}
                    {row.english !== row.name && row.kind !== "lagna" ? ` (${row.english})` : ""}
                  </header>
                  <dl className="pp-card-body">
                    <div><dt>Motion</dt><dd>{row.motion}</dd></div>
                    <div><dt>State</dt><dd>{[row.combust ? "Asta" : "", row.dignity].filter(Boolean).join(", ") || "—"}</dd></div>
                    <div><dt>Residing in</dt><dd>{row.relation || "—"}</dd></div>
                    <div><dt>Longitude</dt><dd>{row.longitude}</dd></div>
                    <div><dt>Raw Longitude</dt><dd>{row.fullDegree.toFixed(2)}°</dd></div>
                    <div><dt>Nakshatra</dt><dd>{row.nakshatra}, Pada {row.pada}</dd></div>
                    <div><dt>Nakshatra Lord</dt><dd>{row.nakshatraLord}</dd></div>
                    <div><dt>Nakshatra Sub Lord</dt><dd>{row.subLord}</dd></div>
                  </dl>
                </section>
              ))}
          </div>

          <p className="cg-note">
            <strong>Notes:</strong> Positions are {sidereal ? "sidereal (Nirayana), as used in Vedic astrology" : "tropical (Sayana)"},
            for the local clock time at the selected place with daylight saving applied. Rahu and Ketu are{" "}
            {data.trueNodes ? "true (Spashta) positions, with the mean positions listed after" : "mean positions, with the true (Spashta) positions listed after"}.
            A negative speed means the graha is retrograde. Sub lords follow the Krishnamurti (KP) division of each
            nakshatra.
          </p>
        </div>
      )}
    </main>
  );
}

export default PlanetPositionsPage;
