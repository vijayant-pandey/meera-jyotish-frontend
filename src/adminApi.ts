import { refreshSiteContent } from "./siteContentStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export type AdminUser = {
  id: string;
  username: string;
  name: string;
  lastLoginAt?: string | null;
};

export type ContentKind =
  | "astrologers"
  | "services"
  | "hero-slides"
  | "nav-items"
  | "texts"
  | "zodiac"
  | "subscribers"
  | "feedback"
  | "festivals"
  | "planetary-events"
  | "rashifal";

/** Every content row carries these; the rest varies by kind. */
export type ContentRow = {
  id: string;
  position: number;
  published: boolean;
  updatedAt: string;
  [key: string]: unknown;
};

export type MediaUploadResult = {
  url: string;
  filename: string;
  contentType: string;
  bytes: number;
};

function messageFrom(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      const parts = detail
        .map((item) => {
          const entry = item as { loc?: Array<string | number>; msg?: string };
          const field = entry.loc?.filter((p) => p !== "body").join(".");
          return field && entry.msg ? `${field}: ${entry.msg}` : entry.msg;
        })
        .filter(Boolean);
      if (parts.length > 0) {
        return parts.join(" ");
      }
    }
  }
  return "Request failed.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    // Spread init first, then set the pieces that must not be overridden.
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(messageFrom(await response.json().catch(() => null)));
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export function adminLogin(username: string, password: string): Promise<AdminUser> {
  return request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export function adminLogout(): Promise<{ status: string }> {
  return request("/api/admin/logout", { method: "POST" });
}

export function adminMe(): Promise<AdminUser> {
  return request("/api/admin/me");
}

export function listContent(kind: ContentKind): Promise<ContentRow[]> {
  return request(`/api/admin/content/${kind}`);
}

/** Pushes a save through to the public pages, which share one content store.
 *  Without this the site would keep its copy until the next poll or reload. */
async function andPublish<T>(pending: Promise<T>): Promise<T> {
  const result = await pending;
  await refreshSiteContent();
  return result;
}

export function createContent(kind: ContentKind, body: unknown): Promise<ContentRow> {
  return andPublish(
    request(`/api/admin/content/${kind}`, { method: "POST", body: JSON.stringify(body) })
  );
}

export function updateContent(kind: ContentKind, id: string, body: unknown): Promise<ContentRow> {
  return andPublish(
    request(`/api/admin/content/${kind}/${id}`, { method: "PUT", body: JSON.stringify(body) })
  );
}

export function deleteContent(kind: ContentKind, id: string): Promise<void> {
  return andPublish(request(`/api/admin/content/${kind}/${id}`, { method: "DELETE" }));
}

export function reorderContent(kind: ContentKind, ids: string[]): Promise<{ status: string }> {
  return andPublish(
    request(`/api/admin/content/${kind}/reorder`, {
      method: "POST",
      body: JSON.stringify({ ids })
    })
  );
}

/** Multipart upload - the browser must set its own boundary, so no Content-Type here. */
export async function uploadMedia(file: File): Promise<MediaUploadResult> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_BASE}/api/admin/media`, {
    method: "POST",
    credentials: "include",
    body
  });
  if (!response.ok) {
    throw new Error(messageFrom(await response.json().catch(() => null)));
  }
  return (await response.json()) as MediaUploadResult;
}
