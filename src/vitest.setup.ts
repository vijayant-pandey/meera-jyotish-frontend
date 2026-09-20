import "@testing-library/jest-dom/vitest";

// jsdom implements neither of these, and components legitimately use both:
// matchMedia for prefers-reduced-motion, scrollTo for the services carousel.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false
  })) as unknown as typeof window.matchMedia;
}

if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
