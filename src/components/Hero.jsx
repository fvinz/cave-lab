import Icon from "./Icon.jsx";
import useReveal from "../hooks/useReveal.js";
import { HERO, SOCIAL } from "../content.js";

export default function Hero() {
  const scope = useReveal();

  return (
    <section className="hero" aria-label="Sezione di apertura" ref={scope}>
      <div className="hero-bg" aria-hidden="true">
        <span className="bubble bubble-1"></span>
        <span className="bubble bubble-2"></span>
        <span className="bubble bubble-3"></span>
        <span className="bubble bubble-4"></span>
        <span className="bubble bubble-5"></span>
        <svg className="molecule molecule-a" viewBox="0 0 200 200" aria-hidden="true">
          <line x1="40" y1="40" x2="100" y2="100" stroke="currentColor" strokeWidth="4" />
          <line x1="160" y1="60" x2="100" y2="100" stroke="currentColor" strokeWidth="4" />
          <line x1="70" y1="160" x2="100" y2="100" stroke="currentColor" strokeWidth="4" />
          <circle cx="40" cy="40" r="14" />
          <circle cx="160" cy="60" r="10" />
          <circle cx="70" cy="160" r="12" />
          <circle cx="100" cy="100" r="18" />
        </svg>
        <svg className="molecule molecule-b" viewBox="0 0 160 160" aria-hidden="true">
          <line x1="20" y1="130" x2="80" y2="70" stroke="currentColor" strokeWidth="4" />
          <line x1="140" y1="40" x2="80" y2="70" stroke="currentColor" strokeWidth="4" />
          <circle cx="20" cy="130" r="10" />
          <circle cx="140" cy="40" r="14" />
          <circle cx="80" cy="70" r="16" />
        </svg>
      </div>

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
