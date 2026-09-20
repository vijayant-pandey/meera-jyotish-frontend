import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";
import { ASTROLOGERS, SERVICE_CARDS } from "../siteContent";

// No fetch in jsdom, so the component falls back to the bundled content.

describe("HomePage services", () => {
  it("renders every service card in a scrollable track", () => {
    render(<HomePage onNavigate={vi.fn()} onShowComingSoon={vi.fn()} />);

    expect(SERVICE_CARDS).toHaveLength(8);
    for (const card of SERVICE_CARDS) {
      expect(screen.getAllByText(card.title).length).toBeGreaterThan(0);
    }
  });

  it("advances the services track on a four second timer", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <HomePage onNavigate={vi.fn()} onShowComingSoon={vi.fn()} />
      );
      const track = container.querySelector(".service-track") as HTMLElement;
      expect(track).not.toBeNull();

      const scrollTo = vi.fn();
      track.scrollTo = scrollTo as unknown as typeof track.scrollTo;
      Object.defineProperty(track, "scrollWidth", { value: 4000, configurable: true });
      Object.defineProperty(track, "clientWidth", { value: 1000, configurable: true });

      vi.advanceTimersByTime(4000);
      expect(scrollTo).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(4000);
      expect(scrollTo).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("steps the track with its own previous and next buttons", () => {
    const { container } = render(<HomePage onNavigate={vi.fn()} onShowComingSoon={vi.fn()} />);
    const track = container.querySelector(".service-track") as HTMLElement;
    const scrollTo = vi.fn();
    track.scrollTo = scrollTo as unknown as typeof track.scrollTo;
    Object.defineProperty(track, "scrollWidth", { value: 4000, configurable: true });
    Object.defineProperty(track, "clientWidth", { value: 1000, configurable: true });

    fireEvent.click(screen.getByRole("button", { name: "Next services" }));
    expect(scrollTo.mock.lastCall?.[0].left).toBeGreaterThan(0);

    // From the start, Previous wraps to the far end rather than dead-ending.
    fireEvent.click(screen.getByRole("button", { name: "Previous services" }));
    expect(scrollTo.mock.lastCall?.[0].left).toBe(4000);
  });

  it("counts the cards beside the buttons", () => {
    render(<HomePage onNavigate={vi.fn()} onShowComingSoon={vi.fn()} />);
    expect(screen.getByText(`1 / ${SERVICE_CARDS.length}`)).toBeInTheDocument();
  });
});

describe("HomePage astrologers", () => {
  it("shows three astrologers at a time out of six", () => {
    render(<HomePage onNavigate={vi.fn()} onShowComingSoon={vi.fn()} />);

    expect(ASTROLOGERS).toHaveLength(6);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    for (const a of ASTROLOGERS.slice(0, 3)) {
      expect(screen.getByText(a.name)).toBeInTheDocument();
    }
    for (const a of ASTROLOGERS.slice(3)) {
      expect(screen.queryByText(a.name)).not.toBeInTheDocument();
    }
  });

  it("steps forward and backward through the pages", () => {
    render(<HomePage onNavigate={vi.fn()} onShowComingSoon={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Next astrologers" }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText(ASTROLOGERS[3].name)).toBeInTheDocument();
    expect(screen.queryByText(ASTROLOGERS[0].name)).not.toBeInTheDocument();

    // Previous used to be wired to the same toggle as Next; it must go back.
    fireEvent.click(screen.getByRole("button", { name: "Previous astrologers" }));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    // And both wrap around rather than dead-ending.
    fireEvent.click(screen.getByRole("button", { name: "Previous astrologers" }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });
});
