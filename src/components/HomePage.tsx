import { useEffect, useState } from "react";
import {
  ASTROLOGER_CARDS,
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
  const visibleAstrologers = ASTROLOGER_CARDS.slice(astrologerPage * 5, astrologerPage * 5 + 5);

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => window.clearInterval(slideTimer);
  }, []);

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
            onClick={() => setActiveSlide((current) => (current + 1) % HERO_SLIDES.length)}
          >
            Next
          </button>
        </div>
      </section>

      <section className="site-section">
        <div className="section-heading">
          <p className="eyebrow">Our Services</p>
          <h2>Explore astrology services</h2>
        </div>
        <div className="service-grid">
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

      <section className="site-section">
        <div className="section-heading row-heading">
          <div>
            <p className="eyebrow">Our Astrologers</p>
            <h2>Meet our astrologers</h2>
          </div>
          <div className="slider-buttons">
            <button
              type="button"
              onClick={() => setAstrologerPage((current) => (current === 0 ? 1 : 0))}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setAstrologerPage((current) => (current === 0 ? 1 : 0))}
            >
              Next
            </button>
          </div>
        </div>
        <div className="astrologer-grid">
          {visibleAstrologers.map((card) => (
            <article className="site-card compact-card" key={card.title}>
              <img src={card.image} className="card-img-top" alt={card.title} />
              <div className="card-body">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-text">{card.text}</p>
                <button className="card-button" type="button" onClick={() => onShowComingSoon(card.title)}>
                  {card.actionLabel}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section">
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
