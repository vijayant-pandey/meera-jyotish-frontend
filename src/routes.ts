import { FOOTER_SECTION_SLUGS, type SitePage } from "./siteContent";

export type AppRoute =
  | { name: "home" }
  | { name: "login" }
  | { name: "signup" }
  | { name: "generate" }
  | { name: "report-overview"; reportId: string }
  | { name: "report-chart"; reportId: string; chartKey: string }
  | { name: "report-dasha"; reportId: string }
  | { name: "admin" }
  | { name: "coming-soon"; slug: string }
  | { name: "not-found"; path: string };

export function normalizeChartKey(value: string): string {
  return value.trim().toUpperCase();
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Slugs that resolve to a real placeholder page. Anything else under /sections/
 * is a typo or a stale link and should 404 rather than silently render a page.
 */
const KNOWN_SECTION_SLUGS = new Set([
  "match-making",
  "horoscope",
  "astrology",
  "occult",
  "lal-kitab",
  "western-astrology",
  "more-1",
  "more-2",
  "more-3",
  "more-4",
  "more-5",
  "generate-kundali",
  "panchang",
  "astronomy",
  "muhurt",
  "others",
  "contact-us",
  "aries-horoscope",
  "taurus-horoscope",
  "gemini-horoscope",
  "cancer-horoscope",
  "leo-horoscope",
  "virgo-horoscope",
  "libra-horoscope",
  "scorpio-horoscope",
  "sagittarius-horoscope",
  "capricorn-horoscope",
  "aquarius-horoscope",
  "pisces-horoscope"
]);

export function isKnownSectionSlug(slug: string): boolean {
  return (
    KNOWN_SECTION_SLUGS.has(slug) ||
    // Footer links generate their own slugs; derive them rather than repeating
    // the list here, or adding a footer link would silently 404.
    FOOTER_SECTION_SLUGS.includes(slug) ||
    slug.startsWith("chat-with-") ||
    slug.startsWith("call-")
  );
}

export function buildPath(route: AppRoute): string {
  switch (route.name) {
    case "home":
      return "/";
    case "login":
      return "/login";
    case "signup":
      return "/signup";
    case "generate":
      return "/generate";
    case "admin":
      return "/admin";
    case "report-overview":
      return `/reports/${route.reportId}`;
    case "report-chart":
      return `/reports/${route.reportId}/charts/${normalizeChartKey(route.chartKey).toLowerCase()}`;
    case "report-dasha":
      return `/reports/${route.reportId}/dasha`;
    case "coming-soon":
      return `/sections/${route.slug}`;
    case "not-found":
      return route.path;
  }
}

export function parseRoute(pathname: string): AppRoute {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { name: "home" };
  }
  if (segments[0] === "login") {
    return { name: "login" };
  }
  if (segments[0] === "signup") {
    return { name: "signup" };
  }
  if (segments[0] === "generate") {
    return { name: "generate" };
  }
  if (segments[0] === "admin" && segments.length === 1) {
    return { name: "admin" };
  }
  if (segments[0] === "sections" && segments[1] && segments.length === 2) {
    return isKnownSectionSlug(segments[1])
      ? { name: "coming-soon", slug: segments[1] }
      : { name: "not-found", path: pathname };
  }
  if (segments[0] === "reports" && segments[1]) {
    if (segments.length === 2) {
      return { name: "report-overview", reportId: segments[1] };
    }
    if (segments[2] === "dasha") {
      return { name: "report-dasha", reportId: segments[1] };
    }
    if (segments[2] === "charts" && segments[3]) {
      return {
        name: "report-chart",
        reportId: segments[1],
        chartKey: normalizeChartKey(segments[3]),
      };
    }
  }

  // Unrecognised paths are a genuine 404, not a silent redirect to the homepage.
  return { name: "not-found", path: pathname };
}

export function routeToSitePage(route: AppRoute): SitePage {
  switch (route.name) {
    case "login":
      return "login";
    case "signup":
      return "signup";
    case "generate":
    case "report-overview":
    case "report-chart":
    case "report-dasha":
      return "generate";
    case "coming-soon":
    case "not-found":
      return "coming-soon";
    default:
      return "home";
  }
}

export function pageRoute(page: SitePage, title?: string): AppRoute {
  switch (page) {
    case "login":
      return { name: "login" };
    case "signup":
      return { name: "signup" };
    case "generate":
      return { name: "generate" };
    case "coming-soon":
      return { name: "coming-soon", slug: slugify(title ?? "coming soon") };
    default:
      return { name: "home" };
  }
}

export function isProtectedRoute(route: AppRoute): boolean {
  return (
    route.name === "generate" ||
    route.name === "report-overview" ||
    route.name === "report-chart" ||
    route.name === "report-dasha"
  );
}
