import type { AuthUser } from "../auth";
import { NAV_ITEMS, type SitePage } from "../siteContent";

type SiteChromeProps = {
  currentUser: AuthUser | null;
  page: SitePage;
  onNavigate: (page: SitePage, title?: string) => void;
  onLogout: () => void;
};

function SiteChrome({ currentUser, page, onNavigate, onLogout }: SiteChromeProps) {
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
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={page === item.page && item.page !== "coming-soon" ? "active" : ""}
            onClick={() => onNavigate(item.page, item.comingSoonTitle)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}

export default SiteChrome;
