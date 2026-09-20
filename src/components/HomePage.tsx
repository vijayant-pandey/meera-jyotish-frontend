import { useCallback, useEffect, useRef, useState } from "react";
import { HOROSCOPE_SIGNS, type SitePage } from "../siteContent";
import { useSiteContent } from "../useSiteContent";
import PanchangSection from "./PanchangSection";

type HomePageProps = {
  onNavigate: (page: SitePage, title?: string) => void;
  onShowComingSoon: (title: string) => void;
};

function HomePage({ onNavigate, onShowComingSoon }: HomePageProps) {
  const content = useSiteContent();
  const HERO_SLIDES = content.heroSlides;
  const SERVICE_CARDS = content.services;
  const ASTROLOGERS = content.astrologers;
  const [activeSlide, setActiveSlide] = useState(0);
  const [astrologerPage, setAstrologerPage] = useState(0);
  const serviceTrackRef = useRef<HTMLDivElement>(null);
  const [servicesPaused, setServicesPaused] = useState(false);
  const [serviceAt, setServiceAt] = useState(0);
  const ASTROLOGERS_PER_PAGE = 3;
  const astrologerPageCount = Math.ceil(ASTROLOGERS.length / ASTROLOGERS_PER_PAGE);
  const visibleAstrologers = ASTROLOGERS.slice(
    astrologerPage * ASTROLOGERS_PER_PAGE,
    astrologerPage * ASTROLOGERS_PER_PAGE + ASTROLOGERS_PER_PAGE
  );

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => window.clearInterval(slideTimer);
  }, [HERO_SLIDES.length]);

  useEffect(() => {
    // An admin can delete slides or astrologers while the page is open; clamp the
    // indexes so we never read past the end of a shorter list.
    setActiveSlide((current) => (current >= HERO_SLIDES.length ? 0 : current));
    setAstrologerPage((current) =>
      current * 3 >= ASTROLOGERS.length ? 0 : current
    );
    setServiceAt((current) => (current >= SERVICE_CARDS.length ? 0 : current));
  }, [HERO_SLIDES.length, ASTROLOGERS.length, SERVICE_CARDS.length]);

  /** Width of one card plus the gap, measured now rather than assumed, so the
   *  track stays aligned however many cards the current width shows. */
  const serviceStep = (track: HTMLDivElement): number => {
    const card = track.firstElementChild as HTMLElement | null;
    if (!card) {
      return 0;
    }
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 16;
    return card.offsetWidth + gap;
  };

  // Previous, Next and the timer all move the track the same way.
  const stepServices = useCallback((direction: 1 | -1) => {
    const track = serviceTrackRef.current;
    if (!track) {
      return;
    }
    const step = serviceStep(track);
    if (step === 0) {
      return;
    }
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const atStart = track.scrollLeft <= 4;
    // Both directions wrap rather than dead-ending. Asking to scroll past the
    // end is clamped by the browser, which lands it on the last card.
    let left: number;
    if (direction === 1) {
      left = atEnd ? 0 : track.scrollLeft + step;
    } else {
      left = atStart ? track.scrollWidth : track.scrollLeft - step;
    }
    track.scrollTo({ left, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (servicesPaused) {
      return;
    }
    // Auto-advancing motion is disorienting for some readers, so honour the OS setting.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const serviceTimer = window.setInterval(() => stepServices(1), 4000);
    return () => window.clearInterval(serviceTimer);
  }, [servicesPaused, stepServices]);

  return (
    <main className="app-shell home-page">
      <section className="hero home-intro">
        <div>
          <p className="eyebrow">{content.text("home.hero.eyebrow", "Kundali Generator")}</p>
          <h1>{content.text("home.hero.heading", "Generate a precise North India birth chart.")}</h1>
        </div>
        <p className="hero-copy">
          {content.text(
            "home.hero.copy",
            "Global place detection, editable coordinates, 12-hour birth time input, and Swiss Ephemeris-backed kundali calculations."
          )}
        </p>
      </section>

      <section className="carousel-section" aria-label="Featured astrology services">
        <div className="carousel-stage">
          <img src={HERO_SLIDES[activeSlide].image} alt={HERO_SLIDES[activeSlide].title} />
          <div className="carousel-caption">
            <p className="eyebrow">Featured</p>
            <h2>{HERO_SLIDES[activeSlide].title}</h2>
            <p>{HERO_SLIDES[activeSlide].text}</p>
          </div>
        </div>
        <div className="carousel-controls">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() =>
              setActiveSlide((current) => (current === 0 ? HERO_SLIDES.length - 1 : current - 1))
            }
          >
            Previous
          </button>
          <div className="carousel-dots" aria-label="Carousel slides">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={index === activeSlide ? "active" : ""}
                aria-label={`Show ${slide.title}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setActiveSlide((current) => (current + 1) % HERO_SLIDES.length)}
          >
            Next
          </button>
        </div>
      </section>

      <section className="site-section services-section">
        <div className="section-heading row-heading">
          <div>
            <p className="eyebrow">{content.text("home.services.eyebrow", "Our Services")}</p>
            <h2>{content.text("home.services.heading", "Explore astrology services")}</h2>
          </div>
          {/* The buttons sit outside the track, so they need their own hover
              pause - otherwise the timer fights whoever is clicking them. */}
          <div
            className="slider-buttons"
            onMouseEnter={() => setServicesPaused(true)}
            onMouseLeave={() => setServicesPaused(false)}
          >
            <button type="button" aria-label="Previous services" onClick={() => stepServices(-1)}>
              Previous
            </button>
            <span className="slider-count">
              {Math.min(serviceAt + 1, SERVICE_CARDS.length)} / {SERVICE_CARDS.length}
            </span>
            <button type="button" aria-label="Next services" onClick={() => stepServices(1)}>
              Next
            </button>
          </div>
        </div>
        <div
          className="service-track"
          ref={serviceTrackRef}
          onMouseEnter={() => setServicesPaused(true)}
          onMouseLeave={() => setServicesPaused(false)}
          onFocusCapture={() => setServicesPaused(true)}
          onBlurCapture={() => setServicesPaused(false)}
          onScroll={(event) => {
            const track = event.currentTarget;
            const step = serviceStep(track);
            setServiceAt(step > 0 ? Math.round(track.scrollLeft / step) : 0);
          }}
        >
          {SERVICE_CARDS.map((card) => (
            <article className="site-card" key={card.title}>
              <img src={card.image} className="card-img-top" alt={card.title} />
              <div className="card-body">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-text">{card.text}</p>
                <button
                  className="card-button"
                  type="button"
                  onClick={() =>
                    card.title === "Generate Kundali"
                      ? onNavigate("generate")
                      : onShowComingSoon(card.title)
                  }
                >
                  {card.actionLabel ?? "Coming Soon"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PanchangSection />

      <section className="site-section astrologers-section">
        <div className="section-heading row-heading">
          <div>
            <p className="eyebrow">{content.text("home.astrologers.eyebrow", "Our Astrologers")}</p>
            <h2>{content.text("home.astrologers.heading", "Meet our astrologers")}</h2>
          </div>
          <div className="slider-buttons">
            {/* Previous and Next used to run identical logic, so both simply toggled
                between the only two pages. They now step in opposite directions and
                wrap around however many pages the list produces. */}
            <button
              type="button"
              aria-label="Previous astrologers"
              onClick={() =>
                setAstrologerPage(
                  (current) => (current - 1 + astrologerPageCount) % astrologerPageCount
                )
              }
            >
              Previous
            </button>
            <span className="slider-count">
              {astrologerPage + 1} / {astrologerPageCount}
            </span>
            <button
              type="button"
              aria-label="Next astrologers"
              onClick={() => setAstrologerPage((current) => (current + 1) % astrologerPageCount)}
            >
              Next
            </button>
          </div>
        </div>
        <div className="astrologer-grid">
          {visibleAstrologers.map((astrologer) => (
            <article className="astrologer-card" key={astrologer.name}>
              {astrologer.trending && <span className="astrologer-ribbon">Trending</span>}
              <div className="astrologer-top">
                <img src={astrologer.avatar} alt="" aria-hidden="true" />
                <div className="astrologer-id">
                  <h3>
                    {astrologer.name}
                    <span
                      className={astrologer.online ? "status-dot online" : "status-dot"}
                      title={astrologer.online ? "Online now" : "Offline"}
                    />
                    <span className="visually-hidden">
                      {astrologer.online ? "Online now" : "Offline"}
                    </span>
                  </h3>
                  <p className="astrologer-langs">{astrologer.languages.join(", ")}</p>
                  <ul className="astrologer-skills">
                    {astrologer.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="astrologer-stats">
                <div>
                  <strong>&#9733; ({astrologer.rating.toFixed(1)})</strong>
                  <span>Star Rating</span>
                </div>
                <div>
                  <strong>{astrologer.experienceYears} years</strong>
                  <span>Experience</span>
                </div>
                <div>
                  <strong>{astrologer.orders.toLocaleString("en-IN")}</strong>
                  <span>Orders</span>
                </div>
              </div>

              <div className="astrologer-actions">
                <div className="astrologer-rates">
                  <p>
                    {astrologer.isFree === false ? (
                      <strong>&#8377;{astrologer.pricePerMinute}/Min</strong>
                    ) : (
                      <>
                        <s>&#8377;{astrologer.pricePerMinute}/Min</s>
                        <em>Free</em>
                      </>
                    )}
                  </p>
                </div>
                <div className="astrologer-buttons">
                  {astrologer.chatEnabled !== false && (
                    <button
                      type="button"
                      className="chat-button"
                      onClick={() => onShowComingSoon(`Chat with ${astrologer.name}`)}
                    >
                      {astrologer.isFree === false ? "Chat" : "Free Chat"}
                    </button>
                  )}
                  {astrologer.callEnabled !== false && (
                    <button
                      type="button"
                      className="call-button"
                      onClick={() => onShowComingSoon(`Call ${astrologer.name}`)}
                    >
                      {astrologer.isFree === false ? "Call" : "Free Call"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section horoscope-section">
        <div className="section-heading">
          <p className="eyebrow">{content.text("home.horoscope.eyebrow", "Know Your Horoscope")}</p>
          <h2>{content.text("home.horoscope.heading", "Choose your zodiac sign")}</h2>
        </div>
        <div className="horoscope-grid">
          {HOROSCOPE_SIGNS.map((sign) => (
            <button
              className="horoscope-card"
              key={sign.title}
              type="button"
              onClick={() => onShowComingSoon(`${sign.title} Horoscope`)}
            >
              <img src={sign.image} alt={sign.title} />
              <span>{sign.title}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
