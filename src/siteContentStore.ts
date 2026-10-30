import type { ApiSiteContent } from "./useSiteContent";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
/** How often to re-check while the tab is in the foreground. */
const POLL_MS = 10_000;

type Listener = () => void;

/**
 * One shared copy of the CMS content for the whole app.
 *
 * Each component used to hold its own copy and fetch it once on mount, which
 * meant two things: the same payload was requested several times over, and an
 * edit made in the admin panel only appeared after a browser reload. Here the
 * fetch happens once, every consumer reads the same object, and it is
 * revalidated on focus, on tab switch, on a timer, and on demand after an
 * admin save.
 */
let cache: ApiSiteContent | null = null;
let fingerprint = "";
let inFlight: Promise<void> | null = null;
let poll: number | null = null;
const listeners = new Set<Listener>();

/** Fetches the content. Callers that arrive mid-flight join the same request. */
export function refreshSiteContent(): Promise<void> {
  if (inFlight) {
    return inFlight;
  }
  if (typeof fetch !== "function") {
    return Promise.resolve();
  }
  inFlight = fetch(`${API_BASE}/api/content`, { credentials: "include" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data) {
        return;
      }
      // Only wake the subscribers when something actually changed, so the poll
      // does not re-render the whole site every few seconds for nothing.
      const next = JSON.stringify(data);
      if (next === fingerprint) {
        return;
      }
      fingerprint = next;
      cache = data as ApiSiteContent;
      for (const listener of listeners) {
        listener();
      }
    })
    .catch(() => {
      // Keep whatever is cached; a CMS outage should not blank the site.
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** Stable identity, as useSyncExternalStore requires of its snapshot getter. */
export function getSiteContent(): ApiSiteContent | null {
  return cache;
}

function revalidate() {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return;
  }
  void refreshSiteContent();
}

function startWatching() {
  if (typeof window === "undefined") {
    return;
  }
  window.addEventListener("focus", revalidate);
  document.addEventListener("visibilitychange", revalidate);
  poll = window.setInterval(revalidate, POLL_MS);
}

function stopWatching() {
  if (typeof window === "undefined") {
    return;
  }
  window.removeEventListener("focus", revalidate);
  document.removeEventListener("visibilitychange", revalidate);
  if (poll !== null) {
    window.clearInterval(poll);
    poll = null;
  }
}

/** Also stable: passing a fresh function would resubscribe on every render. */
export function subscribeToSiteContent(listener: Listener): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    startWatching();
    void refreshSiteContent();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopWatching();
    }
  };
}
