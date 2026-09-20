import { describe, expect, it } from "vitest";
import { NAV_ITEMS, SERVICE_CARDS, ASTROLOGERS, HERO_SLIDES } from "./siteContent";

// The hook itself needs a DOM + fetch, so these guard the contract it relies on:
// the bundled fallbacks must stay non-empty, or an API outage blanks the site.
describe("bundled fallback content", () => {
  it("is never empty", () => {
    expect(NAV_ITEMS.length).toBeGreaterThan(0);
    expect(SERVICE_CARDS.length).toBeGreaterThan(0);
    expect(ASTROLOGERS.length).toBeGreaterThan(0);
    expect(HERO_SLIDES.length).toBeGreaterThan(0);
  });
});
