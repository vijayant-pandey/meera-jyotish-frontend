import { useCallback, useState } from "react";
import { matchAshtakoota } from "../api";
import type { KundaliRequest, MatchPartner, MatchResponse } from "../types";
import BirthDetailsForm from "./BirthDetailsForm";

function PartnerSummary({ partner, role }: { partner: MatchPartner; role: string }) {
  return (
    <div>
      <span>{role}</span>
      <strong>{partner.name}</strong>
      <small className="match-partner-meta">
        {partner.nakshatraName} pada {partner.pada} &middot; Moon in {partner.moonSignName} &middot;{" "}
        lord {partner.nakshatraLord}
      </small>
    </div>
  );
}

/** A filled proportion bar, so a row is readable without reading the numbers. */
function ScoreBar({ obtained, maximum }: { obtained: number; maximum: number }) {
  const pct = maximum > 0 ? (obtained / maximum) * 100 : 0;
  const tone = pct >= 75 ? "good" : pct >= 40 ? "mid" : "low";
  return (
    <div className="koota-bar" aria-hidden="true">
      <span className={`koota-bar-fill ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** The scored result. Exported so it can be tested without driving two forms. */
export function MatchResultPanel({ result }: { result: MatchResponse }) {
  return (
    <section className="results-stack">
      <article className="panel">
        <div className="panel-header">
          <p className="eyebrow">Result</p>
          <h3>
            {result.totalObtained} / {result.totalMaximum} gunas matched
          </h3>
        </div>

        <div className="match-score-head">
          <div className="match-total">
            <strong>{result.totalObtained}</strong>
            <span>of {result.totalMaximum}</span>
          </div>
          <div className="match-total-meta">
            <p className="match-percentage">{result.percentage}%</p>
            <p className="match-verdict">{result.verdict}</p>
          </div>
        </div>

        <div className="detail-grid match-partners">
          <PartnerSummary partner={result.boy} role="Groom" />
          <PartnerSummary partner={result.girl} role="Bride" />
        </div>

        <div className="table-wrap">
          <table className="planet-table koota-table">
            <thead>
              <tr>
                <th>Koota</th>
                <th className="num-col">Score</th>
                <th className="num-col">Max</th>
                <th>Strength</th>
                <th>What it tests</th>
              </tr>
            </thead>
            <tbody>
              {result.kootas.map((koota) => (
                <tr key={koota.key}>
                  <td>
                    <strong>{koota.name}</strong>
                  </td>
                  <td className="num-col">{koota.obtained}</td>
                  <td className="num-col">{koota.maximum}</td>
                  <td className="koota-bar-cell">
                    <ScoreBar obtained={koota.obtained} maximum={koota.maximum} />
                  </td>
                  <td>{koota.meaning}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td className="num-col">
                  <strong>{result.totalObtained}</strong>
                </td>
                <td className="num-col">
                  <strong>{result.totalMaximum}</strong>
                </td>
                <td colSpan={2}>{result.percentage}% of the available gunas</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="table-note">
          <strong>Note:</strong> Guna milan scores the Moon&rsquo;s nakshatra only. It does not
          assess Mangal dosha, the seventh house and its lord, or the condition of Shukra and
          Guru &mdash; all of which classical practice weighs alongside this total. A score is a
          starting point for a reading, not a verdict on a marriage.
        </p>
      </article>
    </section>
  );
}

export function MatchMakingPage() {
  const [boy, setBoy] = useState<KundaliRequest | null>(null);
  const [girl, setGirl] = useState<KundaliRequest | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Stable, or BirthDetailsForm re-emits on every render of this page.
  const onBoyChange = useCallback((value: KundaliRequest | null) => setBoy(value), []);
  const onGirlChange = useCallback((value: KundaliRequest | null) => setGirl(value), []);

  const ready = boy !== null && girl !== null;

  const runMatch = async () => {
    if (!boy || !girl) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      setResult(await matchAshtakoota(boy, girl));
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : "Could not calculate the match.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell match-page">
      <header className="page-head">
        <h1>Kundali Milan</h1>
        <p>Ashtakoota guna milan, scored out of 36.</p>
      </header>

      <div className="match-grid">
        <BirthDetailsForm
          title="Groom"
          eyebrow="Male"
          defaultGender="MALE"
          onChange={onBoyChange}
        />
        <BirthDetailsForm
          title="Bride"
          eyebrow="Female"
          defaultGender="FEMALE"
          onChange={onGirlChange}
        />
      </div>

      <div className="match-actions">
        <button type="button" className="primary-button" onClick={runMatch} disabled={!ready || busy}>
          {busy ? "Calculating..." : "Match Kundali"}
        </button>
        {!ready && (
          <p className="match-hint">
            Fill in name, date, time and a resolved birthplace for both to enable matching.
          </p>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {result && <MatchResultPanel result={result} />}
    </main>
  );
}

export default MatchMakingPage;
