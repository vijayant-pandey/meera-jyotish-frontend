import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const apiMocks = vi.hoisted(() => ({
  autocompletePlaces: vi.fn(),
  createReport: vi.fn(),
  getCurrentUser: vi.fn(),
  getReport: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  resolvePlace: vi.fn()
}));

vi.mock("./api", () => apiMocks);

describe("/sections/<sign>-horoscope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getCurrentUser.mockRejectedValue(new Error("no session"));
  });

  it("renders the Aries reference page, not the placeholder", async () => {
    window.history.pushState({}, "", "/sections/aries-horoscope");
    render(<App />);

    expect(await screen.findByText(/Personality and temperament/)).toBeInTheDocument();
    expect(screen.getByText(/\(Mesha\)/)).toBeInTheDocument();
    expect(screen.getByText("Ruling planet (Swami)")).toBeInTheDocument();
    expect(screen.getByText("Mars")).toBeInTheDocument();
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });

  it("still shows the placeholder for a non-zodiac section", async () => {
    window.history.pushState({}, "", "/sections/match-making");
    render(<App />);

    expect(await screen.findByText("Coming soon")).toBeInTheDocument();
  });
});
