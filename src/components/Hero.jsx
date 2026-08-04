import { useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
import useReveal from "../hooks/useReveal.js";
import { HERO, SOCIAL } from "../content.js";

export default function Hero() {
  const scope = useReveal();
  const videoRef = useRef(null);

  /* Niente autoplay per chi preferisce meno movimento: il video resta
     fermo sul poster (già un frame rappresentativo). */
  useEffect(() => {
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mm.matches) videoRef.current?.pause();
  }, []);

  return (
    <section className="hero" aria-label="Sezione di apertura" ref={scope}>
      <video
        ref={videoRef}
        className="hero-video"
        poster="/video/hero-drone-poster.jpg"
        autoPlay
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
        <h1 className="hero-title" data-reveal>
          Mescoliamo idee, inneschiamo{" "}
          <span className="hero-title-highlight">reazioni</span> di comunità.
        </h1>
        <p className="hero-lead" data-reveal>{HERO.lead}</p>
        <div className="hero-actions" data-reveal>
          <a href="#contatti" className="btn btn-primary">
            Unisciti all'esperimento
            <Icon name="arrowRight" />
          </a>
          <a href={SOCIAL.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <Icon name="instagram" />
            Seguici su Instagram
          </a>
        </div>

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

      <a href="#chi-siamo" className="scroll-cue" aria-label="Scorri per saperne di più">
        <span className="scroll-cue-tube" aria-hidden="true"></span>
      </a>
    </section>
  );
}
