import { useState } from "react";
import type { AuthUser } from "../auth";
import { NAV_ITEMS, type NavItem, type SitePage } from "../siteContent";

type SiteChromeProps = {
  currentUser: AuthUser | null;
  page: SitePage;
  onNavigate: (page: SitePage, title?: string) => void;
  onLogout: () => void;
  /** Supplied by the CMS; falls back to the bundled list when absent. */
  navItems?: NavItem[];
};

function SiteChrome({ currentUser, page, onNavigate, onLogout, navItems }: SiteChromeProps) {
  const items = navItems && navItems.length > 0 ? navItems : NAV_ITEMS;
  // A blank parentLabel means top level; anything else hangs under that item.
  const topLevel = items.filter((item) => !item.parentLabel);
  const childrenOf = (label: string) => items.filter((item) => item.parentLabel === label);

  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const go = (nextPage: SitePage, title?: string) => {
    setMenuOpen(false);
    setExpanded(null);
    onNavigate(nextPage, title);
  };

  return (
    <>
      <header className="site-topbar">
        <button className="brand-button" type="button" onClick={() => go("home")}>
          Meera Astrology
        </button>
        <div className="topbar-actions">
          {currentUser ? (
            <>
              <span>Welcome, {currentUser.name}</span>
              <button type="button" className="ghost-button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button type="button" className="ghost-button" onClick={() => go("login")}>
                Login
              </button>
              <button type="button" className="topbar-primary" onClick={() => go("signup")}>
                Signup
              </button>
            </>
          )}
        </div>
      </header>

      {/* Shown only below the nav breakpoint; CSS keeps it hidden on desktop. */}
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="nav-toggle-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        Menu
      </button>

      <nav
        id="site-nav"
        className={menuOpen ? "site-navbar open" : "site-navbar"}
        aria-label="Primary navigation"
      >
        {topLevel.map((item) => {
          const children = childrenOf(item.label);
          const isActive = page === item.page && item.page !== "coming-soon";
          const isExpanded = expanded === item.label;
          return (
            <div
              className={isExpanded ? "nav-item open" : "nav-item"}
              key={item.label}
            >
              <button
                type="button"
                className={isActive ? "active" : ""}
                aria-haspopup={children.length > 0 || undefined}
                aria-expanded={children.length > 0 ? isExpanded : undefined}
                onClick={() => {
                  // A parent toggles its own submenu instead of navigating.
                  // Without this the submenu is unreachable on touch devices,
                  // where there is no hover and the tap navigates away.
                  if (children.length > 0) {
                    setExpanded((current) => (current === item.label ? null : item.label));
                    return;
                  }
                  go(item.page, item.comingSoonTitle);
                }}
              >
                {item.label}
                {children.length > 0 && (
                  <span className="nav-caret" aria-hidden="true">
                    &#9662;
                  </span>
                )}
              </button>

              {children.length > 0 && (
                <ul className="nav-submenu">
                  {children.map((child) => (
                    <li key={child.label}>
                      <button
                        type="button"
                        onClick={() => go(child.page, child.comingSoonTitle || child.label)}
                      >
                        {child.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export default SiteChrome;
