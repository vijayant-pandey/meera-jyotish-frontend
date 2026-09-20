import { DAY_BY_LORD, GEMSTONE_BY_LORD, type ZodiacSign } from "../zodiac";

type ZodiacPageProps = {
  sign: ZodiacSign;
  onSelectSign: (slug: string) => void;
  allSigns: ZodiacSign[];
};

function Fact({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "fact-wide" : undefined}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Prose({ eyebrow, heading, body }: { eyebrow: string; heading: string; body: string }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{heading}</h3>
      </div>
      <p className="zodiac-prose">{body}</p>
    </article>
  );
}

export function ZodiacPage({ sign, onSelectSign, allSigns }: ZodiacPageProps) {
  return (
    <main className="app-shell zodiac-page">
      <div className="hero">
        <div>
          <p className="eyebrow">Vedic Rashi &middot; Sign {sign.number} of 12</p>
          <h1>
            {sign.name} <span className="zodiac-sanskrit">({sign.sanskrit})</span>
          </h1>
        </div>
        <p className="hero-copy">{sign.tagline}</p>
      </div>

      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">At a Glance</p>
          <h3>{sign.symbol}</h3>
        </div>
        <div className="detail-grid">
          {/* Short facts first so the rows pack densely. The deity is a full
              sentence and spans the whole row, so it goes last - placed earlier it
              cannot fit beside its neighbours and leaves the rest of the row empty. */}
          <Fact label="Ruling planet (Swami)" value={sign.lord} />
          <Fact label="Element (Tattva)" value={sign.element} />
          <Fact label="Quality" value={sign.quality} />
          <Fact label="Exalted graha" value={sign.exalted ?? "None"} />
          <Fact label="Debilitated graha" value={sign.debilitated ?? "None"} />
          <Fact label="Lucky numbers" value={sign.luckyNumbers.join(", ")} />
          <Fact label="Favourable day" value={DAY_BY_LORD[sign.lord] ?? sign.luckyDay} />
          <Fact label="Kaal Purusha" value={sign.bodyPart} />
          <Fact label="Direction" value={sign.direction} />
          <Fact label="Gemstone (Ratna)" value={GEMSTONE_BY_LORD[sign.lord] ?? sign.gemstone} />
          <Fact label="Lucky colours" value={sign.luckyColors.join(", ")} />
          <Fact label="Presiding deity" value={sign.deity} wide />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">Nakshatras</p>
          <h3>Lunar mansions spanning {sign.name}</h3>
        </div>
        <ul className="zodiac-chips">
          {sign.nakshatras.map((nakshatra) => (
            <li key={nakshatra}>{nakshatra}</li>
          ))}
        </ul>
      </section>

      <Prose eyebrow="Nature" heading="Personality and temperament" body={sign.personality} />

      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">Traits</p>
          <h3>Strengths and weaknesses</h3>
        </div>
        <div className="zodiac-traits">
          <div>
            <h4>Strengths</h4>
            <ul className="zodiac-list positive">
              {sign.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Weaknesses</h4>
            <ul className="zodiac-list negative">
              {sign.weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Prose eyebrow="Karma" heading="Career and profession" body={sign.career} />
      <Prose eyebrow="Relationships" heading="Marriage and partnership" body={sign.relationships} />
      <Prose eyebrow="Health" heading="Constitution and vulnerabilities" body={sign.health} />
      <Prose eyebrow="Wealth" heading="Money and finance" body={sign.finance} />

      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">Compatibility</p>
          <h3>Classical rashi matching</h3>
        </div>
        <div className="zodiac-traits">
          <div>
            <h4>Harmonious with</h4>
            <ul className="zodiac-list positive">
              {sign.compatibleWith.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Needs effort with</h4>
            <ul className="zodiac-list negative">
              {sign.challengingWith.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">Upaya</p>
          <h3>Traditional remedies for {sign.lord}</h3>
        </div>
        <ul className="zodiac-list">
          {sign.remedies.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="table-note">
          <strong>Note:</strong> Remedies are traditional practices recorded in classical texts.
          They are offered as reference, not as medical, legal, or financial advice.
        </p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">Explore</p>
          <h3>Other rashis</h3>
        </div>
        <ul className="zodiac-chips zodiac-nav">
          {allSigns.map((other) => (
            <li key={other.slug}>
              <button
                type="button"
                className={other.slug === sign.slug ? "active" : ""}
                onClick={() => onSelectSign(other.slug)}
              >
                {other.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default ZodiacPage;
