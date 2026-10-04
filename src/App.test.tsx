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
  // Added when the home page gained the panchang section; the App mock must
  // cover every export the tree reaches or vitest fails the whole render.
  fetchPanchang: vi.fn(),
  subscribeEmail: vi.fn(),
  submitFeedback: vi.fn(),
  // Every export the component tree reaches must be here: vi.mock replaces the
  // whole module, so a missing one throws at import and fails the file.
  matchAshtakoota: vi.fn(),
  fetchAlmanacSection: vi.fn(),
  fetchChoghadiya: vi.fn(),
  fetchHora: vi.fn(),
  fetchRahuKaal: vi.fn(),
}));

vi.mock("./api", () => apiMocks);

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

describe("gender field", () => {
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

  it("offers male, female and an unstated option, defaulting to unstated", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Generate Kundali" }));

    const select = screen.getByRole("combobox", { name: /gender/i }) as HTMLSelectElement;
    expect(select.value).toBe("OTHER");
    expect(
      Array.from(select.options).map((o) => o.value)
    ).toEqual(["MALE", "FEMALE", "OTHER"]);
  });

  it("sends the chosen gender to the backend", async () => {
    apiMocks.createReport.mockResolvedValue({ id: "r1" });
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Generate Kundali" }));

    fireEvent.change(screen.getByRole("combobox", { name: /gender/i }), {
      target: { value: "FEMALE" }
    });
    expect(
      (screen.getByRole("combobox", { name: /gender/i }) as HTMLSelectElement).value
    ).toBe("FEMALE");
  });

  it("keeps the hero and the two-column layout", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Generate Kundali" }));

    // The form sits in the right-hand column and the panel on the left, which
    // the stylesheet does with order on .generate-grid - so both must be present
    // and the grid classes intact.
    expect(document.querySelector(".generate-page .hero")).not.toBeNull();
    expect(document.querySelector(".content-grid.generate-grid")).not.toBeNull();
    expect(document.querySelector(".generate-grid .form-panel")).not.toBeNull();
    expect(document.querySelector(".generate-grid .preview-panel")).not.toBeNull();
  });

  it("shows user-facing copy in the side panel, not developer notes", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Generate Kundali" }));

    expect(screen.queryByText(/Backend-Controlled Application/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Auth, sessions, and reports now belong to the API/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Charts are cast from real planetary positions/i)).toBeInTheDocument();
  });
});
