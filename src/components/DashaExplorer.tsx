import { useEffect, useState } from "react";
import { buildChildPeriods, findSelectedPeriod, formatDurationLabel, pathKey } from "../dasha";
import type { DashaLevel, DashaPeriod, Dasha as DashaModel } from "../types";
import { formatDateTime } from "../utils";

interface DashaExplorerProps {
  dasha: DashaModel;
  timeZone: string;
}

type SelectedKeys = {
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  sookshma: string;
  prana: string;
  deha: string;
};

const LEVEL_TITLES: Record<DashaLevel, string> = {
  mahadasha: "Mahadasha",
  antardasha: "Antardasha",
  pratyantardasha: "Pratyantardasha",
  sookshma: "Sookshma Dasha",
  prana: "Prana Dasha",
  deha: "Deha Dasha"
};

function DashaColumn({
  title,
  periods,
  selected,
  onSelect,
  timeZone
}: {
  title: string;
  periods: DashaPeriod[];
  selected: DashaPeriod;
  onSelect: (period: DashaPeriod) => void;
  timeZone: string;
}) {
  return (
    <div className="dasha-column">
      <div className="dasha-column-header">
        <h4>{title}</h4>
        <span>{periods.length} periods</span>
      </div>
      <div className="dasha-button-list">
        {periods.map((period) => {
          const isActive = pathKey(period.path) === pathKey(selected.path);
          return (
            <button
              key={pathKey(period.path)}
              type="button"
              className={`dasha-button${isActive ? " active" : ""}`}
              onClick={() => onSelect(period)}
            >
              <strong>{period.lord}</strong>
              <span>{formatDateTime(period.start, timeZone)}</span>
              <span>{formatDateTime(period.end, timeZone)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DashaExplorer({ dasha, timeZone }: DashaExplorerProps) {
  const active = dasha.activeAtBirth;
  const [selectedKeys, setSelectedKeys] = useState<SelectedKeys>({
    mahadasha: pathKey(active.mahadashaPeriod.path),
    antardasha: pathKey(active.antardashaPeriod.path),
    pratyantardasha: pathKey(active.pratyantardashaPeriod.path),
    sookshma: pathKey(active.sookshmaPeriod.path),
    prana: pathKey(active.pranaPeriod.path),
    deha: pathKey(active.dehaPeriod?.path ?? [])
  });

  useEffect(() => {
    setSelectedKeys({
      mahadasha: pathKey(active.mahadashaPeriod.path),
      antardasha: pathKey(active.antardashaPeriod.path),
      pratyantardasha: pathKey(active.pratyantardashaPeriod.path),
      sookshma: pathKey(active.sookshmaPeriod.path),
      prana: pathKey(active.pranaPeriod.path),
      deha: pathKey(active.dehaPeriod?.path ?? [])
    });
  }, [dasha]);

  const selectedMahadasha = findSelectedPeriod(dasha.periods, selectedKeys.mahadasha, active.mahadashaPeriod);
  const antardashas = buildChildPeriods(
    selectedMahadasha,
    dasha.sequence,
    dasha.yearsByLord,
    "antardasha"
  );
  const selectedAntardasha = findSelectedPeriod(
    antardashas,
    selectedKeys.antardasha,
    active.antardashaPeriod
  );
  const pratyantardashas = buildChildPeriods(
    selectedAntardasha,
    dasha.sequence,
    dasha.yearsByLord,
    "pratyantardasha"
  );
  const selectedPratyantardasha = findSelectedPeriod(
    pratyantardashas,
    selectedKeys.pratyantardasha,
    active.pratyantardashaPeriod
  );
  const sookshmaDashas = buildChildPeriods(
    selectedPratyantardasha,
    dasha.sequence,
    dasha.yearsByLord,
    "sookshma"
  );
  const selectedSookshma = findSelectedPeriod(
    sookshmaDashas,
    selectedKeys.sookshma,
    active.sookshmaPeriod
  );
  const pranaDashas = buildChildPeriods(selectedSookshma, dasha.sequence, dasha.yearsByLord, "prana");
  const selectedPrana = findSelectedPeriod(pranaDashas, selectedKeys.prana, active.pranaPeriod);
  const dehaDashas = buildChildPeriods(selectedPrana, dasha.sequence, dasha.yearsByLord, "deha");
  const selectedDeha = findSelectedPeriod(dehaDashas, selectedKeys.deha, active.dehaPeriod ?? dehaDashas[0]);

  const handleSelect = (level: DashaLevel, period: DashaPeriod) => {
    if (level === "mahadasha") {
      setSelectedKeys({
        mahadasha: pathKey(period.path),
        antardasha: "",
        pratyantardasha: "",
        sookshma: "",
        prana: "",
        deha: ""
      });
      return;
    }
    if (level === "antardasha") {
      setSelectedKeys((current) => ({
        ...current,
        antardasha: pathKey(period.path),
        pratyantardasha: "",
        sookshma: "",
        prana: "",
        deha: ""
      }));
      return;
    }
    if (level === "pratyantardasha") {
      setSelectedKeys((current) => ({
        ...current,
        pratyantardasha: pathKey(period.path),
        sookshma: "",
        prana: "",
        deha: ""
      }));
      return;
    }
    if (level === "sookshma") {
      setSelectedKeys((current) => ({
        ...current,
        sookshma: pathKey(period.path),
        prana: "",
        deha: ""
      }));
      return;
    }
    if (level === "prana") {
      setSelectedKeys((current) => ({ ...current, prana: pathKey(period.path), deha: "" }));
      return;
    }
    setSelectedKeys((current) => ({ ...current, deha: pathKey(period.path) }));
  };

  return (
    <article className="panel">
      <div className="panel-header">
        <p className="eyebrow">Vimshottari Dasha</p>
        <h3>Accurate Nested Dasha Drill-Down</h3>
      </div>

      <div className="dasha-summary-grid">
        <div>
          <span>Mahadasha Balance</span>
          <strong>{dasha.balanceAtBirth.remainingYears.toFixed(4)} years remaining</strong>
        </div>
        <div>
          <span>Dasha Year Basis</span>
          <strong>{dasha.yearDays.toFixed(2)} days</strong>
        </div>
        <div>
          <span>Active Path</span>
          <strong>
            {active.mahadasha} / {active.antardasha} / {active.pratyantardasha}
          </strong>
        </div>
        <div>
          <span>Deeper Levels</span>
          <strong>
            {active.sookshma} / {active.prana} / {active.deha ?? selectedDeha.lord}
          </strong>
        </div>
      </div>

      <div className="dasha-columns">
        <DashaColumn
          title={LEVEL_TITLES.mahadasha}
          periods={dasha.periods}
          selected={selectedMahadasha}
          onSelect={(period) => handleSelect("mahadasha", period)}
          timeZone={timeZone}
        />
        <DashaColumn
          title={LEVEL_TITLES.antardasha}
          periods={antardashas}
          selected={selectedAntardasha}
          onSelect={(period) => handleSelect("antardasha", period)}
          timeZone={timeZone}
        />
        <DashaColumn
          title={LEVEL_TITLES.pratyantardasha}
          periods={pratyantardashas}
          selected={selectedPratyantardasha}
          onSelect={(period) => handleSelect("pratyantardasha", period)}
          timeZone={timeZone}
        />
        <DashaColumn
          title={LEVEL_TITLES.sookshma}
          periods={sookshmaDashas}
          selected={selectedSookshma}
          onSelect={(period) => handleSelect("sookshma", period)}
          timeZone={timeZone}
        />
        <DashaColumn
          title={LEVEL_TITLES.prana}
          periods={pranaDashas}
          selected={selectedPrana}
          onSelect={(period) => handleSelect("prana", period)}
          timeZone={timeZone}
        />
        <DashaColumn
          title={LEVEL_TITLES.deha}
          periods={dehaDashas}
          selected={selectedDeha}
          onSelect={(period) => handleSelect("deha", period)}
          timeZone={timeZone}
        />
      </div>

      <div className="dasha-detail-card">
        <p className="eyebrow">Selected Final Detail</p>
        <h4>{selectedDeha.label}</h4>
        <div className="detail-grid">
          <div>
            <span>Starts</span>
            <strong>{formatDateTime(selectedDeha.start, timeZone)}</strong>
          </div>
          <div>
            <span>Ends</span>
            <strong>{formatDateTime(selectedDeha.end, timeZone)}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{formatDurationLabel(selectedDeha.start, selectedDeha.end)}</strong>
          </div>
          <div>
            <span>Path</span>
            <strong>{selectedDeha.path.join(" / ")}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}

export default DashaExplorer;
