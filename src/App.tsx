import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  autocompletePlaces,
  createReport,
  getCurrentUser,
  getReport,
  login,
  logout,
  register,
  resolvePlace
} from "./api";
import type { AuthUser } from "./auth";
import AuthPage, { type LoginFormState, type SignupFormState } from "./components/AuthPage";
import ComingSoonPage from "./components/ComingSoonPage";
import HomePage from "./components/HomePage";
import NotFoundPage from "./components/NotFoundPage";
import AdminApp from "./admin/AdminApp";
import ResultsPanel from "./components/ResultsPanel";
import SiteChrome from "./components/SiteChrome";
import SiteFooter from "./components/SiteFooter";
import ZodiacPage from "./components/ZodiacPage";
import {
  buildPath,
  humanizeSlug,
  isProtectedRoute,
  normalizeChartKey,
  pageRoute,
  parseRoute,
  routeToSitePage,
  slugify,
  type AppRoute
} from "./routes";
import type { SitePage } from "./siteContent";
import { findZodiacSign, withZodiacOverride, ZODIAC_SIGNS } from "./zodiac";
import { useSiteContent } from "./useSiteContent";
import type {
  Ayanamsha,
  KundaliReport,
  Meridiem,
  PlaceSuggestion,
  Precision,
  ResolvedPlace,
  Source
} from "./types";
import { canGenerateFromPlace, effectivePrecision, isValidTime12h } from "./utils";

type FormState = {
  name: string;
  birthDate: string;
  birthTime12h: string;
  meridiem: Meridiem;
  ayanamsha: Ayanamsha;
};

const INITIAL_FORM: FormState = {
  name: "",
  birthDate: "",
  birthTime12h: "",
  meridiem: "AM",
  ayanamsha: "LAHIRI"
};

function App() {
  const siteContent = useSiteContent();
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));
  const [pendingRoute, setPendingRoute] = useState<AppRoute | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [authNotice, setAuthNotice] = useState("");
  const [authError, setAuthError] = useState("");
  const [loginForm, setLoginForm] = useState<LoginFormState>({ identifier: "", password: "" });
  const [signupForm, setSignupForm] = useState<SignupFormState>({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedPlace, setSelectedPlace] = useState<ResolvedPlace | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [timezone, setTimezone] = useState("");
  const [manuallyEditedPlace, setManuallyEditedPlace] = useState(false);
  const [error, setError] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [resolvingPlace, setResolvingPlace] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<KundaliReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const debounceRef = useRef<number | null>(null);
  const searchRequestRef = useRef(0);
  const suppressNextSearchRef = useRef(false);
  const placeSearchRef = useRef<HTMLDivElement | null>(null);
  const placeInputRef = useRef<HTMLInputElement | null>(null);
  const listboxIdRef = useRef(`place-suggestions-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    void getCurrentUser()
      .then((user) => {
        if (!cancelled) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCurrentUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAuthResolved(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }
    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setHighlightedIndex(-1);
      setLoadingSuggestions(false);
      setIsSuggestionsOpen(false);
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      const requestId = ++searchRequestRef.current;
      try {
        setLoadingSuggestions(true);
        const nextSuggestions = await autocompletePlaces(trimmedQuery);
        if (requestId !== searchRequestRef.current) {
          return;
        }
        setSuggestions(nextSuggestions);
        setHighlightedIndex(nextSuggestions.length > 0 ? 0 : -1);
        if (document.activeElement === placeInputRef.current) {
          setIsSuggestionsOpen(true);
        }
      } catch (nextError) {
        if (requestId !== searchRequestRef.current) {
          return;
        }
        setSuggestions([]);
        setHighlightedIndex(-1);
        setError(nextError instanceof Error ? nextError.message : "Could not search places.");
      } finally {
        if (requestId === searchRequestRef.current) {
          setLoadingSuggestions(false);
        }
      }
    }, 350);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!placeSearchRef.current?.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!authResolved || currentUser || !isProtectedRoute(route)) {
      return;
    }
    setPendingRoute(route);
    setAuthNotice("Please login first to continue.");
    navigate({ name: "login" }, true);
  }, [authResolved, currentUser, route]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    if (
      route.name !== "report-overview" &&
      route.name !== "report-chart" &&
      route.name !== "report-dasha"
    ) {
      return;
    }
    if (report?.id === route.reportId) {
      return;
    }

    let cancelled = false;
    setReportLoading(true);
    setReportError("");

    void getReport(route.reportId)
      .then((nextReport) => {
        if (!cancelled) {
          setReport(nextReport);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setReport(null);
          setReportError(nextError instanceof Error ? nextError.message : "Could not load report.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReportLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser, report?.id, route]);

  useEffect(() => {
    if (route.name !== "report-chart" || !report || report.id !== route.reportId) {
      return;
    }

    const selectedChart = report.result.divisionalCharts.find(
      (chart) => chart.key === normalizeChartKey(route.chartKey)
    );
    if (!selectedChart) {
      navigate(
        {
          name: "report-chart",
          reportId: route.reportId,
          chartKey: report.result.divisionalCharts[0]?.key ?? "D1"
        },
        true
      );
    }
  }, [report, route]);

  function navigate(nextRoute: AppRoute, replace = false) {
    const nextPath = buildPath(nextRoute);
    if (window.location.pathname !== nextPath) {
      window.history[replace ? "replaceState" : "pushState"]({}, "", nextPath);
    }
    setRoute(nextRoute);
  }

  const goToPage = (nextPage: SitePage, title?: string) => {
    setAuthError("");
    if (nextPage !== "login" && nextPage !== "signup") {
      setAuthNotice("");
    }

    const nextRoute = pageRoute(nextPage, title);
    if (nextPage === "generate" && !currentUser) {
      setPendingRoute(nextRoute);
      setAuthNotice("Please login first to generate your kundali.");
      navigate({ name: "login" });
      return;
    }
    navigate(nextRoute);
  };

  const showComingSoon = (title: string) => {
    setAuthNotice("");
    navigate({ name: "coming-soon", slug: slugify(title) });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore logout transport errors and clear UI state anyway.
    }
    setCurrentUser(null);
    setAuthNotice("");
    setAuthError("");
    setPendingRoute(null);
    setReport(null);
    navigate({ name: "home" });
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    try {
      const user = await register({
        name: signupForm.name.trim(),
        email: signupForm.email.trim().toLowerCase(),
        phone: signupForm.phone.trim(),
        password: signupForm.password
      });
      setCurrentUser(user);
      setSignupForm({ name: "", email: "", phone: "", password: "" });
      setPendingRoute(null);
      navigate({ name: "generate" });
    } catch (nextError) {
      setAuthError(nextError instanceof Error ? nextError.message : "Could not register.");
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    try {
      const user = await login({
        identifier: loginForm.identifier.trim(),
        password: loginForm.password
      });
      setCurrentUser(user);
      setLoginForm({ identifier: "", password: "" });
      const nextRoute = pendingRoute ?? { name: "generate" as const };
      setPendingRoute(null);
      navigate(nextRoute);
    } catch (nextError) {
      setAuthError(nextError instanceof Error ? nextError.message : "Could not login.");
    }
  };

  const handlePlaceSelect = async (suggestion: PlaceSuggestion) => {
    try {
      setResolvingPlace(true);
      setError("");
      const resolved = await resolvePlace(suggestion.provider, suggestion.providerId);
      setSelectedPlace(resolved);
      suppressNextSearchRef.current = true;
      setQuery(resolved.label);
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setHighlightedIndex(-1);
      setLat(resolved.lat.toString());
      setLng(resolved.lng.toString());
      setTimezone(resolved.timezone);
      setManuallyEditedPlace(false);
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : "Could not resolve place.");
    } finally {
      setResolvingPlace(false);
    }
  };

  const handlePlaceInputKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      if (suggestions.length > 0) {
        event.preventDefault();
        setIsSuggestionsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }
    if (!isSuggestionsOpen) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex((current) => (current + 1) % suggestions.length);
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      }
      return;
    }
    if (event.key === "Enter") {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        event.preventDefault();
        await handlePlaceSelect(suggestions[highlightedIndex]);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setIsSuggestionsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setReportError("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.birthDate) {
      setError("Birth date is required.");
      return;
    }
    if (!isValidTime12h(form.birthTime12h)) {
      setError("Birth time must be in HH:MM 12-hour format.");
      return;
    }
    if (!selectedPlace) {
      setError("Please select a birthplace suggestion first.");
      return;
    }

    const nextLat = Number(lat);
    const nextLng = Number(lng);
    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng) || !timezone.trim()) {
      setError("Latitude, longitude, and timezone must all be filled.");
      return;
    }

    const derivedPlace: ResolvedPlace = {
      ...selectedPlace,
      lat: nextLat,
      lng: nextLng,
      timezone: timezone.trim(),
      precision: effectivePrecision(selectedPlace.precision as Precision, manuallyEditedPlace),
      source: manuallyEditedPlace ? ("manual" as Source) : selectedPlace.source
    };

    if (derivedPlace.precision === "country" && !manuallyEditedPlace) {
      setError("Country-level results need a city-level selection or manual coordinates.");
      return;
    }

    try {
      setGenerating(true);
      const createdReport = await createReport({
        name: form.name.trim(),
        birthDate: form.birthDate,
        birthTime12h: form.birthTime12h,
        meridiem: form.meridiem,
        ayanamsha: form.ayanamsha,
        place: derivedPlace
      });
      setReport(createdReport);
      navigate({ name: "report-chart", reportId: createdReport.id, chartKey: "D1" });
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Could not generate kundali.");
    } finally {
      setGenerating(false);
    }
  };

  const showSuggestions =
    isSuggestionsOpen && query.trim().length >= 2 && (loadingSuggestions || suggestions.length > 0);
  const activeSuggestionId =
    highlightedIndex >= 0 ? `${listboxIdRef.current}-option-${highlightedIndex}` : undefined;
  const placeReady = canGenerateFromPlace(selectedPlace);
  const activeChartKey = route.name === "report-chart" ? normalizeChartKey(route.chartKey) : "D1";

  const openReportOverview = () => {
    if (report) {
      navigate({ name: "report-overview", reportId: report.id });
    }
  };

  const openReportChart = (chartKey: string) => {
    if (report) {
      navigate({ name: "report-chart", reportId: report.id, chartKey: normalizeChartKey(chartKey) });
    }
  };

  const openReportDasha = () => {
    if (report) {
      navigate({ name: "report-dasha", reportId: report.id });
    }
  };

  const renderGeneratePage = () => (
    <div className="app-shell">
      <div className="hero">
        <div>
          <p className="eyebrow">Kundali Generator</p>
          <h1>Generate a precise North India birth chart.</h1>
        </div>
        <p className="hero-copy">
          Global place detection, editable coordinates, 12-hour birth time input, and Swiss
          Ephemeris-backed kundali calculations.
        </p>
      </div>

      <main className="content-grid generate-grid">
        <section className="panel form-panel">
          <div className="panel-header">
            <p className="eyebrow">Birth Details</p>
            <h2>Create Kundali</h2>
          </div>

          <form className="kundali-form" onSubmit={handleGenerate}>
            <label>
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Enter full name"
              />
            </label>

            <div className="place-search" ref={placeSearchRef}>
              <label htmlFor="birth-place-input">
                <span>Place of Birth</span>
              </label>
              <input
                id="birth-place-input"
                ref={placeInputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedPlace(null);
                  setReport(null);
                  setIsSuggestionsOpen(true);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => {
                  if (query.trim().length >= 2) {
                    setIsSuggestionsOpen(true);
                    setHighlightedIndex(suggestions.length > 0 ? 0 : -1);
                  }
                }}
                onKeyDown={handlePlaceInputKeyDown}
                placeholder="Search city, town, state, or country"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
                aria-controls={listboxIdRef.current}
                aria-activedescendant={activeSuggestionId}
              />
              {showSuggestions && (
                <div className="suggestions" role="listbox" id={listboxIdRef.current}>
                  {loadingSuggestions && <div className="suggestion-item muted">Searching places...</div>}
                  {!loadingSuggestions &&
                    suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.provider}-${suggestion.providerId}`}
                        id={`${listboxIdRef.current}-option-${index}`}
                        className={`suggestion-item${index === highlightedIndex ? " active" : ""}`}
                        type="button"
                        role="option"
                        aria-selected={index === highlightedIndex}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          void handlePlaceSelect(suggestion);
                        }}
                      >
                        <strong>{suggestion.label}</strong>
                        <span>
                          {suggestion.precision.toUpperCase()}
                          {suggestion.secondaryLabel ? ` - ${suggestion.secondaryLabel}` : ""}
                        </span>
                      </button>
                    ))}
                  {!loadingSuggestions && suggestions.length === 0 && (
                    <div className="suggestion-item muted">No matching places found.</div>
                  )}
                </div>
              )}
            </div>

            <div className="two-col">
              <label>
                <span>Date of Birth</span>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, birthDate: event.target.value }))
                  }
                />
              </label>

              <label>
                <span>Time of Birth</span>
                <div className="time-row">
                  <input
                    value={form.birthTime12h}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        birthTime12h: event.target.value
                      }))
                    }
                    placeholder="07:35"
                  />
                  <select
                    value={form.meridiem}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        meridiem: event.target.value as Meridiem
                      }))
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </label>
            </div>

            <label>
              <span>Ayanamsha</span>
              <select
                value={form.ayanamsha}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    ayanamsha: event.target.value as Ayanamsha
                  }))
                }
              >
                <option value="LAHIRI">Lahiri</option>
                <option value="RAMAN">Raman</option>
                <option value="KP">KP</option>
              </select>
            </label>

            <div className="manual-grid">
              <label>
                <span>Latitude</span>
                <input
                  value={lat}
                  onChange={(event) => {
                    setLat(event.target.value);
                    setManuallyEditedPlace(true);
                  }}
                  placeholder="28.6139"
                  disabled={!selectedPlace && !resolvingPlace}
                />
              </label>
              <label>
                <span>Longitude</span>
                <input
                  value={lng}
                  onChange={(event) => {
                    setLng(event.target.value);
                    setManuallyEditedPlace(true);
                  }}
                  placeholder="77.2090"
                  disabled={!selectedPlace && !resolvingPlace}
                />
              </label>
              <label className="full-span">
                <span>Timezone</span>
                <input
                  value={timezone}
                  onChange={(event) => {
                    setTimezone(event.target.value);
                    setManuallyEditedPlace(true);
                  }}
                  placeholder="Asia/Kolkata"
                  disabled={!selectedPlace && !resolvingPlace}
                />
              </label>
            </div>

            {selectedPlace && (
              <div className="place-summary">
                <strong>Resolved place:</strong> {selectedPlace.label}
                <span>
                  Precision: {manuallyEditedPlace ? "MANUAL" : selectedPlace.precision.toUpperCase()}
                </span>
              </div>
            )}

            {error && <div className="error-banner">{error}</div>}

            <button
              type="submit"
              className="primary-button"
              disabled={generating || resolvingPlace || !placeReady}
            >
              {generating ? "Generating..." : "Generate"}
            </button>
          </form>
        </section>

        <section className="preview-panel">
          <div className="placeholder panel">
            <p className="eyebrow">Backend-Controlled Application</p>
            <h2>Auth, sessions, and reports now belong to the API.</h2>
            <p>
              Protected report URLs are backed by the database and the current backend session, not
              browser-managed users.
            </p>
          </div>
        </section>
      </main>
    </div>
  );

  const renderAuthPage = (mode: "login" | "signup") => (
    <AuthPage
      mode={mode}
      notice={authNotice}
      error={authError}
      loginForm={loginForm}
      signupForm={signupForm}
      onLoginSubmit={handleLogin}
      onSignupSubmit={handleRegister}
      onLoginFormChange={setLoginForm}
      onSignupFormChange={setSignupForm}
      onNavigate={goToPage}
    />
  );

  const renderReportPage = () => {
    const heading =
      route.name === "report-dasha"
        ? "Saved Dasha Route"
        : route.name === "report-chart"
          ? `Saved ${activeChartKey} Route`
          : "Saved Report Overview";

    return (
      <div className="app-shell">
        <div className="hero">
          <div>
            <p className="eyebrow">Persistent Report URL</p>
            <h1>{heading}</h1>
          </div>
          <p className="hero-copy">
            This page is backed by a stored report resource owned by the logged-in backend user.
          </p>
        </div>

        {reportLoading && (
          <section className="panel">
            <p className="eyebrow">Loading</p>
            <h2>Loading report...</h2>
          </section>
        )}

        {!reportLoading && reportError && (
          <section className="panel">
            <p className="eyebrow">Report Error</p>
            <h2>Could not load report</h2>
            <p>{reportError}</p>
          </section>
        )}

        {!reportLoading && !reportError && report && (
          <ResultsPanel
            report={report}
            view={
              route.name === "report-dasha"
                ? "dasha"
                : route.name === "report-chart"
                  ? "chart"
                  : "overview"
            }
            activeChartKey={activeChartKey}
            onChartSelect={openReportChart}
            onOpenOverview={openReportOverview}
            onOpenDasha={openReportDasha}
          />
        )}
      </div>
    );
  };

  if (!authResolved) {
    return (
      <div className="site-shell">
        <SiteChrome
          currentUser={null}
          page={routeToSitePage(route)}
          onNavigate={goToPage}
          onLogout={() => {}}
          navItems={siteContent.navItems}
        />
        <main className="app-shell">
          <section className="panel">
            <p className="eyebrow">Loading Session</p>
            <h1>Checking your account...</h1>
          </section>
        </main>
      </div>
    );
  }

  const renderCurrentPage = () => {
    if (route.name === "home") {
      return <HomePage onNavigate={goToPage} onShowComingSoon={showComingSoon} />;
    }
    if (route.name === "login") {
      return renderAuthPage("login");
    }
    if (route.name === "signup") {
      return renderAuthPage("signup");
    }
    if (route.name === "generate") {
      return currentUser ? renderGeneratePage() : renderAuthPage("login");
    }
    if (
      route.name === "report-overview" ||
      route.name === "report-chart" ||
      route.name === "report-dasha"
    ) {
      return currentUser ? renderReportPage() : renderAuthPage("login");
    }
    if (route.name === "admin") {
      // Handled by the early return above, which renders the panel without site
      // chrome. This branch exists so the union narrows for the cases below.
      return null;
    }
    if (route.name === "not-found") {
      // A nav item added in the admin panel produces a /sections/ slug the static
      // router cannot know about, so check the live nav list before calling it a
      // 404. Without this, every nav item added through the CMS would 404.
      const sectionSlug = route.path.startsWith("/sections/")
        ? route.path.slice("/sections/".length)
        : "";
      const matchesNavItem =
        sectionSlug !== "" &&
        siteContent.navItems.some(
          (item) => slugify(item.comingSoonTitle ?? item.label) === sectionSlug
        );
      if (matchesNavItem) {
        return <ComingSoonPage title={humanizeSlug(sectionSlug)} />;
      }
      return <NotFoundPage path={route.path} onGoHome={() => navigate({ name: "home" })} />;
    }
    // The homepage links each rashi to /sections/<sign>-horoscope, so a zodiac
    // slug resolves to the reference page and anything else stays a placeholder.
    const zodiacSign = findZodiacSign(route.slug);
    if (zodiacSign) {
      return (
        <ZodiacPage
          sign={withZodiacOverride(zodiacSign, siteContent.zodiacOverride(zodiacSign.slug))}
          allSigns={ZODIAC_SIGNS}
          onSelectSign={(slug) => navigate({ name: "coming-soon", slug: `${slug}-horoscope` })}
        />
      );
    }
    return <ComingSoonPage title={humanizeSlug(route.slug)} />;
  };

  // The admin panel is its own surface - no site chrome, no public session.
  if (route.name === "admin") {
    return <AdminApp onExit={() => navigate({ name: "home" })} />;
  }

  return (
    <div className="site-shell">
      <SiteChrome
        currentUser={currentUser}
        navItems={siteContent.navItems}
        page={routeToSitePage(route)}
        onNavigate={goToPage}
        onLogout={() => {
          void handleLogout();
        }}
      />
      {renderCurrentPage()}
      <SiteFooter
        description={siteContent.text(
          "footer.description",
          "We illuminate the pathways of your life through the celestial wisdom of astrology. Our astrologers combine classical Vedic knowledge with modern insight to give you readings you can act on."
        )}
        copyright={siteContent.text(
          "footer.copyright",
          `Copyright © ${new Date().getFullYear()}, All Rights Reserved.`
        )}
        version={siteContent.text("footer.version", "1.0.0")}
        onNavigate={(path) => navigate(parseRoute(path))}
      />
    </div>
  );
}

export default App;
