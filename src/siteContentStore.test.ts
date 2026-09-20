import { afterEach, describe, expect, it, vi } from "vitest";

const EMPTY = {
  astrologers: [],
  services: [],
  heroSlides: [],
  navItems: [],
  texts: [],
  zodiacOverrides: [],
  festivals: [],
  planetaryEvents: [],
  rashifal: []
};

/** The store keeps its cache in module scope, so each test needs a clean one. */
async function freshStore(payloads: unknown[]) {
  vi.resetModules();
  let call = 0;
  const fetchMock = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(payloads[Math.min(call++, payloads.length - 1)])
    })
  );
  vi.stubGlobal("fetch", fetchMock);
  const store = await import("./siteContentStore");
  return { store, fetchMock };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("siteContentStore", () => {
  it("fetches once however many consumers subscribe", async () => {
    const { store, fetchMock } = await freshStore([EMPTY]);

    const first = store.subscribeToSiteContent(vi.fn());
    const second = store.subscribeToSiteContent(vi.fn());
    await store.refreshSiteContent();

    // Every page used to hold its own copy and request the payload separately.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    first();
    second();
  });

  it("wakes subscribers when the content has changed", async () => {
    const { store } = await freshStore([
      { ...EMPTY, texts: [{ key: "home.hero.heading", value: "Before" }] },
      { ...EMPTY, texts: [{ key: "home.hero.heading", value: "After" }] }
    ]);
    const listener = vi.fn();
    const stop = store.subscribeToSiteContent(listener);

    await store.refreshSiteContent();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSiteContent()?.texts[0].value).toBe("Before");

    await store.refreshSiteContent();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.getSiteContent()?.texts[0].value).toBe("After");
    stop();
  });

  it("stays quiet when a poll brings back the same content", async () => {
    const { store } = await freshStore([EMPTY]);
    const listener = vi.fn();
    const stop = store.subscribeToSiteContent(listener);

    await store.refreshSiteContent();
    await store.refreshSiteContent();
    await store.refreshSiteContent();

    // Otherwise the whole site would re-render every few seconds for nothing.
    expect(listener).toHaveBeenCalledTimes(1);
    stop();
  });

  it("keeps the cached content when the API fails", async () => {
    const { store } = await freshStore([EMPTY]);
    const stop = store.subscribeToSiteContent(vi.fn());
    await store.refreshSiteContent();
    const cached = store.getSiteContent();

    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    await store.refreshSiteContent();

    // A CMS outage must not blank a page that is already rendering.
    expect(store.getSiteContent()).toBe(cached);
    stop();
  });
});
