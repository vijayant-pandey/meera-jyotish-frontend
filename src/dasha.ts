import type { DashaLevel, DashaPeriod } from "./types";

const TOTAL_VIMSOTTARI_YEARS = 120;

export function pathKey(path: string[]): string {
  return path.join(">");
}

export function nextDashaLevel(level: DashaLevel): DashaLevel | null {
  if (level === "mahadasha") {
    return "antardasha";
  }
  if (level === "antardasha") {
    return "pratyantardasha";
  }
  if (level === "pratyantardasha") {
    return "sookshma";
  }
  if (level === "sookshma") {
    return "prana";
  }
  if (level === "prana") {
    return "deha";
  }
  return null;
}

export function rotateSequence(sequence: string[], startLord: string): string[] {
  const startIndex = sequence.indexOf(startLord);
  if (startIndex === -1) {
    return sequence;
  }
  return [...sequence.slice(startIndex), ...sequence.slice(0, startIndex)];
}

export function buildChildPeriods(
  parent: DashaPeriod,
  sequence: string[],
  yearsByLord: Record<string, number>,
  nextLevel: DashaLevel
): DashaPeriod[] {
  const rotated = rotateSequence(sequence, parent.lord);
  const parentStartMs = new Date(parent.start).getTime();
  const parentEndMs = new Date(parent.end).getTime();
  const parentDurationMs = parentEndMs - parentStartMs;
  let cursorMs = parentStartMs;

  return rotated.map((lord, index) => {
    const endMs =
      index === rotated.length - 1
        ? parentEndMs
        : cursorMs + (parentDurationMs * (yearsByLord[lord] ?? 0)) / TOTAL_VIMSOTTARI_YEARS;
    const path = [...parent.path, lord];
    const period: DashaPeriod = {
      level: nextLevel,
      lord,
      label: path.join(" / "),
      path,
      start: new Date(cursorMs).toISOString(),
      end: new Date(endMs).toISOString()
    };
    cursorMs = endMs;
    return period;
  });
}

export function findSelectedPeriod(
  periods: DashaPeriod[],
  selectedKey: string,
  fallback?: DashaPeriod
): DashaPeriod {
  const explicit = periods.find((period) => pathKey(period.path) === selectedKey);
  if (explicit) {
    return explicit;
  }
  if (fallback) {
    const activeMatch = periods.find((period) => pathKey(period.path) === pathKey(fallback.path));
    if (activeMatch) {
      return activeMatch;
    }
  }
  return periods[0];
}

export function formatDurationLabel(start: string, end: string): string {
  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  const totalMinutes = Math.max(1, Math.round(durationMs / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days >= 365) {
    return `${(days / 365.2425).toFixed(2)} years`;
  }
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
