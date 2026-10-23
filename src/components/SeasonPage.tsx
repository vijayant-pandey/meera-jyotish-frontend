import { useEffect, useState, type ReactNode } from "react";
import { fetchSeason } from "../api";
import type { SeasonDetail, SeasonEvent } from "../types";
import { formatTime, longDate, type ClockMode } from "./EclipsePage";
import PlacePicker, { loadStoredPlace, type PickedPlace } from "./PlacePicker";

const ORDER: SeasonEvent[] = ["vernal-equinox", "summer-solstice", "autumnal-equinox", "winter-solstice"];

const NAMES: Record<SeasonEvent, string> = {
  "vernal-equinox": "Vernal Equinox",
  "summer-solstice": "Summer Solstice",
  "autumnal-equinox": "Autumnal Equinox",
  "winter-solstice": "Winter Solstice"
};

/** "Friday, March 20, 2026". */
function headlineDate(iso: string, weekday: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const name = new Date(Date.UTC(year, month - 1, day)).toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC"
  });
  return `${weekday}, ${name} ${day}, ${year}`;
}

function toSeconds(label: string): number {
  const [h, m, s] = (label.match(/\d+/g) ?? ["0", "0", "0"]).map(Number);
  return h * 3600 + m * 60 + s;
}

/**
 * The day as a dial: the lit arc is daylight, the dark arc night, with the Sun
 * marked where the event falls in that day's 24 hours.
 */
function DayDial({ data }: { data: SeasonDetail }) {
  const c = 60;
  const r = 46;
  const day = toSeconds(data.dayDuration) / 86400;
  const clock = (iso: string) => {
    const [h, m, s] = iso.slice(11, 19).split(":").map(Number);
    return (h * 3600 + m * 60 + s) / 86400;
  };
  // Midnight at the bottom, noon at the top.
  const point = (fraction: number, radius: number) => {
    const angle = fraction * 2 * Math.PI + Math.PI / 2;
    return [c + radius * Math.cos(angle), c + radius * Math.sin(angle)];
  };
  const rise = clock(data.sunrise);
  const set = clock(data.sunset);
  const [x1, y1] = point(rise, r);
  const [x2, y2] = point(set, r);
  const [sx, sy] = point(clock(data.moment), r);
  const large = day > 0.5 ? 1 : 0;

  return (
    <svg viewBox="0 0 120 120" className="ss-dial" role="img" aria-label={`Daylight ${data.dayDuration}`}>
      <circle cx={c} cy={c} r={r} className="ss-night" />
      <path d={`M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} className="ss-day" />
      <circle cx={c} cy={c} r={r * 0.42} className="ss-hub" />
      <text x={c} y={c - 2} textAnchor="middle" className="ss-hub-big">
        {Math.round(day * 1000) / 10}%
      </text>
      <text x={c} y={c + 9} textAnchor="middle" className="ss-hub-small">
        daylight
      </text>
      <circle cx={sx} cy={sy} r={6.5} className="ss-marker" />
      <text x={c} y={11} textAnchor="middle" className="ss-tick">12</text>
      <text x={c} y={116} textAnchor="middle" className="ss-tick">0</text>
    </svg>
  );
}

const ABOUT: Record<SeasonEvent, (year: number, next: () => void) => ReactNode> = {
  "vernal-equinox": (year, next) => (
    <>
      <h2>{year} Vernal Equinox | March Equinox</h2>
      <p>
        An equinox is one of the two moments in the year when the Sun crosses the celestial equator
        and stands directly above Earth&rsquo;s equator. Day and night are then close to equal
        everywhere; the name comes from the Latin for &ldquo;equal night&rdquo;. In practice the
        day runs a few minutes longer, because the Sun&rsquo;s upper edge is counted and the
        atmosphere bends its light above the horizon before it has truly risen.
      </p>
      <p>
        The March equinox opens spring in the Northern Hemisphere, which is why it is called the
        Vernal Equinox there. South of the equator the same moment begins autumn.
      </p>
      <h2>Vernal Equinox in Hindu astronomy</h2>
      <p>
        The Hindu name is Vasant Vishuva or Vasant Sampat. The classical texts once had the
        equinox coincide with the Sun&rsquo;s entry into Mesha. Precession has since moved the
        two apart by about 24 days, so the sidereal observance now falls at Mesha Sankranti in
        mid-April while the tropical equinox stays in March.
      </p>
      <button type="button" className="ec-link ss-next" onClick={next}>
        Check the {year + 1} Vernal Equinox &#8250;
      </button>
    </>
  ),
  "summer-solstice": (year, next) => (
    <>
      <h2>{year} Summer Solstice | June Solstice</h2>
      <p>
        A solstice is the moment the Sun reaches its furthest point north or south of the
        celestial equator and appears to pause before turning back. At the June solstice it stands
        over the Tropic of Cancer, giving the Northern Hemisphere its longest day and the Southern
        Hemisphere its shortest.
      </p>
      <p>
        Close to a solstice the day length barely changes from one day to the next, often by only
        a few seconds, which is why the previous and next day durations are shown beside it.
      </p>
      <h2>Summer Solstice in Hindu astronomy</h2>
      <p>
        The June solstice marks the start of the tropical Dakshinayana, the Sun&rsquo;s southward
        half of the year. In the sidereal reckoning used for the Panchang, Dakshinayana begins
        later, at Karka Sankranti in mid-July, when the Sun enters Cancer. The six months of
        Dakshinayana are held to be the night of the devas.
      </p>
      <button type="button" className="ec-link ss-next" onClick={next}>
        Check the {year + 1} Summer Solstice &#8250;
      </button>
    </>
  ),
  "autumnal-equinox": (year, next) => (
    <>
      <h2>{year} Autumnal Equinox | September Equinox</h2>
      <p>
        At the September equinox the Sun crosses the celestial equator heading south. Day and night
        are again close to equal across the globe, the day running a few minutes over twelve hours
        because sunrise and sunset are timed from the Sun&rsquo;s upper edge with refraction.
      </p>
      <p>
        North of the equator this moment begins autumn, so it is called the Autumnal Equinox; in
        the Southern Hemisphere it is the start of spring.
      </p>
      <h2>Autumnal Equinox in Hindu astronomy</h2>
      <p>
        The Hindu name is Sharad Vishuva or Sharad Sampat. Because of precession, the sidereal
        counterpart is now Tula Sankranti, the Sun&rsquo;s entry into Libra, which falls in
        mid-October.
      </p>
      <button type="button" className="ec-link ss-next" onClick={next}>
        Check the {year + 1} Autumnal Equinox &#8250;
      </button>
    </>
  ),
  "winter-solstice": (year, next) => (
    <>
      <h2>{year} Winter Solstice | December Solstice</h2>
      <p>
        At the December solstice the Sun reaches its southernmost point, over the Tropic of
        Capricorn. The Northern Hemisphere has its shortest day and longest night, while the
        Southern Hemisphere has its longest day. It is also called the Southern Solstice or the
        Hibernal Solstice.
      </p>
      <p>
        Around the solstice the day length is nearly constant for several days, changing by only
        seconds, so the previous and next day durations are shown for comparison.
      </p>
      <h2>Winter Solstice in Hindu astronomy</h2>
      <p>
        The December solstice begins the tropical Uttarayana, the Sun&rsquo;s northward half of
        the year. In the sidereal reckoning Uttarayana starts at Makara Sankranti in mid-January,
        when the Sun enters Capricorn. Uttarayana is the day of the devas, Devkal, and is held to
        be an auspicious time to begin new work.
      </p>
      <button type="button" className="ec-link ss-next" onClick={next}>
        Check the {year + 1} Winter Solstice &#8250;
      </button>
    </>
  )
};

export function SeasonPage({
  event,
  onNavigate
}: {
  event: SeasonEvent;
  onNavigate: (path: string) => void;
}) {
  const name = NAMES[event];
  const thisYear = new Date().getFullYear();
  const [place, setPlace] = useState<PickedPlace>(() => loadStoredPlace());
  const [year, setYear] = useState(thisYear);
  const [mode, setMode] = useState<ClockMode>("12");
  const [seconds, setSeconds] = useState(false);
  const [data, setData] = useState<SeasonDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, [event]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void fetchSeason(event, place, year)
      .then((result) => !cancelled && setData(result))
      .catch(
        (cause) =>
          !cancelled && setError(cause instanceof Error ? cause.message : `Could not load the ${name}.`)
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [event, place, year, name]);

  const current = data && data.event === event ? data : null;
  const time = (iso: string) => formatTime(iso, mode, current?.date ?? iso.slice(0, 10), seconds);

  return (
    <main className="app-shell choghadiya-page season-page">
      <header className="cg-banner ec-banner">
        <div>
          <p className="cg-banner-title">Astronomy Events &rsaquo; {name}</p>
          <h1 className="ec-title">
            {year} {name} date and time for {place.label}
          </h1>
        </div>
        <nav className="ss-siblings" aria-label="Seasons">
          {ORDER.filter((key) => key !== event).map((key) => (
            <button type="button" key={key} onClick={() => onNavigate(`/sections/${key}`)}>
              {NAMES[key]}
            </button>
          ))}
        </nav>
      </header>

      <nav className="cg-strip ec-years" aria-label="Year">
        <button type="button" onClick={() => setYear(year - 1)}>
          &#8249; Prev Year ({year - 1})
        </button>
        <button type="button" className={year === thisYear ? "active" : ""} onClick={() => setYear(thisYear)}>
          Current Year
        </button>
        <button type="button" onClick={() => setYear(year + 1)}>
          Next Year ({year + 1}) &#8250;
        </button>
        <label className="ss-year-pick">
          <span>Choose Year</span>
          <input
            type="number"
            min={1900}
            max={2200}
            value={year}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1900 && value <= 2200) setYear(value);
            }}
          />
        </label>
      </nav>

      <div className="cg-controls">
        <PlacePicker value={place} onChange={setPlace} />
        <div className="ec-options">
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
          <label className="ec-seconds">
            <input type="checkbox" checked={seconds} onChange={(e) => setSeconds(e.target.checked)} />
            Show seconds
          </label>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && !current && <p className="admin-empty">Calculating…</p>}

      {current && (
        <article className={loading ? "ec-card loading" : "ec-card"}>
          <header className="ec-card-head">
            <div>
              <h2>{name}</h2>
              <p>{current.location}</p>
            </div>
            <div className="ss-datebox">
              <strong>{longDate(current.date).split(" ")[0]}</strong>
              <span>{longDate(current.date).split(" ").slice(1).join(" ")}</span>
              <span>{current.weekday}</span>
            </div>
          </header>

          <div className="ec-card-body">
            <div className="ec-figure-col">
              <DayDial data={current} />
              <p className="ec-figure-caption">
                Daylight and night on the day, with the moment of the {name.toLowerCase()} marked
              </p>
            </div>

            <div className="ec-timings">
              <h3>{name} Local Time</h3>
              <p className="ss-headline">
                {name} on <strong>{headlineDate(current.date, current.weekday)}</strong>
              </p>
              <dl className="ec-rows">
                <div className="ec-row max">
                  <dt>{name} Time</dt>
                  <dd>{time(current.moment)}</dd>
                </div>
                <div className="ec-row">
                  <dt>{name} Sunrise</dt>
                  <dd>{time(current.sunrise)}</dd>
                </div>
                <div className="ec-row">
                  <dt>{name} Sunset</dt>
                  <dd>{time(current.sunset)}</dd>
                </div>
                <div className="ec-row">
                  <dt>{name} Day Duration</dt>
                  <dd>{current.dayDuration}</dd>
                </div>
                <div className="ec-row">
                  <dt>{name} Night Duration</dt>
                  <dd>{current.nightDuration}</dd>
                </div>
                <div className="ec-row">
                  <dt>{name} Previous Day Duration</dt>
                  <dd>{current.previousDayDuration}</dd>
                </div>
                <div className="ec-row">
                  <dt>{name} Next Day Duration</dt>
                  <dd>{current.nextDayDuration}</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      )}

      {current && (
        <p className="cg-note">
          <strong>Notes:</strong> {current.note} Times are shown in{" "}
          {mode === "12" ? "12-hour" : mode === "24" ? "24-hour" : "24-plus-hour"} notation.
        </p>
      )}

      <section className="panel ec-about">{ABOUT[event](year, () => setYear(year + 1))}</section>

      <section className="ec-related" aria-label="Related">
        <h2>Other links</h2>
        <div className="ec-related-grid">
          {ORDER.filter((key) => key !== event).map((key) => {
            const found = current?.seasons.find((item) => item.event === key);
            return (
              <button type="button" key={key} className="ec-related-card" onClick={() => onNavigate(`/sections/${key}`)}>
                <strong>{NAMES[key]}</strong>
                <span>{found ? `${year}: ${longDate(found.moment.slice(0, 10))}` : "Date and local timings"}</span>
              </button>
            );
          })}
          <button type="button" className="ec-related-card" onClick={() => onNavigate("/sections/solar-eclipse")}>
            <strong>Solar Eclipse</strong>
            <span>Surya Grahan dates, timings and Sutak</span>
          </button>
          <button type="button" className="ec-related-card" onClick={() => onNavigate("/sections/lunar-eclipse")}>
            <strong>Lunar Eclipse</strong>
            <span>Chandra Grahan dates, timings and Sutak</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default SeasonPage;
