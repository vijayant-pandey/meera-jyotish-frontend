export type Precision = "city" | "admin" | "country" | "manual";
export type Source = "google" | "osm" | "manual";
export type Ayanamsha = "LAHIRI" | "RAMAN" | "KP";
export type Meridiem = "AM" | "PM";

export interface PlaceSuggestion {
  provider: Source;
  providerId: string;
  label: string;
  secondaryLabel?: string | null;
  precision: Precision;
  countryCode?: string | null;
  country?: string | null;
}

export interface ResolvedPlace {
  label: string;
  lat: number;
  lng: number;
  timezone: string;
  countryCode?: string | null;
  country?: string | null;
  admin?: string | null;
  precision: Precision;
  source: Source;
}

export interface KundaliRequest {
  name: string;
  birthDate: string;
  birthTime12h: string;
  meridiem: Meridiem;
  ayanamsha: Ayanamsha;
  place: ResolvedPlace;
}

export interface NakshatraInfo {
  number: number;
  name: string;
  pada: number;
  lord: string;
}

export interface PlanetPosition {
  name: string;
  abbreviation: string;
  longitude: number;
  signNumber: number;
  signName: string;
  degreeInSign: number;
  houseNumber: number;
  retrograde: boolean;
  nakshatra: NakshatraInfo;
}

export interface Panchang {
  tithi: string;
  vara: string;
  nakshatra: string;
  yoga: string;
  karana: string;
}

export type DashaLevel =
  | "mahadasha"
  | "antardasha"
  | "pratyantardasha"
  | "sookshma"
  | "prana"
  | "deha";

export interface DashaPeriod {
  level: DashaLevel;
  lord: string;
  label: string;
  path: string[];
  start: string;
  end: string;
}

export interface DashaBalance {
  lord: string;
  start: string;
  end: string;
  elapsedDays: number;
  remainingDays: number;
  remainingYears: number;
  remainingNakshatraFraction: number;
}

export interface ActiveDasha {
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  sookshma: string;
  prana: string;
  deha?: string | null;
  mahadashaPeriod: DashaPeriod;
  antardashaPeriod: DashaPeriod;
  pratyantardashaPeriod: DashaPeriod;
  sookshmaPeriod: DashaPeriod;
  pranaPeriod: DashaPeriod;
  dehaPeriod?: DashaPeriod | null;
}

export interface Dasha {
  system: string;
  yearDays: number;
  sequence: string[];
  yearsByLord: Record<string, number>;
  balanceAtBirth: DashaBalance;
  activeAtBirth: ActiveDasha;
  periods: DashaPeriod[];
}

export interface ChartHouse {
  houseNumber: number;
  signNumber: number;
  signName: string;
  planets: string[];
}

export interface Chart {
  style: string;
  ascendantSignNumber: number;
  ascendantSignName: string;
  houses: ChartHouse[];
}

export interface DivisionalChartEntry {
  key: string;
  factor: number;
  title: string;
  focus: string;
  chart: Chart;
}

export interface BirthContext {
  localDatetime: string;
  utcDatetime: string;
  timezone: string;
  latitude: number;
  longitude: number;
  ayanamsha: Ayanamsha;
  julianDayUt: number;
}

export interface KundaliResponse {
  birthContext: BirthContext;
  chart: Chart;
  divisionalCharts: DivisionalChartEntry[];
  planets: PlanetPosition[];
  panchang: Panchang;
  dasha: Dasha;
}

export interface KundaliReport {
  id: string;
  createdAt: string;
  userId: string;
  request: KundaliRequest;
  result: KundaliResponse;
}

export interface KundaliChartRouteResponse {
  reportId: string;
  createdAt: string;
  name: string;
  birthContext: BirthContext;
  selectedChart: DivisionalChartEntry;
  availableCharts: DivisionalChartEntry[];
}

export interface DashaRouteResponse {
  reportId: string;
  createdAt: string;
  name: string;
  birthContext: BirthContext;
  dasha: Dasha;
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}
