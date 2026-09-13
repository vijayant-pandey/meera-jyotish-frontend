import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  resolvePlace: vi.fn(),
}));

vi.mock("./api", () => ({
  autocompletePlaces: apiMocks.autocompletePlaces,
  createReport: apiMocks.createReport,
  getCurrentUser: apiMocks.getCurrentUser,
  getReport: apiMocks.getReport,
  login: apiMocks.login,
  logout: apiMocks.logout,
  register: apiMocks.register,
  resolvePlace: apiMocks.resolvePlace,
}));

describe("App place autocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getCurrentUser.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      phone: "9999999999",
      createdAt: "2026-08-26T00:00:00Z"
    });
  });

  it("lets the user select a suggestion with keyboard arrows and enter", async () => {
    apiMocks.autocompletePlaces.mockResolvedValueOnce([
      {
        provider: "osm",
        providerId: "node:1",
        label: "Delhi, India",
        secondaryLabel: "India",
        precision: "city"
      },
      {
        provider: "osm",
        providerId: "node:2",
        label: "Delhi Cantonment, India",
        secondaryLabel: "India",
        precision: "city"
      }
    ]);
    apiMocks.resolvePlace.mockResolvedValueOnce({
      label: "Delhi, India",
      lat: 28.6139,
      lng: 77.209,
      timezone: "Asia/Kolkata",
      precision: "city",
      source: "osm"
    });

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: "Generate Kundali" }));

    const input = screen.getByPlaceholderText("Search city, town, state, or country");
    fireEvent.change(input, { target: { value: "Del" } });

    await screen.findByText("Delhi, India");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(apiMocks.resolvePlace).toHaveBeenCalledWith("osm", "node:2");
    });

    expect(await screen.findByText(/Resolved place:/)).toBeInTheDocument();
    expect(screen.getByText("Delhi, India")).toBeInTheDocument();
  });
});
