import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MatchMakingPage, { MatchResultPanel } from "./MatchMakingPage";
import type { MatchResponse } from "../types";

const apiMocks = vi.hoisted(() => ({
  autocompletePlaces: vi.fn(),
  resolvePlace: vi.fn(),
  matchAshtakoota: vi.fn()
}));

vi.mock("../api", () => apiMocks);

const RESULT: MatchResponse = {
  boy: {
    name: "Ravi",
    gender: "MALE",
    birthDate: "1990-12-02",
    placeLabel: "Jabalpur",
    moonSignName: "Taurus",
    moonSignNumber: 2,
    nakshatraName: "Rohini",
    nakshatraNumber: 4,
    pada: 2,
    nakshatraLord: "Moon"
  },
  girl: {
    name: "Sita",
    gender: "FEMALE",
    birthDate: "1992-04-17",
    placeLabel: "Jabalpur",
    moonSignName: "Libra",
    moonSignNumber: 7,
    nakshatraName: "Chitra",
    nakshatraNumber: 14,
    pada: 3,
    nakshatraLord: "Mars"
  },
  kootas: [
    { key: "varna", name: "Varna", obtained: 0, maximum: 1, meaning: "Work and temperament" },
    { key: "vashya", name: "Vashya", obtained: 0.5, maximum: 2, meaning: "Mutual attraction" },
    { key: "tara", name: "Tara (Dina)", obtained: 0, maximum: 3, meaning: "Health and fortune" },
    { key: "yoni", name: "Yoni", obtained: 2, maximum: 4, meaning: "Intimate compatibility" },
    { key: "maitri", name: "Graha Maitri", obtained: 5, maximum: 5, meaning: "Friendship of lords" },
    { key: "gana", name: "Gana", obtained: 0, maximum: 6, meaning: "Temperament" },
    { key: "bhakoot", name: "Bhakoot", obtained: 0, maximum: 7, meaning: "Prosperity" },
    { key: "nadi", name: "Nadi", obtained: 8, maximum: 8, meaning: "Constitution and progeny" }
  ],
  totalObtained: 15.5,
  totalMaximum: 36,
  percentage: 43.1,
  verdict: "Below the conventional threshold of 18."
};

describe("MatchMakingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.matchAshtakoota.mockResolvedValue(RESULT);
  });

  it("shows a form for each partner with the gender preset", () => {
    render(<MatchMakingPage />);

    expect(screen.getByText("Groom")).toBeInTheDocument();
    expect(screen.getByText("Bride")).toBeInTheDocument();

    const genders = screen.getAllByRole("combobox", { name: /gender/i }) as HTMLSelectElement[];
    expect(genders).toHaveLength(2);
    expect(genders[0].value).toBe("MALE");
    expect(genders[1].value).toBe("FEMALE");
  });

  it("keeps matching disabled until both sides are complete", () => {
    render(<MatchMakingPage />);

    expect(screen.getByRole("button", { name: /match kundali/i })).toBeDisabled();
    expect(screen.getByText(/fill in name, date, time/i)).toBeInTheDocument();
  });

  it("uses the classical koota maxima and a consistent total", () => {
    // Guards the contract the table is built on: eight kootas, maxima 1..8
    // summing to 36, and a total that is the sum of the parts.
    expect(RESULT.kootas).toHaveLength(8);
    expect(RESULT.kootas.map((k) => k.maximum)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(RESULT.kootas.reduce((a, k) => a + k.maximum, 0)).toBe(36);
    expect(RESULT.kootas.reduce((a, k) => a + k.obtained, 0)).toBe(RESULT.totalObtained);
  });

  it("drops the hero box in favour of a compact page header", () => {
    render(<MatchMakingPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Kundali Milan" })).toBeInTheDocument();
    expect(document.querySelector(".hero")).toBeNull();
    expect(document.querySelector(".page-head")).not.toBeNull();
  });

  it("renders every koota as a row with its score and maximum", () => {
    render(<MatchResultPanel result={RESULT} />);
    const table = screen.getByRole("table");

    for (const koota of RESULT.kootas) {
      const row = within(table).getByText(koota.name).closest("tr") as HTMLElement;
      const cells = Array.from(row.querySelectorAll("td")).map((c) => c.textContent);
      expect(cells[1]).toBe(String(koota.obtained));
      expect(cells[2]).toBe(String(koota.maximum));
    }
    // Eight kootas plus the total row.
    expect(within(table).getAllByRole("row")).toHaveLength(10);
  });

  it("shows the headline total, percentage and both partners", () => {
    render(<MatchResultPanel result={RESULT} />);

    expect(screen.getByText("15.5 / 36 gunas matched")).toBeInTheDocument();
    expect(screen.getByText("43.1%")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText(/Rohini pada 2/)).toBeInTheDocument();
    expect(screen.getByText(/Chitra pada 3/)).toBeInTheDocument();
    expect(screen.getByText(RESULT.verdict)).toBeInTheDocument();
  });
});
