import { useState } from "react";
import { FOOTER_GROUPS, SOCIAL_LINKS, type FooterLink } from "../siteContent";
import { submitFeedback, subscribeEmail } from "../api";

type SiteFooterProps = {
  /** Editable copy, supplied by the CMS with these as fallbacks. */
  description: string;
  copyright: string;
  version: string;
  onNavigate: (path: string) => void;
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hrefFor(link: FooterLink): string {
  return link.route ?? `/sections/${slugify(link.label)}`;
}

const SOCIAL_PATHS: Record<string, string> = {
  WhatsApp:
    "M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.7-4.9c-.4-.7-.9-1.6-.9-2.5 0-.9.5-1.4.7-1.6.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.4.5c-.1.1-.2.3-.1.5a7.6 7.6 0 0 0 3.5 3c.2.1.4.1.5-.1l.7-.8c.1-.2.3-.2.5-.1l1.7.8c.2.1.3.2.3.4s0 .7-.2 1Z",
  Facebook: "M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.3-.1-2.4-.1-2.3 0-3.9 1.4-3.9 4v2.4H7.7V14h2.7v8h3.1Z",
  LinkedIn:
    "M6.9 8.5H3.8V21h3.1V8.5ZM5.3 3a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM21 21h-3.1v-6.1c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.9 1.3-.1.2-.1.6-.1.9V21H11s.1-11.3 0-12.5h3.1v1.8c.4-.6 1.2-1.6 3-1.6 2.2 0 3.9 1.4 3.9 4.5V21Z",
  Instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4 1 .5.4.8.8 1 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-1 1.4-.4.5-.8.8-1.4 1-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-1-.5-.4-.8-.8-1-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 1-1.4.4-.5.8-.8 1.4-1 .4-.2 1-.3 2.2-.4 1.3-.1 1.7-.1 4.9-.1Zm0 3.2a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2Zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6Zm6.9-11.1a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  YouTube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"
};

function SocialIcon({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={SOCIAL_PATHS[label] ?? ""} />
    </svg>
  );
}

export function SiteFooter({ description, copyright, version, onNavigate }: SiteFooterProps) {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [subscribeNote, setSubscribeNote] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");

  const handleLink = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // Real hrefs so the links can be opened in a new tab or copied, with the
    // in-app router taking over on a plain click.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    onNavigate(path);
  };

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribeNote("");
    try {
      await subscribeEmail(email.trim());
      setEmail("");
      setSubscribeNote("Thanks - you are subscribed.");
    } catch (error) {
      setSubscribeNote(error instanceof Error ? error.message : "Could not subscribe.");
    }
  };

  const handleFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackNote("");
    try {
      await submitFeedback(feedback.trim());
      setFeedback("");
      setFeedbackNote("Thanks for the feedback.");
    } catch (error) {
      setFeedbackNote(error instanceof Error ? error.message : "Could not send feedback.");
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <p className="footer-logo">
              <span>Astro</span>Kundali
            </p>
            <p className="footer-description">{description}</p>
          </div>

          <div className="footer-apps">
            <h3>Download Our Android App</h3>
            <div className="footer-app-badges">
              {["Customer App", "Astrologer App"].map((name) => (
                <div key={name}>
                  <span className="footer-app-label">{name}</span>
                  <button
                    type="button"
                    className="footer-app-badge"
                    onClick={() => onNavigate(`/sections/${slugify(name)}`)}
                  >
                    <strong>GET IT ON</strong>
                    <span>Google Play</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-columns">
          {FOOTER_GROUPS.map((group) => (
            <nav className="footer-group" key={group.title} aria-label={group.title}>
              <h3>{group.title}</h3>
              <ul className={group.split ? "footer-links split" : "footer-links"}>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={hrefFor(link)} onClick={(event) => handleLink(event, hrefFor(link))}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="footer-group footer-forms">
            <h3>Subscribe &amp; Feedback</h3>

            <form onSubmit={handleSubscribe}>
              <label htmlFor="footer-email">Subscribe</label>
              <div className="footer-input-row">
                <input
                  id="footer-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <button type="submit" aria-label="Subscribe">
                  &#10148;
                </button>
              </div>
            </form>

            <form onSubmit={handleFeedback}>
              <label htmlFor="footer-feedback">Feedback</label>
              <div className="footer-input-row">
                <textarea
                  id="footer-feedback"
                  name="feedback"
                  rows={3}
                  placeholder="Enter Feedback"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  required
                />
                <button type="submit">Send</button>
              </div>
            </form>

            {(subscribeNote || feedbackNote) && (
              <p className="footer-note" role="status">
                {subscribeNote || feedbackNote}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bar">
        <p>
          {copyright} <span className="footer-version">Version: {version}</span>
        </p>
        <ul className="footer-social">
          {SOCIAL_LINKS.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.label}
              >
                <SocialIcon label={social.label} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default SiteFooter;
