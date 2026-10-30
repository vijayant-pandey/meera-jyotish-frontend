import { useEffect, useState } from "react";
import { fetchPlanetCombustions, fetchPlanetRetrogrades, fetchPlanetTransits } from "../api";
import type {
  PlanetCombustionYear,
  PlanetRetrogradeYear,
  PlanetTransitYear,
  TransitDivision
} from "../types";
import { ClockModes, YearStrip, placeDateTime, readQuery, writeQuery } from "./astroControls";
import type { ClockMode } from "./EclipsePage";
import PlacePicker, { loadStoredPlace, type PickedPlace } from "./PlacePicker";
import { ImageCredit, bannerProps, useImageSlot } from "./Photo";

export type PlanetEventMode = "asta" | "vakri" | "gochara";

type Planet = { key: string; sanskrit: string; english: string; glyph: string };

const ALL: Planet[] = [
  { key: "surya", sanskrit: "Surya", english: "Sun", glyph: "☉" },
  { key: "chandra", sanskrit: "Chandra", english: "Moon", glyph: "☽" },
  { key: "mangal", sanskrit: "Mangal", english: "Mars", glyph: "♂" },
  { key: "budha", sanskrit: "Budha", english: "Mercury", glyph: "☿" },
  { key: "guru", sanskrit: "Guru", english: "Jupiter", glyph: "♃" },
  { key: "shukra", sanskrit: "Shukra", english: "Venus", glyph: "♀" },
  { key: "shani", sanskrit: "Shani", english: "Saturn", glyph: "♄" },
  { key: "rahu", sanskrit: "Rahu", english: "Rahu", glyph: "☊" },
  { key: "ketu", sanskrit: "Ketu", english: "Ketu", glyph: "☋" },
  { key: "arun", sanskrit: "Arun", english: "Uranus", glyph: "♅" },
  { key: "varun", sanskrit: "Varun", english: "Neptune", glyph: "♆" },
  { key: "yama", sanskrit: "Yama", english: "Pluto", glyph: "♇" }
];

const PLANETS: Record<PlanetEventMode, string[]> = {
  asta: ["chandra", "mangal", "budha", "guru", "shukra", "shani"],
  vakri: ["mangal", "budha", "guru", "shukra", "shani", "arun", "varun", "yama"],
  gochara: ALL.map((planet) => planet.key)
};

const DEFAULT_PLANET: Record<PlanetEventMode, string> = {
  asta: "budha",
  vakri: "budha",
  gochara: "surya"
};

const COPY: Record<PlanetEventMode, { title: string; crumb: string; suffix: string }> = {
  asta: { title: "Planets Combustion", crumb: "Planet Combustion", suffix: "Asta" },
  vakri: { title: "Planets Retrograde", crumb: "Planet Retrograde", suffix: "Vakri" },
  gochara: { title: "Planets Transit", crumb: "Planet Transit", suffix: "Gochar" }
};

const DIVISIONS: [TransitDivision, string, string][] = [
  ["rashi", "Rashi Transit", "Gochar"],
  ["nakshatra", "Nakshatra Transit", "Nakshatra Gochar"],
  ["pada", "Nakshatra Pada Transit", "Nakshatra Pada Gochar"]
];

const PATHS: Record<PlanetEventMode, string> = {
  asta: "/sections/graha-asta-uday",
  vakri: "/sections/graha-vakri-margi",
  gochara: "/sections/graha-gochara"
};

function planetOf(key: string): Planet {
  return ALL.find((planet) => planet.key === key) ?? ALL[0];
}

function PlanetBadge({ planet }: { planet: Planet }) {
  return (
    <span className={`pe-badge pe-${planet.key}`} aria-hidden="true">
      {planet.glyph}
    </span>
  );
}

function RetrogradeList({ data, mode }: { data: PlanetRetrogradeYear; mode: ClockMode }) {
  if (data.periods.length === 0) {
    return <p className="admin-empty">{data.english} is not retrograde at any point in {data.year}.</p>;
  }
  return (
    <>
      <ol className="pe-entries">
        {data.periods.map((period, index) => (
          <li key={period.retrograde} className="pe-entry">
            <span className="pe-number">{index + 1}</span>
            <dl className="ec-rows">
              <div className="ec-row">
                <dt>{data.english} becomes Retrograde On</dt>
                <dd>
                  {placeDateTime(period.retrograde, mode)}
                  <small className="ec-below">at {period.retrogradeAt}</small>
                </dd>
              </div>
              <div className="ec-row">
                <dt>{data.english} becomes Progressive On</dt>
                <dd>
                  {placeDateTime(period.direct, mode)}
                  <small className="ec-below">at {period.directAt}</small>
                </dd>
              </div>
              <div className="ec-row max">
                <dt>Total Retrograde Days</dt>
                <dd>{period.days}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      <p className="pe-total">
        Total retrograde days in the periods above: <strong>{data.totalDays}</strong>
      </p>
    </>
  );
}

function CombustionList({ data, mode }: { data: PlanetCombustionYear; mode: ClockMode }) {
  if (data.periods.length === 0) {
    return <p className="admin-empty">{data.english} is not combust at any point in {data.year}.</p>;
  }
  return (
    <>
      <ol className="pe-entries">
        {data.periods.map((period, index) => (
          <li key={period.starts} className="pe-entry">
            <span className="pe-number">{index + 1}</span>
            <dl className="ec-rows">
              <div className="ec-row">
                <dt>{data.english} Tara Asta Starts On</dt>
                <dd>
                  {placeDateTime(period.starts, mode)}
                  <small className="ec-below">at {period.startsAt}</small>
                </dd>
              </div>
              <div className="ec-row">
                <dt>{data.english} Tara Asta Ends On</dt>
                <dd>
                  {placeDateTime(period.ends, mode)}
                  <small className="ec-below">at {period.endsAt}</small>
                </dd>
              </div>
              <div className="ec-row max">
                <dt>Total Asta Duration</dt>
                <dd>
                  {period.days} Days{period.retrograde ? " (while retrograde)" : ""}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      <p className="pe-total">
        Total asta days in the periods above: <strong>{data.totalDays}</strong>
      </p>
    </>
  );
}

function TransitList({ data, mode }: { data: PlanetTransitYear; mode: ClockMode }) {
  return (
    <>
      <p className="pe-starts">
        On 1 January {data.year}, {data.english} is in <strong>{data.startsIn}</strong>.
      </p>
      {data.entries.length === 0 ? (
        <p className="admin-empty">
          {data.english} stays in {data.startsIn} for the whole of {data.year}.
        </p>
      ) : (
        <ol className="pe-transits">
          {data.entries.map((entry, index) => {
            // The entry in force right now: begun, and not yet followed by the next.
            const live =
              new Date(entry.time).getTime() <= Date.now() &&
              (index + 1 >= data.entries.length || new Date(data.entries[index + 1].time).getTime() > Date.now());
            return (
              <li key={entry.time} className={live ? "pe-transit current" : "pe-transit"}>
                <span className="pe-number">{index + 1}</span>
                <div>
                  <strong>
                    {entry.name}
                    {entry.retrograde && <span className="pe-vakri"> (Vakri)</span>}
                  </strong>
                  <span>{placeDateTime(entry.time, mode)}</span>
                  {live && (
                    <em className="pe-now">
                      {data.english} is transiting in {entry.name}
                      {data.division === "rashi" ? " Rashi" : ""}
                    </em>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

export function PlanetEventsPage({
  mode: pageMode,
  onNavigate
}: {
  mode: PlanetEventMode;
  onNavigate: (path: string) => void;
}) {
  const banner = useImageSlot(`banner.${PATHS[pageMode].slice("/sections/".length)}`, pageMode === "gochara" ? "navagraha" : "solar-system");
  const copy = COPY[pageMode];
  const available = PLANETS[pageMode];
  const [place, setPlace] = useState<PickedPlace>(() => loadStoredPlace());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [clock, setClock] = useState<ClockMode>("12");
  const [planet, setPlanet] = useState(() => {
    const wanted = readQuery("planet");
    return wanted && available.includes(wanted) ? wanted : DEFAULT_PLANET[pageMode];
  });
  const [division, setDivision] = useState<TransitDivision>(() => {
    const wanted = readQuery("type");
    return wanted === "nakshatra" || wanted === "pada" ? wanted : "rashi";
  });
  const [data, setData] = useState<PlanetRetrogradeYear | PlanetCombustionYear | PlanetTransitYear | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wanted = readQuery("planet");
    setPlanet(wanted && PLANETS[pageMode].includes(wanted) ? wanted : DEFAULT_PLANET[pageMode]);
    setData(null);
  }, [pageMode]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const request =
      pageMode === "vakri"
        ? fetchPlanetRetrogrades(planet, place, year)
        : pageMode === "asta"
          ? fetchPlanetCombustions(planet, place, year)
          : fetchPlanetTransits(planet, division, place, year);
    void request
      .then((result) => !cancelled && setData(result))
      .catch((cause) => !cancelled && setError(cause instanceof Error ? cause.message : "Could not load this page."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [pageMode, planet, division, place, year]);

  const choose = (key: string, nextDivision: TransitDivision = division) => {
    setPlanet(key);
    setDivision(nextDivision);
    writeQuery({ planet: key, type: pageMode === "gochara" ? nextDivision : null });
    window.setTimeout(
      () => document.getElementById("pe-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0
    );
  };

  const selected = planetOf(planet);
  const divisionLabel = DIVISIONS.find(([key]) => key === division)!;
  const detailTitle =
    pageMode === "vakri"
      ? `${year} ${selected.sanskrit} Vakri`
      : pageMode === "asta"
        ? `${year} ${selected.sanskrit} Asta`
        : `${year} ${selected.sanskrit} ${divisionLabel[2]}`;
  const matches = data && data.planet === planet && data.year === year;

  return (
    <main className="app-shell choghadiya-page planet-events-page">
      <header className={`cg-banner ec-banner ${bannerProps(banner).className}`} style={bannerProps(banner).style}>
        <div>
          <p className="cg-banner-title">Astrology Events &rsaquo; {copy.crumb}</p>
          <h1 className="ec-title">{copy.title}</h1>
        </div>
        <nav className="ss-siblings" aria-label="Planet pages">
          <button type="button" onClick={() => onNavigate("/sections/planetary-positions")}>
            Planetary Positions
          </button>
          {(Object.keys(PATHS) as PlanetEventMode[])
            .filter((key) => key !== pageMode)
            .map((key) => (
              <button type="button" key={key} onClick={() => onNavigate(PATHS[key])}>
                {COPY[key].crumb}
              </button>
            ))}
        </nav>
        <ImageCredit image={banner} className="on-banner" />
      </header>

      {pageMode === "gochara" ? (
        DIVISIONS.map(([key, heading, suffix]) => (
          <section className="pe-hub" key={key}>
            <h2>Planets {heading}</h2>
            <div className="pe-grid">
              {available.map((name) => {
                const item = planetOf(name);
                return (
                  <button
                    type="button"
                    key={name}
                    className={planet === name && division === key ? "pe-card active" : "pe-card"}
                    onClick={() => choose(name, key)}
                  >
                    <PlanetBadge planet={item} />
                    <span>
                      {item.sanskrit} {suffix}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))
      ) : (
        <section className="pe-hub">
          <h2>{copy.title}</h2>
          <div className="pe-grid">
            {available.map((name) => {
              const item = planetOf(name);
              return (
                <button
                  type="button"
                  key={name}
                  className={planet === name ? "pe-card active" : "pe-card"}
                  onClick={() => choose(name)}
                >
                  <PlanetBadge planet={item} />
                  <span>
                    {item.sanskrit} {copy.suffix}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section id="pe-detail" className="pe-detail">
        <h2 className="cg-datetab">
          <PlanetBadge planet={selected} /> {detailTitle}
        </h2>

        <YearStrip year={year} onChange={setYear} />

        <div className="cg-controls">
          <PlacePicker value={place} onChange={setPlace} />
          <div className="ec-options">
            <ClockModes mode={clock} onChange={setClock} withPlus={false} />
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && !matches && <p className="admin-empty">Calculating…</p>}

        {matches && (
          <div className={loading ? "ec-list loading" : "ec-list"}>
            {pageMode === "vakri" && <RetrogradeList data={data as PlanetRetrogradeYear} mode={clock} />}
            {pageMode === "asta" && <CombustionList data={data as PlanetCombustionYear} mode={clock} />}
            {pageMode === "gochara" && (data as PlanetTransitYear).division === division && (
              <TransitList data={data as PlanetTransitYear} mode={clock} />
            )}
          </div>
        )}

        <p className="cg-note">
          <strong>Notes:</strong> Times are local to the selected place, adjusted for daylight saving where
          it applies; the event itself is the same moment everywhere. Positions are sidereal (Lahiri
          ayanamsha) with mean Rahu and Ketu.{" "}
          {pageMode === "vakri" &&
            "The retrograde time is the station where the graha stops and turns backward; the progressive time is the station where it turns forward again, before it regains its usual speed."}
          {pageMode === "asta" &&
            matches &&
            `${selected.english} is counted as asta when it is within ${(data as PlanetCombustionYear).orb}° of the Sun${
              (data as PlanetCombustionYear).orbRetrograde
                ? ` (${(data as PlanetCombustionYear).orbRetrograde}° while retrograde)`
                : ""
            }, the classical Surya Siddhanta orbs. Venus and Jupiter asta matter most: marriages are not held while either is combust.`}
          {pageMode === "gochara" &&
            "A transit marked Vakri happens while the graha is retrograde, so it re-enters the previous division."}
        </p>
      </section>

      <section className="ec-related" aria-label="Related">
        <h2>Other links</h2>
        <div className="ec-related-grid">
          {[
            ["Planetary Positions", "/sections/planetary-positions", "Sidereal longitude, nakshatra, speed and state of every graha"],
            ["Planet Retrograde", PATHS.vakri, "When each graha turns Vakri and Margi"],
            ["Planet Transit", PATHS.gochara, "Rashi, nakshatra and pada transits with timings"],
            ["Planet Combustion", PATHS.asta, "When grahas are too close to the Sun to be seen"]
          ]
            .filter(([, path]) => path !== PATHS[pageMode])
            .map(([title, path, blurb]) => (
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

export default PlanetEventsPage;
