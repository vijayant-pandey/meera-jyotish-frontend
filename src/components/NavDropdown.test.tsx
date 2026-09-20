import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SiteChrome from "./SiteChrome";
import type { NavItem } from "../siteContent";

const navItems: NavItem[] = [
  { label: "Home", page: "home" },
  { label: "Astronomy", page: "coming-soon", comingSoonTitle: "Astronomy" },
  { label: "Solar Eclipse", page: "coming-soon", comingSoonTitle: "Solar Eclipse", parentLabel: "Astronomy" },
  { label: "Lunar Eclipse", page: "coming-soon", comingSoonTitle: "Lunar Eclipse", parentLabel: "Astronomy" },
  { label: "Others", page: "coming-soon", comingSoonTitle: "Others" },
  { label: "FAQ", page: "coming-soon", comingSoonTitle: "FAQ", parentLabel: "Others" }
];

function renderNav(onNavigate = vi.fn()) {
  const { container } = render(
    <SiteChrome currentUser={null} page="home" onNavigate={onNavigate} onLogout={vi.fn()} navItems={navItems} />
  );
  return { container, onNavigate };
}

describe("nav dropdowns", () => {
  it("keeps sub-items out of the top-level bar", () => {
    const { container } = renderNav();
    const topLevel = container.querySelectorAll(".site-navbar > .nav-item > button");
    expect(Array.from(topLevel).map((b) => b.textContent?.replace("\u25BE", "").trim())).toEqual([
      "Home",
      "Astronomy",
      "Others"
    ]);
  });

  it("renders each parent's children in its own submenu", () => {
    const { container } = renderNav();
    const menus = container.querySelectorAll(".nav-submenu");
    expect(menus).toHaveLength(2);
    expect(Array.from(menus[0].querySelectorAll("button")).map((b) => b.textContent)).toEqual([
      "Solar Eclipse",
      "Lunar Eclipse"
    ]);
    expect(Array.from(menus[1].querySelectorAll("button")).map((b) => b.textContent)).toEqual(["FAQ"]);
  });

  it("marks parents that have a submenu", () => {
    const { container } = renderNav();
    const buttons = container.querySelectorAll(".site-navbar > .nav-item > button");
    expect(buttons[0].getAttribute("aria-haspopup")).toBeNull();
    expect(buttons[1].getAttribute("aria-haspopup")).toBe("true");
  });

  it("navigates using the child's own coming-soon title", () => {
    const onNavigate = vi.fn();
    renderNav(onNavigate);
    screen.getByText("Solar Eclipse").click();
    expect(onNavigate).toHaveBeenCalledWith("coming-soon", "Solar Eclipse");
  });
});
