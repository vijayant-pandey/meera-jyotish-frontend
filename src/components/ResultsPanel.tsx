import type { DivisionalChartEntry, KundaliReport, PlanetPosition } from "../types";
import { formatBhavas, formatDateTime, formatPosition } from "../utils";
import DashaExplorer from "./DashaExplorer";
import NorthIndianChart from "./NorthIndianChart";

interface ResultsPanelProps {
  report: KundaliReport;
  view: "overview" | "chart" | "dasha";
  activeChartKey: string;
  onChartSelect: (chartKey: string) => void;
  onOpenOverview: () => void;
  onOpenDasha: () => void;
}

// Rahu and Ketu are always retrograde, so a D/R flag says nothing about them.
function motionFlag(planet: PlanetPosition): string {
  if (planet.name === "Rahu" || planet.name === "Ketu") {
    return "-";
  }
  return planet.retrograde ? "R" : "D";
}

function SummaryPanels({ report }: { report: KundaliReport }) {
  const { result } = report;
  const birthTimeZone = result.birthContext.timezone;

  return (
    <>
      <article className="panel">
        <div className="panel-header">
          <p className="eyebrow">Birth Context</p>
          <h3>Computed Details</h3>
        </div>
        <div className="detail-grid">
          <div>
            <span>Local time</span>
            <strong>{formatDateTime(result.birthContext.localDatetime, birthTimeZone)}</strong>
          </div>
          <div>
            <span>UTC time</span>
            <strong>{formatDateTime(result.birthContext.utcDatetime, "UTC")}</strong>
          </div>
          <div>
            <span>Timezone</span>
            <strong>{result.birthContext.timezone}</strong>
          </div>
          <div>
            <span>Ayanamsha</span>
            <strong>{result.birthContext.ayanamsha}</strong>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <p className="eyebrow">Panchang</p>
          <h3>Tithi, Vara, Yoga</h3>
        </div>
        <div className="detail-grid">
          <div>
            <span>Tithi</span>
            <strong>{result.panchang.tithi}</strong>
          </div>
          <div>
            <span>Vara</span>
            <strong>{result.panchang.vara}</strong>
          </div>
          <div>
            <span>Nakshatra</span>
            <strong>{result.panchang.nakshatra}</strong>
          </div>
          <div>
            <span>Karana</span>
            <strong>{result.panchang.karana}</strong>
          </div>
          <div>
            <span>Yoga</span>
            <strong>{result.panchang.yoga}</strong>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <p className="eyebrow">Planets</p>
          <h3>Sign and House Positions</h3>
        </div>
        <div className="table-wrap">
          <table className="planet-table">
            <thead>
              <tr>
                <th>Graha</th>
                <th className="flag-col">C</th>
                <th className="flag-col">R</th>
                <th>Longitude</th>
                <th>Nakshatra</th>
                <th>Pada</th>
                <th>Nakshatra Lord / Sub Lord</th>
                <th>Ruler of</th>
                <th>Is In</th>
                <th>B. Owner</th>
                <th>Relationship</th>
                <th>Dignities</th>
              </tr>
            </thead>
            <tbody>
              {result.ascendant && (
                <tr>
                  <td>Lagna</td>
                  <td className="flag-col" />
                  <td className="flag-col" />
                  <td className="nowrap">
                    {formatPosition(
                      result.ascendant.degreeInSign,
                      result.ascendant.signNumber
                    )}
                  </td>
                  <td>{result.ascendant.nakshatra.name}</td>
                  <td>{result.ascendant.nakshatra.pada}</td>
                  <td>
                    {result.ascendant.nakshatra.lord}
                    {result.ascendant.subLord ? `, ${result.ascendant.subLord}` : ""}
                  </td>
                  <td>{formatBhavas(result.ascendant.housesRuled)}</td>
                  <td>1 Bhava</td>
                  <td>{result.ascendant.signLord ?? "-"}</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              )}
              {result.planets.map((planet) => (
                <tr key={planet.name}>
                  <td>
                    {planet.sanskritName || planet.name}
                    <small className="graha-alt">{planet.name}</small>
                  </td>
                  <td className="flag-col">{planet.combust ? "C" : ""}</td>
                  <td className="flag-col">{motionFlag(planet)}</td>
                  <td className="nowrap">
                    {formatPosition(planet.degreeInSign, planet.signNumber)}
                  </td>
                  <td>{planet.nakshatra.name}</td>
                  <td>{planet.nakshatra.pada}</td>
                  <td>
                    {planet.nakshatra.lord}
                    {planet.subLord ? `, ${planet.subLord}` : ""}
                  </td>
                  <td>{formatBhavas(planet.housesRuled)}</td>
                  <td>{planet.houseNumber} Bhava</td>
                  <td>{planet.signLord ?? "-"}</td>
                  <td>{planet.relation ?? "-"}</td>
                  <td>{planet.dignity || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          <strong>Note:</strong> [C] Combust &middot; [D] Direct &middot; [R] Retrograde.
          Longitude is degrees-minutes-seconds within the rashi. Sub Lord is the KP
          Vimshottari sub-division of the nakshatra. Relationship is how the graha regards
          the lord of the rashi it sits in; Dignities is reported separately.
        </p>
      </article>
    </>
  );
}

function resolveSelectedChart(
  divisionalCharts: DivisionalChartEntry[],
  activeChartKey: string
) {
  return divisionalCharts.find((chart) => chart.key === activeChartKey) ?? divisionalCharts[0];
}

// The Rashi, Bhava Chalit and Navamsa charts are read side by side, so the row
// shows the selected chart first and then fills the other two slots. Backfilling
// from this list keeps the row at three cards without ever repeating one.
const COMPANION_CHART_KEYS = ["CHALIT", "D9", "D1"];

export function buildChartRow(
  divisionalCharts: DivisionalChartEntry[],
  selectedChart: DivisionalChartEntry
): DivisionalChartEntry[] {
  const row = [selectedChart];
  for (const key of COMPANION_CHART_KEYS) {
    if (row.length >= 3) {
      break;
    }
    const entry = divisionalCharts.find((chart) => chart.key === key);
    if (entry && !row.some((chart) => chart.key === entry.key)) {
      row.push(entry);
    }
  }
  return row;
}

export function ResultsPanel({
  report,
  view,
  activeChartKey,
  onChartSelect,
  onOpenOverview,
  onOpenDasha
}: ResultsPanelProps) {
  const { result } = report;
  const selectedChart = resolveSelectedChart(result.divisionalCharts, activeChartKey);
  const chartRow = buildChartRow(result.divisionalCharts, selectedChart);
  const birthTimeZone = result.birthContext.timezone;

  return (
    <section className="results-shell">
      <div className="panel report-summary-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Saved Report</p>
            <h2>{report.request.name}</h2>
          </div>
          <div className="report-section-tabs">
            <button
              type="button"
              className={view === "overview" ? "active" : ""}
              onClick={onOpenOverview}
            >
              Overview
            </button>
            <button
              type="button"
              className={view === "chart" ? "active" : ""}
              onClick={() => onChartSelect(selectedChart.key)}
            >
              Chart
            </button>
            <button
              type="button"
              className={view === "dasha" ? "active" : ""}
              onClick={onOpenDasha}
            >
              Dasha
            </button>
          </div>
        </div>
        <div className="detail-grid">
          <div>
            <span>Birthplace</span>
            <strong>{report.request.place.label}</strong>
          </div>
          <div>
            <span>Birth date</span>
            <strong>{report.request.birthDate}</strong>
          </div>
          <div>
            <span>Birth time</span>
            <strong>
              {report.request.birthTime12h} {report.request.meridiem}
            </strong>
          </div>
          <div>
            <span>Default chart route</span>
            <strong>{selectedChart.key}</strong>
          </div>
        </div>
      </div>

      <div className="chart-row">
        {chartRow.map((entry, index) => (
          <NorthIndianChart
            key={entry.key}
            chart={entry.chart}
            divisionalCharts={index === 0 ? result.divisionalCharts : undefined}
            selectedChartKey={index === 0 ? entry.key : undefined}
            onSelectChart={index === 0 ? onChartSelect : undefined}
            showSelector={index === 0}
            eyebrow={index === 0 ? "Selected Chart" : "Companion Chart"}
            title={entry.title}
            focus={entry.focus}
          />
        ))}
      </div>

      <div className="results-stack">
        {(view === "overview" || view === "chart") && <SummaryPanels report={report} />}
        {view === "overview" && <DashaExplorer dasha={result.dasha} timeZone={birthTimeZone} />}
        {view === "dasha" && <DashaExplorer dasha={result.dasha} timeZone={birthTimeZone} />}
      </div>
    </section>
  );
}

export default ResultsPanel;
