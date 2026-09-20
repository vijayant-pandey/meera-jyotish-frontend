import type {
  DashaRouteResponse,
  LoginRequest,
  SignupRequest,
  KundaliChartRouteResponse,
  KundaliReport,
  KundaliRequest,
  KundaliResponse,
  DailyPanchang,
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
