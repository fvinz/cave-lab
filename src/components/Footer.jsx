import Icon from "./Icon.jsx";
import { NAV_LINKS, SOCIAL } from "../content.js";

export default function Footer() {
  const scrollTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-tile brand-tile-footer" aria-hidden="true">
            <img src="/logo.svg" alt="" width="80" height="47" />
          </span>
          <p className="footer-tagline">
            Cave Lab APS — associazione di promozione del territorio di Cave (RM).
          </p>
        </div>

        <nav className="footer-nav" aria-label="Link del sito">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
          <a href="#contatti">Contatti</a>
        </nav>

        <div className="footer-social">
          <a
            href={SOCIAL.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cave Lab su Instagram"
            className="social-icon"
          >
            <Icon name="instagram" className="" />
          </a>
          <a
            href={`https://wa.me/${SOCIAL.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Scrivi a Cave Lab su WhatsApp"
            className="social-icon"
          >
            <Icon name="whatsapp" className="" />
          </a>
          <a href={`mailto:${SOCIAL.email}`} aria-label="Scrivi a Cave Lab via email" className="social-icon">
            <Icon name="mail" className="" />
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Cave Lab. Fatto con curiosità (e qualche provetta) a Cave.</p>
        <button className="back-to-top" aria-label="Torna in cima alla pagina" onClick={scrollTop}>
          <Icon name="arrowUp" className="" />
        </button>
      </div>
    </footer>
  );
}
