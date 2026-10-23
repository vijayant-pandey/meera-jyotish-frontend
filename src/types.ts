export type Precision = "city" | "admin" | "country" | "manual";
export type Source = "google" | "osm" | "manual";
export type Ayanamsha = "LAHIRI" | "RAMAN" | "KP";
export type Meridiem = "AM" | "PM";
export type Gender = "MALE" | "FEMALE" | "OTHER";

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
  gender: Gender;
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
  combust?: boolean;
  sanskritName?: string;
  /** How the graha regards the lord of the sign it occupies. */
  relation?: string | null;
  /** Exalted / Debilitated / Mooltrikona / Own Sign. Separate from relation. */
  dignity?: string;
  /** KP sub lord. */
  subLord?: string;
  signLord?: string;
  housesRuled?: number[];
}

export interface AscendantPosition {
  longitude: number;
  signNumber: number;
  signName: string;
  degreeInSign: number;
  nakshatra: NakshatraInfo;
  subLord?: string;
  signLord?: string;
  housesRuled?: number[];
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

/** The only part of a reading that depends on the native’s gender. */
export interface GenderContext {
  gender: Gender;
  /** Kalatra karaka: Venus for a male chart, Jupiter for a female one. */
  spouseKaraka: string;
  spouseKarakaSanskrit: string;
  note: string;
}

export interface KundaliResponse {
  birthContext: BirthContext;
  genderContext?: GenderContext | null;
  ascendant?: AscendantPosition | null;
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

export interface PanchangInterval {
  name: string;
  endsAt: string;
  number: number;
  extra: string;
}

export interface PanchangSegment {
  name: string;
  startsAt: string;
  endsAt: string;
  number: number;
  extra: string;
}

/** Sunrise-to-sunrise bands, the data behind the panchang chart. */
export interface PanchangTimeline {
  sunrise: string;
  sunset: string;
  nextSunrise: string;
  vara: string;
  tithi: PanchangSegment[];
  nakshatra: PanchangSegment[];
  yoga: PanchangSegment[];
  karana: PanchangSegment[];
  choghadiya: PanchangSegment[];
}

export interface PanchangGraha {
  name: string;
  sanskrit: string;
  sign: string;
  longitude: number;
  degreeInSign: number;
  motion: string;
  visibility: string;
}

export interface DailyPanchang {
  location: string;
  timezone: string;
  moment: string;
  day: string;
  weekday: string;
  sunrise: string;
  sunset: string;
  dayLength: string;
  vara: string;
  paksha: string;
  tithi: PanchangInterval;
  nakshatra: PanchangInterval;
  yoga: PanchangInterval;
  karanas: PanchangInterval[];
  moonsign: string;
  sunsign: string;
  amantaMonth: string;
  purnimantaMonth: string;
  shakaSamvat: string;
  vikramSamvat: string;
  gujaratiSamvat: string;
  pravishte: number;
  ghati: number;
  pal: number;
  vipal: number;
  timeline: PanchangTimeline;
  grahas: PanchangGraha[];
}

export interface FestivalEntry {
  name: string;
  occursOn: string;
  imageUrl: string;
  note: string;
}

export interface PlanetaryEventEntry {
  title: string;
  occursAt: string;
  note: string;
}

export interface RashifalEntry {
  sign: string;
  text: string;
  imageUrl: string;
}

export interface MatchPartner {
  name: string;
  gender: Gender;
  birthDate: string;
  placeLabel: string;
  moonSignName: string;
  moonSignNumber: number;
  nakshatraName: string;
  nakshatraNumber: number;
  pada: number;
  nakshatraLord: string;
}

export interface KootaScore {
  key: string;
  name: string;
  obtained: number;
  maximum: number;
  meaning: string;
}

export interface MatchResponse {
  boy: MatchPartner;
  girl: MatchPartner;
  kootas: KootaScore[];
  totalObtained: number;
  totalMaximum: number;
  percentage: number;
  verdict: string;
}

export interface AlmanacColumn {
  key: string;
  label: string;
}

/** Every almanac section shares this shape, so one table renders all of them. */
export interface AlmanacSection {
  section: string;
  title: string;
  subtitle: string;
  location: string;
  columns: AlmanacColumn[];
  rows: Record<string, string>[];
  note: string;
}

export interface ChoghadiyaSlot {
  name: string;
  quality: string;
  tone: string;
  start: string;
  end: string;
  startLabel: string;
  endLabel: string;
  rahuKala: boolean;
}

export interface ChoghadiyaDay {
  location: string;
  timezone: string;
  date: string;
  weekday: string;
  dateLabel: string;
  sunrise: string;
  sunset: string;
  nextSunrise: string;
  sunriseLabel: string;
  sunsetLabel: string;
  rahuKalaStart: string;
  rahuKalaEnd: string;
  day: ChoghadiyaSlot[];
  night: ChoghadiyaSlot[];
  note: string;
}

export interface RahuWheelSlice {
  period: number;
  weekday: string;
}

export interface RahuKaal {
  location: string;
  timezone: string;
  date: string;
  weekday: string;
  dateLabel: string;
  sunrise: string;
  sunset: string;
  sunriseLabel: string;
  sunsetLabel: string;
  start: string;
  end: string;
  startLabel: string;
  endLabel: string;
  durationLabel: string;
  period: number;
  weekdayWheel: RahuWheelSlice[];
  note: string;
}

export type EclipseKind = "solar" | "lunar";

export interface EclipseContact {
  label: string;
  time: string;
  /** Whether the Sun or Moon is above the horizon at this contact. */
  visible: boolean | null;
}

export interface EclipseSutak {
  begins: string;
  ends: string;
  kidsBegins: string;
  kidsEnds: string;
}

export interface Eclipse {
  kind: EclipseKind;
  globalType: string;
  localType: string | null;
  title: string;
  date: string;
  weekday: string;
  globalMaximum: string;
  globalBegins: string | null;
  globalEnds: string | null;
  visible: boolean;
  visibility: string;
  contacts: EclipseContact[];
  durations: { label: string; value: string }[];
  magnitudes: { label: string; value: string }[];
  horizonEvents: { event: "rise" | "set"; time: string }[];
  sutak: EclipseSutak | null;
}

export interface EclipseYear {
  kind: EclipseKind;
  year: number;
  location: string;
  timezone: string;
  eclipses: Eclipse[];
  upcoming: string | null;
  previous: string | null;
  next: string | null;
  note: string;
}

export type SeasonEvent = "vernal-equinox" | "summer-solstice" | "autumnal-equinox" | "winter-solstice";

export interface SeasonDetail {
  event: SeasonEvent;
  title: string;
  alias: string;
  year: number;
  location: string;
  timezone: string;
  moment: string;
  date: string;
  weekday: string;
  sunrise: string;
  sunset: string;
  dayDuration: string;
  previousDayDuration: string;
  nextDayDuration: string;
  nightDuration: string;
  seasons: { event: SeasonEvent; title: string; moment: string }[];
  note: string;
}

export type LunarDayKind = "purnima" | "amavasya";

export interface LunarDayEntry {
  date: string;
  weekday: string;
  names: string[];
  paksha: string;
  begins: string;
  ends: string;
}

export interface LunarDayYear {
  kind: LunarDayKind;
  year: number;
  timezone: string;
  entries: LunarDayEntry[];
  next: { name: string; date: string } | null;
  note: string;
}

export type TransitDivision = "rashi" | "nakshatra" | "pada";

export interface PlanetTransitYear {
  planet: string;
  english: string;
  sanskrit: string;
  division: TransitDivision;
  year: number;
  timezone: string;
  startsIn: string;
  current: string | null;
  entries: { name: string; time: string; retrograde: boolean }[];
}

export interface PlanetRetrogradeYear {
  planet: string;
  english: string;
  sanskrit: string;
  year: number;
  timezone: string;
  periods: { retrograde: string; direct: string; retrogradeAt: string; directAt: string; days: number }[];
  totalDays: number;
}

export interface PlanetCombustionYear {
  planet: string;
  english: string;
  sanskrit: string;
  year: number;
  timezone: string;
  orb: number;
  orbRetrograde: number | null;
  periods: { starts: string; ends: string; startsAt: string; endsAt: string; retrograde: boolean; days: number }[];
  totalDays: number;
}

export interface PlanetPositionRow {
  name: string;
  english: string;
  kind: "lagna" | "graha" | "node-alt";
  longitude: string;
  sign: string;
  fullDegree: number;
  nakshatra: string;
  pada: number;
  nakshatraLord: string;
  subLord: string;
  latitude: string;
  speed: number;
  rightAscension: number;
  declination: number;
  retrograde: boolean;
  combust: boolean;
  motion: string;
  dignity: string;
  relation: string;
}

export interface PlanetPositions {
  moment: string;
  timezone: string;
  ayanamsha: "lahiri" | "raman" | "kp" | "tropical";
  ayanamshaValue: string;
  trueNodes: boolean;
  ascendantSign: number;
  rows: PlanetPositionRow[];
}
