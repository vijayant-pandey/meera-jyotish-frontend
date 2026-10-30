import type {
  DashaRouteResponse,
  LoginRequest,
  SignupRequest,
  KundaliChartRouteResponse,
  KundaliReport,
  KundaliRequest,
  KundaliResponse,
  DailyPanchang,
  AlmanacSection,
  ChoghadiyaDay,
  RahuKaal,
  EclipseKind,
  EclipseYear,
  SeasonDetail,
  SeasonEvent,
  LunarDayKind,
  LunarDayYear,
  TransitDivision,
  PlanetTransitYear,
  PlanetRetrogradeYear,
  PlanetCombustionYear,
  PlanetPositions,
  MatchResponse,
  PlaceSuggestion,
  ResolvedPlace,
  Source
} from "./types";
import type { AuthUser } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type ApiErrorDetail = {
  loc?: Array<string | number>;
  msg?: string;
};

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Request failed.";
  }

  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .filter((item): item is ApiErrorDetail => Boolean(item) && typeof item === "object")
      .map((item) => {
        const field = item.loc?.filter((part) => part !== "body").join(".");
        return field && item.msg ? `${field}: ${item.msg}` : item.msg;
      })
      .filter((message): message is string => Boolean(message));
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }
  return "Request failed.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: "Request failed." }));
    throw new Error(getErrorMessage(payload));
  }

  return (await response.json()) as T;
}

export function autocompletePlaces(query: string): Promise<PlaceSuggestion[]> {
  return request(`/api/places/autocomplete?q=${encodeURIComponent(query)}`);
}

export function resolvePlace(provider: Source, providerId: string): Promise<ResolvedPlace> {
  return request("/api/places/resolve", {
    method: "POST",
    body: JSON.stringify({ provider, providerId })
  });
}

export function generateKundali(payload: KundaliRequest): Promise<KundaliResponse> {
  return request("/api/kundali/generate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createReport(payload: KundaliRequest): Promise<KundaliReport> {
  return request("/api/reports", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getReport(reportId: string): Promise<KundaliReport> {
  return request(`/api/reports/${reportId}`);
}

export function getReportChart(reportId: string, chartKey: string): Promise<KundaliChartRouteResponse> {
  return request(`/api/reports/${reportId}/charts/${chartKey.toLowerCase()}`);
}

export function getReportDasha(reportId: string): Promise<DashaRouteResponse> {
  return request(`/api/reports/${reportId}/dasha`);
}

export function register(payload: SignupRequest): Promise<AuthUser> {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload: LoginRequest): Promise<AuthUser> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function logout(): Promise<{ status: string }> {
  return request("/api/auth/logout", {
    method: "POST"
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return request("/api/auth/me");
}

export function subscribeEmail(email: string): Promise<{ status: string }> {
  return request("/api/content/subscribe", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export function submitFeedback(message: string, email = ""): Promise<{ status: string }> {
  return request("/api/content/feedback", {
    method: "POST",
    body: JSON.stringify({ message, email })
  });
}

export function fetchPanchang(
  lat: number,
  lng: number,
  timezone: string,
  label: string
): Promise<DailyPanchang> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    tz: timezone,
    label
  });
  return request(`/api/panchang?${params.toString()}`);
}

export function matchAshtakoota(
  boy: KundaliRequest,
  girl: KundaliRequest
): Promise<MatchResponse> {
  return request("/api/match/ashtakoota", {
    method: "POST",
    body: JSON.stringify({ boy, girl })
  });
}

export function fetchAlmanacSection(
  section: string,
  place: { lat: number; lng: number; timezone: string; label: string },
  options: { on?: string; months?: number } = {}
): Promise<AlmanacSection> {
  const params = new URLSearchParams({
    lat: String(place.lat),
    lng: String(place.lng),
    tz: place.timezone,
    label: place.label
  });
  if (options.on) params.set("on", options.on);
  if (options.months) params.set("months", String(options.months));
  return request(`/api/almanac/${section}?${params.toString()}`);
}

export function fetchChoghadiya(
  place: { lat: number; lng: number; timezone: string; label: string },
  on?: string
): Promise<ChoghadiyaDay> {
  const params = new URLSearchParams({
    lat: String(place.lat),
    lng: String(place.lng),
    tz: place.timezone,
    label: place.label
  });
  if (on) params.set("on", on);
  return request(`/api/almanac/choghadiya-detail?${params.toString()}`);
}

export function fetchHora(
  place: { lat: number; lng: number; timezone: string; label: string },
  on?: string
): Promise<ChoghadiyaDay> {
  const params = new URLSearchParams({
    lat: String(place.lat),
    lng: String(place.lng),
    tz: place.timezone,
    label: place.label
  });
  if (on) params.set("on", on);
  return request(`/api/almanac/hora-detail?${params.toString()}`);
}

export function fetchRahuKaal(
  place: { lat: number; lng: number; timezone: string; label: string },
  on?: string
): Promise<RahuKaal> {
  const params = new URLSearchParams({
    lat: String(place.lat),
    lng: String(place.lng),
    tz: place.timezone,
    label: place.label
  });
  if (on) params.set("on", on);
  return request(`/api/almanac/rahu-kaal?${params.toString()}`);
}

export function fetchEclipseYear(
  kind: EclipseKind,
  place: { lat: number; lng: number; timezone: string; label: string },
  year?: number
): Promise<EclipseYear> {
  const params = new URLSearchParams({
    kind,
    lat: String(place.lat),
    lng: String(place.lng),
    tz: place.timezone,
    label: place.label
  });
  if (year) params.set("year", String(year));
  return request(`/api/almanac/eclipse-year?${params.toString()}`);
}

export function fetchSeason(
  event: SeasonEvent,
  place: { lat: number; lng: number; timezone: string; label: string },
  year?: number
): Promise<SeasonDetail> {
  const params = new URLSearchParams({
    event,
    lat: String(place.lat),
    lng: String(place.lng),
    tz: place.timezone,
    label: place.label
  });
  if (year) params.set("year", String(year));
  return request(`/api/almanac/season?${params.toString()}`);
}

type PlaceQuery = { lat: number; lng: number; timezone: string; label: string };

function yearQuery(params: Record<string, string>, year?: number): string {
  const search = new URLSearchParams(params);
  if (year) search.set("year", String(year));
  return search.toString();
}

export function fetchLunarDays(kind: LunarDayKind, place: PlaceQuery, year?: number): Promise<LunarDayYear> {
  return request(
    `/api/almanac/lunar-days?${yearQuery(
      { kind, lat: String(place.lat), lng: String(place.lng), tz: place.timezone },
      year
    )}`
  );
}

export function fetchPlanetTransits(
  planet: string,
  division: TransitDivision,
  place: PlaceQuery,
  year?: number
): Promise<PlanetTransitYear> {
  return request(`/api/almanac/planet-transits?${yearQuery({ planet, division, tz: place.timezone }, year)}`);
}

export function fetchPlanetRetrogrades(planet: string, place: PlaceQuery, year?: number): Promise<PlanetRetrogradeYear> {
  return request(`/api/almanac/planet-retrogrades?${yearQuery({ planet, tz: place.timezone }, year)}`);
}

export function fetchPlanetCombustions(planet: string, place: PlaceQuery, year?: number): Promise<PlanetCombustionYear> {
  return request(`/api/almanac/planet-combustions?${yearQuery({ planet, tz: place.timezone }, year)}`);
}

export function fetchPlanetPositions(
  place: PlaceQuery,
  options: { at?: string; ayanamsha?: string; trueNodes?: boolean; outer?: boolean }
): Promise<PlanetPositions> {
  const search = new URLSearchParams({
    lat: String(place.lat),
    lng: String(place.lng),
    tz: place.timezone
  });
  if (options.at) search.set("at", options.at);
  if (options.ayanamsha) search.set("ayanamsha", options.ayanamsha);
  if (options.trueNodes) search.set("trueNodes", "true");
  if (options.outer === false) search.set("outer", "false");
  return request(`/api/almanac/planet-positions?${search.toString()}`);
}
