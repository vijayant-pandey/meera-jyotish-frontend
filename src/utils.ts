import type { Precision, ResolvedPlace } from "./types";

export function isValidTime12h(value: string): boolean {
  return /^([1-9]|0[1-9]|1[0-2]):([0-5][0-9])$/.test(value.trim());
}

export function formatDateTime(value: string, timeZone?: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const baseOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  };

  if (timeZone) {
    baseOptions.timeZone = timeZone;
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      ...baseOptions,
      timeZoneName: "short"
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-IN", baseOptions).format(date);
  }
}

export function canGenerateFromPlace(place: ResolvedPlace | null): boolean {
  if (!place) {
    return false;
  }
  return Boolean(place.timezone && Number.isFinite(place.lat) && Number.isFinite(place.lng));
}

export function effectivePrecision(basePrecision: Precision, manuallyEdited: boolean): Precision {
  return manuallyEdited ? "manual" : basePrecision;
}

/** Renders a degree-within-sign as AstroSage does, e.g. 15.8025 -> "15-48-13". */
export function formatDms(degreeInSign: number): string {
  const totalSeconds = Math.round(degreeInSign * 3600);
  const degrees = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(degrees)}-${pad(minutes)}-${pad(seconds)}`;
}

/** Four-letter Sanskrit rashi abbreviations, indexed by sign number - 1. */
export const RASHI_ABBR = [
  "Mesh", "Vrsh", "Mith", "Kark", "Simh", "Kany",
  "Tula", "Vrsc", "Dhan", "Maka", "Kumb", "Meen"
];

/** Renders a position the way classical tables do: 24 deg Kumb 01' 02". */
export function formatPosition(degreeInSign: number, signNumber: number): string {
  const total = Math.round(degreeInSign * 3600);
  const degrees = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(degrees)}° ${RASHI_ABBR[signNumber - 1]} ${pad(minutes)}′ ${pad(seconds)}″`;
}

/** "3, 10 Bhava" - or a dash when the graha rules nothing. */
export function formatBhavas(houses: number[] | undefined): string {
  return houses && houses.length > 0 ? `${houses.join(", ")} Bhava` : "-";
}
