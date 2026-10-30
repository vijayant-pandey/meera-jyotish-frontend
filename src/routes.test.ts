import { describe, expect, it } from "vitest";
import { parseRoute } from "./routes";

describe("parseRoute 404 handling", () => {
  it("still resolves the real routes", () => {
    expect(parseRoute("/").name).toBe("home");
    expect(parseRoute("/login").name).toBe("login");
    expect(parseRoute("/generate").name).toBe("generate");
    expect(parseRoute("/reports/abc123").name).toBe("report-overview");
    expect(parseRoute("/reports/abc123/dasha").name).toBe("report-dasha");
    expect(parseRoute("/reports/abc123/charts/d9").name).toBe("report-chart");
    expect(parseRoute("/sections/aries-horoscope").name).toBe("coming-soon");
    expect(parseRoute("/sections/match-making").name).toBe("coming-soon");
  });

  it("404s an unknown path instead of silently showing the homepage", () => {
    for (const path of ["/egesgsg", "/admin-x", "/reports", "/sections", "/a/b/c"]) {
      const route = parseRoute(path);
      expect(route.name).toBe("not-found");
      if (route.name === "not-found") {
        expect(route.path).toBe(path);
      }
    }
  });

  it("404s an unknown section slug", () => {
    expect(parseRoute("/sections/not-a-real-section").name).toBe("not-found");
  });
});

describe("admin route", () => {
  it("resolves /admin and does not 404 it", () => {
    expect(parseRoute("/admin").name).toBe("admin");
  });

  it("404s anything nested under /admin", () => {
    expect(parseRoute("/admin/users").name).toBe("not-found");
  });
});

describe("footer links", () => {
  it("resolves every footer slug instead of 404ing it", async () => {
    const { FOOTER_SECTION_SLUGS } = await import("./siteContent");
    expect(FOOTER_SECTION_SLUGS.length).toBeGreaterThan(10);
    for (const slug of FOOTER_SECTION_SLUGS) {
      expect(parseRoute(`/sections/${slug}`).name).toBe("coming-soon");
    }
  });
});

describe("nav section slugs", () => {
  it("resolves the built-in nav slugs", () => {
    for (const slug of [
      "match-making", "horoscope", "astrology", "occult",
      "lal-kitab", "western-astrology", "astronomy", "muhurt", "panchang", "others"
    ]) {
      expect(parseRoute(`/sections/${slug}`).name).toBe("coming-soon");
    }
  });
});
