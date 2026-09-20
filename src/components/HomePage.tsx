import { useEffect, useRef, useState } from "react";
import {
  ASTROLOGERS,
  HERO_SLIDES,
  HOROSCOPE_SIGNS,
  SERVICE_CARDS,
  type SitePage
} from "../siteContent";

type HomePageProps = {
  onNavigate: (page: SitePage, title?: string) => void;
  onShowComingSoon: (title: string) => void;
};

function HomePage({ onNavigate, onShowComingSoon }: HomePageProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [astrologerPage, setAstrologerPage] = useState(0);
  const serviceTrackRef = useRef<HTMLDivElement>(null);
  const [servicesPaused, setServicesPaused] = useState(false);
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
  }, []);

  useEffect(() => {
    const track = serviceTrackRef.current;
    if (!track || servicesPaused) {
      return;
    }
    // Auto-advancing motion is disorienting for some readers, so honour the OS setting.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const serviceTimer = window.setInterval(() => {
      const card = track.firstElementChild as HTMLElement | null;
      if (!card) {
        return;
      }
      // Step by one card rather than a fixed pixel count, so the scroll stays
      // aligned however many cards the current width happens to show.
      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 16;
      const step = card.offsetWidth + gap;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step, behavior: "smooth" });
    }, 4000);

    return () => window.clearInterval(serviceTimer);
  }, [servicesPaused]);

  return (
    <main className="app-shell home-page">
      <section className="hero home-intro">
        <div>
          <p className="eyebrow">Kundali Generator</p>
          <h1>Generate a precise North India birth chart.</h1>
        </div>
        <p className="hero-copy">
          Global place detection, editable coordinates, 12-hour birth time input, and Swiss
          Ephemeris-backed kundali calculations.
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
        <div className="section-heading">
          <p className="eyebrow">Our Services</p>
          <h2>Explore astrology services</h2>
        </div>
        <div
          className="service-track"
          ref={serviceTrackRef}
          onMouseEnter={() => setServicesPaused(true)}
          onMouseLeave={() => setServicesPaused(false)}
          onFocusCapture={() => setServicesPaused(true)}
          onBlurCapture={() => setServicesPaused(false)}
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

      <section className="site-section astrologers-section">
        <div className="section-heading row-heading">
          <div>
            <p className="eyebrow">Our Astrologers</p>
            <h2>Meet our astrologers</h2>
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
                    <s>&#8377;{astrologer.pricePerMinute}/Min</s>
                    <em>Free</em>
                  </p>
                </div>
                <div className="astrologer-buttons">
                  <button
                    type="button"
                    className="chat-button"
                    onClick={() => onShowComingSoon(`Chat with ${astrologer.name}`)}
                  >
                    Free Chat
                  </button>
                  <button
                    type="button"
                    className="call-button"
                    onClick={() => onShowComingSoon(`Call ${astrologer.name}`)}
                  >
                    Free Call
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section horoscope-section">
        <div className="section-heading">
          <p className="eyebrow">Know Your Horoscope</p>
          <h2>Choose your zodiac sign</h2>
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
