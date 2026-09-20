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
  const childrenOf = (label: string) =>
    items.filter((item) => item.parentLabel === label);
  return (
    <>
      <header className="site-topbar">
        <button className="brand-button" type="button" onClick={() => onNavigate("home")}>
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
              <button type="button" className="ghost-button" onClick={() => onNavigate("login")}>
                Login
              </button>
              <button type="button" className="topbar-primary" onClick={() => onNavigate("signup")}>
                Signup
              </button>
            </>
          )}
        </div>
      </header>

      <nav className="site-navbar" aria-label="Primary navigation">
        {topLevel.map((item) => {
          const children = childrenOf(item.label);
          const isActive = page === item.page && item.page !== "coming-soon";
          return (
            <div className="nav-item" key={item.label}>
              <button
                type="button"
                className={isActive ? "active" : ""}
                aria-haspopup={children.length > 0 || undefined}
                onClick={() => onNavigate(item.page, item.comingSoonTitle)}
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
                        onClick={() => onNavigate(child.page, child.comingSoonTitle || child.label)}
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
