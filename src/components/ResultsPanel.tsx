import type { DivisionalChartEntry, KundaliReport } from "../types";
import { formatDateTime } from "../utils";
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
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Sign</th>
                <th>House</th>
                <th>Degree</th>
                <th>Nakshatra</th>
              </tr>
            </thead>
            <tbody>
              {result.planets.map((planet) => (
                <tr key={planet.name}>
                  <td>{planet.name}</td>
                  <td>{planet.signName}</td>
                  <td>{planet.houseNumber}</td>
                  <td>{planet.degreeInSign.toFixed(4)} deg</td>
                  <td>
                    {planet.nakshatra.name} P{planet.nakshatra.pada}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      <NorthIndianChart
        chart={result.chart}
        divisionalCharts={result.divisionalCharts}
        selectedChartKey={selectedChart.key}
        onSelectChart={onChartSelect}
      />

      <div className="results-stack">
        {(view === "overview" || view === "chart") && <SummaryPanels report={report} />}
        {view === "overview" && <DashaExplorer dasha={result.dasha} timeZone={birthTimeZone} />}
        {view === "dasha" && <DashaExplorer dasha={result.dasha} timeZone={birthTimeZone} />}
      </div>
    </section>
  );
}

export default ResultsPanel;
