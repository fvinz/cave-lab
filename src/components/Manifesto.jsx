import { useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
import useReveal from "../hooks/useReveal.js";
import { COMMUNITY, HERO, SOCIAL } from "../content.js";

/* Il manifesto di Cave Lab (video dal drone, "Mescoliamo idee…", formula).
   È la hero classica quando non ci sono eventi in primo piano (`asHero`),
   altrimenti diventa la prima sezione sotto la hero degli eventi. */
export default function Manifesto({ asHero = false }) {
  const scope = useReveal();
  const videoRef = useRef(null);
  const Title = asHero ? "h1" : "h2";

  /* Il video (3-4MB) non si scarica via autoplay/preload: parte solo via
     JS, e resta fermo sul poster per chi preferisce meno movimento o è su
     una connessione lenta/a consumo. Come sezione parte solo quando entra
     in vista e si ferma quando esce. */
  useEffect(() => {
    const video = videoRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = navigator.connection;
    const slowConnection = conn?.saveData || /2g/.test(conn?.effectiveType || "");
    if (!video || reducedMotion || slowConnection) return;

    if (asHero || !("IntersectionObserver" in window)) {
      video.play().catch(() => {});
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? video.play().catch(() => {}) : video.pause()),
      { threshold: 0.2 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [asHero]);

  return (
    <section
      className={asHero ? "hero" : "hero manifesto"}
      id={asHero ? undefined : "manifesto"}
      aria-label={asHero ? "Sezione di apertura" : "Il manifesto di Cave Lab"}
      ref={scope}
    >
      <video
        ref={videoRef}
        className="hero-video"
        poster="/video/hero-drone-poster.jpg"
        preload="none"
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src="/video/hero-drone.webm" type="video/webm" />
        <source src="/video/hero-drone.mp4" type="video/mp4" />
      </video>
      <div className="hero-scrim" aria-hidden="true"></div>

      <div className="container hero-inner">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow-tag">{HERO.tag}</span> · {HERO.tagline}
        </p>
        <Title className="hero-title" data-reveal>
          Mescoliamo idee, inneschiamo{" "}
          <span className="hero-title-highlight">reazioni</span> di comunità.
        </Title>
        <p className="hero-lead" data-reveal>{HERO.lead}</p>
        {/* Sotto la hero degli eventi gli stessi due pulsanti sono già nella
            carta dell'evento: qui resta solo la dichiarazione */}
        {asHero && (
          <div className="hero-actions" data-reveal>
            <a href={COMMUNITY.inviteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <Icon name="whatsapp" />
              Entra nella community
            </a>
            <a href={SOCIAL.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <Icon name="instagram" />
              Seguici su Instagram
            </a>
          </div>
        )}

        <p className="visually-hidden">
          La formula di Cave Lab: comunità più territorio più idee uguale Cave Lab.
        </p>
        <div className="hero-formula" data-reveal aria-hidden="true">
          {HERO.formula.map((term, i) => (
            <span key={term} style={{ display: "contents" }}>
              <span>{term}</span>
              {i < HERO.formula.length - 1 && <span className="formula-plus">+</span>}
            </span>
          ))}
          <span className="formula-eq">=</span>
          <span className="formula-result">{HERO.formulaResult}</span>
        </div>
      </div>
    </section>
  );
}
