import { useEffect, useState } from "react";
import { fetchEclipseYear } from "../api";
import type { Eclipse, EclipseKind, EclipseYear } from "../types";
import PlacePicker, { loadStoredPlace, type PickedPlace } from "./PlacePicker";
import { ImageCredit, bannerProps, useImageSlot } from "./Photo";

export type ClockMode = "12" | "24" | "24plus";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const COPY: Record<EclipseKind, { name: string; hindi: string; other: EclipseKind; otherPath: string }> = {
  solar: {
    name: "Solar Eclipse",
    hindi: "Surya Grahan",
    other: "lunar",
    otherPath: "/sections/lunar-eclipse"
  },
  lunar: {
    name: "Lunar Eclipse",
    hindi: "Chandra Grahan",
    other: "solar",
    otherPath: "/sections/solar-eclipse"
  }
};

function ordinal(day: number): string {
  const tail = day % 100 >= 11 && day % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][day % 10] ?? "th";
  return `${day}${tail}`;
}

/** "2027-02-06" -> "6th February 2027". */
export function longDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${ordinal(day)} ${MONTHS[month - 1]} ${year}`;
}

/** "2027-02-06" -> "Feb 6, 2027". */
function shortDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1].slice(0, 3)} ${day}, ${year}`;
}

function dayNumber(iso: string): number {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

/**
 * Formats a contact time as the place's own wall clock. The server sends ISO
 * strings carrying the place's offset, so the clock is read straight from the
 * string; going through Date would show the viewer's timezone instead.
 */
export function formatTime(iso: string, mode: ClockMode, eclipseDate: string, seconds: boolean): string {
  const [hh, mm, ss] = iso.slice(11, 19).split(":").map(Number);
  const pad = (value: number) => String(value).padStart(2, "0");
  const tail = seconds ? `:${pad(ss)}` : "";
  const shift = dayNumber(iso) - dayNumber(eclipseDate);

  if (mode === "24plus") {
    return `${pad(hh + shift * 24)}:${pad(mm)}${tail}`;
  }
  const clock =
    mode === "24"
      ? `${pad(hh)}:${pad(mm)}${tail}`
      : `${pad(hh % 12 || 12)}:${pad(mm)}${tail} ${hh < 12 ? "AM" : "PM"}`;
  // Like a printed panchang, a time on another calendar date carries that date.
  if (shift !== 0) {
    const [, month, day] = iso.slice(0, 10).split("-").map(Number);
    return `${clock}, ${MONTHS[month - 1].slice(0, 3)} ${pad(day)}`;
  }
  return clock;
}

function parseMagnitude(eclipse: Eclipse): number {
  const wanted = eclipse.kind === "solar" ? "Magnitude of Eclipse" : "Magnitude of Umbral Eclipse";
  const found = eclipse.magnitudes.find((item) => item.label === wanted);
  return found ? Number(found.value) : 0;
}

/** The disc at maximum: how much of the Sun the Moon covers, or how deep the
 * Moon sits in the Earth's shadow. */
function EclipseFigure({ eclipse }: { eclipse: Eclipse }) {
  const r = 34;
  const c = 50;

  if (eclipse.kind === "solar") {
    const type = eclipse.localType ?? eclipse.globalType;
    // Magnitude is the fraction of the Sun's diameter covered.
    let magnitude = eclipse.visible ? parseMagnitude(eclipse) : 0.6;
    if (type === "Total" || type === "Hybrid") magnitude = 1;
    const moonR = type === "Annular" ? r * 0.88 : r * 1.02;
    const offset = type === "Annular" ? 0 : r + moonR - 2 * r * Math.min(magnitude, 1);
    return (
      <svg viewBox="0 0 100 100" className="ec-figure" role="img" aria-label={`${type} solar eclipse at maximum`}>
        {type === "Total" || type === "Hybrid" ? (
          <circle cx={c} cy={c} r={r + 9} className="ec-corona" />
        ) : null}
        <circle cx={c} cy={c} r={r} className="ec-sun" />
        <circle cx={c + offset * 0.8} cy={c - offset * 0.6} r={moonR} className="ec-moon-shadow" />
      </svg>
    );
  }

  const magnitude = parseMagnitude(eclipse);
  const umbraR = r * 2.6;
  // Umbral magnitude is the fraction of the Moon's diameter inside the umbra.
  const offset = umbraR + r - 2 * r * Math.min(magnitude, 1.4);
  const penumbral = eclipse.globalType === "Penumbral";
  return (
    <svg viewBox="0 0 100 100" className="ec-figure" role="img" aria-label={`${eclipse.globalType} lunar eclipse at maximum`}>
      <defs>
        <clipPath id={`moon-${eclipse.date}`}>
          <circle cx={c} cy={c} r={r} />
        </clipPath>
      </defs>
      <circle cx={c} cy={c} r={r} className="ec-full-moon" />
      <g clipPath={`url(#moon-${eclipse.date})`}>
        {penumbral ? (
          <circle cx={c - r * 0.9} cy={c + r * 0.4} r={r * 1.6} className="ec-penumbra" />
        ) : (
          <circle cx={c - offset * 0.9} cy={c + offset * 0.44} r={umbraR} className="ec-umbra" />
        )}
      </g>
      <circle cx={c} cy={c} r={r} className="ec-moon-rim" />
    </svg>
  );
}

function EclipseCard({
  eclipse,
  mode,
  seconds,
  location
}: {
  eclipse: Eclipse;
  mode: ClockMode;
  seconds: boolean;
  location: string;
}) {
  const time = (iso: string) => formatTime(iso, mode, eclipse.date, seconds);
  const lunar = eclipse.kind === "lunar";
  const sutakNote = lunar && eclipse.globalType === "Penumbral"
    ? "Not applicable: a penumbral eclipse is not observed."
    : "Not Applicable";

  return (
    <article className="ec-card" id={`eclipse-${eclipse.date}`}>
      <header className="ec-card-head">
        <div>
          <h2>{eclipse.title}</h2>
          <p>
            {longDate(eclipse.date)} &middot; {eclipse.weekday}
          </p>
        </div>
        <span className={eclipse.visible ? "ec-chip visible" : "ec-chip"}>
          {eclipse.visible ? "Visible here" : "Not visible here"}
        </span>
      </header>

      <div className="ec-card-body">
        <div className="ec-figure-col">
          <EclipseFigure eclipse={eclipse} />
          <p className="ec-figure-caption">
            {eclipse.localType && eclipse.localType !== eclipse.globalType
              ? `Seen as ${eclipse.localType.toLowerCase()} from ${location}`
              : `${eclipse.globalType} eclipse at maximum`}
          </p>
        </div>

        <div className="ec-timings">
          <h3>{lunar ? "Lunar" : "Solar"} Eclipse Local Timings</h3>
          <p className={eclipse.visible ? "ec-visibility visible" : "ec-visibility"}>
            {eclipse.visibility}
          </p>

          {eclipse.contacts.length > 0 && (
            <dl className="ec-rows">
              {eclipse.contacts.map((contact) => (
                <div
                  key={contact.label}
                  className={contact.label === "Maximum Eclipse" ? "ec-row max" : "ec-row"}
                >
                  <dt>{contact.label}</dt>
                  <dd>
                    {time(contact.time)}
                    {contact.visible === false && (
                      <small className="ec-below">{lunar ? "Moon below horizon" : "Sun below horizon"}</small>
                    )}
                  </dd>
                </div>
              ))}
              {eclipse.horizonEvents.map((event) => (
                <div key={event.event} className="ec-row horizon">
                  <dt>
                    {lunar ? "Moon" : "Sun"}
                    {event.event === "rise" ? "rise" : "set"} during Eclipse
                  </dt>
                  <dd>{time(event.time)}</dd>
                </div>
              ))}
              {eclipse.durations.map((item) => (
                <div key={item.label} className="ec-row">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
              {eclipse.magnitudes.map((item) => (
                <div key={item.label} className="ec-row">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {!eclipse.visible && eclipse.kind === "solar" && (
            <dl className="ec-rows">
              <div className="ec-row">
                <dt>Greatest Eclipse (on Earth)</dt>
                <dd>{time(eclipse.globalMaximum)}</dd>
              </div>
              {eclipse.globalBegins && eclipse.globalEnds && (
                <div className="ec-row">
                  <dt>Eclipse on Earth</dt>
                  <dd>
                    {time(eclipse.globalBegins)} to {time(eclipse.globalEnds)}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <h3 className="ec-sutak-title">Sutak</h3>
          <dl className="ec-rows">
            <div className="ec-row">
              <dt>Sutak Begins</dt>
              <dd>{eclipse.sutak ? time(eclipse.sutak.begins) : sutakNote}</dd>
            </div>
            <div className="ec-row">
              <dt>Sutak Ends</dt>
              <dd>{eclipse.sutak ? time(eclipse.sutak.ends) : sutakNote}</dd>
            </div>
            <div className="ec-row">
              <dt>Sutak for Kids, Old and Sick Begins</dt>
              <dd>{eclipse.sutak ? time(eclipse.sutak.kidsBegins) : sutakNote}</dd>
            </div>
            <div className="ec-row">
              <dt>Sutak for Kids, Old and Sick Ends</dt>
              <dd>{eclipse.sutak ? time(eclipse.sutak.kidsEnds) : sutakNote}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}

function SolarAbout() {
  return (
    <section className="panel ec-about">
      <h2>About the Solar Eclipse data</h2>
      <p>
        A solar eclipse is seen differently from every place on Earth. The timings, magnitude and
        obscuration above are worked out for the selected place, so the same eclipse can be total
        in one city, partial in the next and invisible a few thousand kilometres away. When the
        selected place sees none of it, the time of greatest eclipse anywhere on Earth is given
        instead.
      </p>
      <p>
        Magnitude is the fraction of the Sun&rsquo;s diameter covered by the Moon at maximum.
        Obscuration is the fraction of the Sun&rsquo;s disc that is hidden, which is always a
        little smaller than the magnitude for a partial eclipse. Never look at the Sun directly,
        even when it is mostly covered; use certified eclipse glasses or a pinhole projector.
      </p>
      <h2>Hinduism and Solar Eclipse</h2>
      <p>
        In Hindu tradition a solar eclipse is Surya Grahan, the time when Rahu swallows the Sun.
        The period is treated as inauspicious: new work, eating and cooking are set aside, and
        bathing, charity and the chanting of mantras are encouraged once the eclipse is over.
      </p>
      <p>
        Only an eclipse that can be seen from a place is observed there. When an eclipse is not
        visible locally, neither the eclipse nor its Sutak is followed. Clouds that hide a visible
        eclipse do not cancel it; the observances still apply.
      </p>
      <h2>Sutak during a Solar Eclipse</h2>
      <p>
        Sutak begins four prahars, about 12 hours, before a solar eclipse starts and lasts until it
        ends. For children, the elderly and the sick a shorter Sutak is followed, shown above as a
        separate time. Customs vary between families and regions, so follow your own tradition
        where it differs.
      </p>
    </section>
  );
}

function LunarAbout() {
  return (
    <section className="panel ec-about">
      <h2>About the Lunar Eclipse data</h2>
      <p>
        A lunar eclipse happens at the same moment for everyone who can see the Moon, so its contact
        times are the same everywhere and only the clock they are shown in changes. What does
        differ is whether the Moon is above the horizon: a contact that happens before moonrise or
        after moonset is marked on the timings above.
      </p>
      <p>
        An eclipse that runs across midnight is listed on the date of its maximum, and its later
        contacts carry the next date beside the time. The penumbral phase is the faint outer
        shadow of the Earth; the umbral phase is the dark inner shadow that visibly bites into the
        Moon.
      </p>
      <h2>Hinduism and Lunar Eclipse</h2>
      <p>
        A lunar eclipse is Chandra Grahan, the time when Rahu or Ketu takes hold of the Moon. Only an
        eclipse that can be seen with the naked eye is observed, which in practice means the umbral
        phase. A penumbral-only eclipse dims the Moon too slightly to notice, so it carries no
        observances and no Sutak.
      </p>
      <p>
        Where the umbral eclipse is visible, Sutak is kept from three prahars, about 9 hours,
        before the umbral phase begins until it ends. Children, the elderly and the sick keep a
        shorter Sutak, shown above as a separate time. Clouds that hide a visible eclipse do not
        cancel the observances.
      </p>
    </section>
  );
}

export function EclipsePage({
  kind,
  onNavigate
}: {
  kind: EclipseKind;
  onNavigate: (path: string) => void;
}) {
  const banner = useImageSlot(`banner.${kind}-eclipse`, kind === "solar" ? "solar-eclipse" : "lunar-eclipse");
  const copy = COPY[kind];
  const [place, setPlace] = useState<PickedPlace>(() => loadStoredPlace());
  // Undefined lets the server open on the year of the next eclipse.
  const [year, setYear] = useState<number | undefined>(undefined);
  const [mode, setMode] = useState<ClockMode>("12");
  const [seconds, setSeconds] = useState(false);
  const [data, setData] = useState<EclipseYear | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Switching between the solar and lunar pages starts each on its own default year.
  useEffect(() => {
    setYear(undefined);
  }, [kind]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void fetchEclipseYear(kind, place, year)
      .then((result) => !cancelled && setData(result))
      .catch(
        (cause) =>
          !cancelled &&
          setError(cause instanceof Error ? cause.message : "Could not load the eclipses.")
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [kind, place, year]);

  const shownYear = data?.kind === kind ? data.year : year;
  const goToYear = (target: number) => setYear(target);

  return (
    <main className="app-shell choghadiya-page eclipse-page">
      <header className={`cg-banner ec-banner ${bannerProps(banner).className}`} style={bannerProps(banner).style}>
        <div>
          <p className="cg-banner-title">Astronomy Events &rsaquo; Eclipse List</p>
          <h1 className="ec-title">
            {shownYear ? `${shownYear} ` : ""}
            {copy.name} | {copy.hindi} date and time for {place.label}
          </h1>
          {data?.previous && data.kind === kind && (
            <button type="button" className="ec-link" onClick={() => goToYear(Number(data.previous!.slice(0, 4)))}>
              &#8249; Last {copy.name} on {shortDate(data.previous)}
            </button>
          )}
        </div>
        <nav className="ec-quick" aria-label="Eclipse pages">
          <button type="button" onClick={() => onNavigate(copy.otherPath)}>
            {COPY[copy.other].name}
          </button>
        </nav>
        <ImageCredit image={banner} className="on-banner" />
      </header>

      <nav className="cg-strip ec-years" aria-label="Year">
        {shownYear && (
          <>
            <button type="button" onClick={() => goToYear(shownYear - 1)}>
              &#8249; {shownYear - 1}
            </button>
            {[-2, -1, 0, 1, 2].map((delta) => (
              <button
                type="button"
                key={delta}
                className={delta === 0 ? "active" : ""}
                onClick={() => goToYear(shownYear + delta)}
              >
                {shownYear + delta}
              </button>
            ))}
            <button type="button" onClick={() => goToYear(shownYear + 1)}>
              {shownYear + 1} &#8250;
            </button>
          </>
        )}
      </nav>

      <div className="cg-controls">
        <PlacePicker value={place} onChange={setPlace} />
        <div className="ec-options">
          <div className="cg-modes" role="group" aria-label="Clock format">
            {([
              ["12", "12 Hour"],
              ["24", "24 Hour"],
              ["24plus", "24 Plus Hour"]
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
            <input type="checkbox" checked={seconds} onChange={(event) => setSeconds(event.target.checked)} />
            Show seconds
          </label>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && !data && <p className="admin-empty">Calculating…</p>}

      {data && data.kind === kind && (
        <div className={loading ? "ec-list loading" : "ec-list"}>
          <h2 className="cg-datetab">
            {data.year} {copy.name}
            {data.eclipses.length !== 1 ? "s" : ""}
          </h2>

          {data.eclipses.length > 1 && (
            <nav className="ec-index" aria-label={`${copy.name}s in ${data.year}`}>
              {data.eclipses.map((eclipse) => (
                <button
                  type="button"
                  key={eclipse.date}
                  onClick={() =>
                    document
                      .getElementById(`eclipse-${eclipse.date}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  {shortDate(eclipse.date)} &middot; {eclipse.globalType}
                  {eclipse.date === data.upcoming ? " · Next" : ""}
                </button>
              ))}
            </nav>
          )}

          {data.eclipses.length === 0 && (
            <p className="admin-empty">No {copy.name.toLowerCase()} falls in {data.year}.</p>
          )}

          {data.eclipses.map((eclipse) => (
            <EclipseCard
              key={eclipse.date}
              eclipse={eclipse}
              mode={mode}
              seconds={seconds}
              location={data.location}
            />
          ))}

          <p className="cg-note">
            <strong>Notes:</strong> {data.note} Times are shown in{" "}
            {mode === "12" ? "12-hour" : mode === "24" ? "24-hour" : "24-plus-hour"} notation; in
            24-plus notation a time after midnight continues past 24:00 instead of rolling over.
          </p>

          {data.next && (
            <button type="button" className="ec-link ec-next" onClick={() => goToYear(Number(data.next!.slice(0, 4)))}>
              Next {copy.name} on {shortDate(data.next)} &#8250;
            </button>
          )}
        </div>
      )}

      {kind === "solar" ? <SolarAbout /> : <LunarAbout />}

      <section className="ec-related" aria-label="Related">
        <h2>Related</h2>
        <div className="ec-related-grid">
          {[
            [COPY[copy.other].name, copy.otherPath, kind === "solar" ? "Chandra Grahan dates, timings and Sutak" : "Surya Grahan dates, timings and Sutak"],
            ["Rahu Kaal", "/sections/rahu-kalam", "The daily period ruled by Rahu"],
            ["Choghadiya", "/sections/chaughadiya", "Auspicious slots of the day and night"],
            ["Hora", "/sections/hora", "Planetary hours for the day"]
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

export default EclipsePage;
