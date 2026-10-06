import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Icon from "./Icon.jsx";
import Manifesto from "./Manifesto.jsx";
import { COMMUNITY, EVENTI, HERO_EVENTI, SOCIAL } from "../content.js";
import { etichettaMancanti, isInArrivo } from "../date.js";
import { Foglia, Paesaggio } from "../pe-fratte/Natura.jsx";
import useNatura from "../pe-fratte/useNatura.js";

/* Apertura del sito: se ci sono eventi in primo piano (`evidenza` in
   EVENTI) ancora in arrivo, la hero li presenta e il manifesto scende
   subito sotto; altrimenti il manifesto torna a essere la hero. */
export default function Hero() {
  const inEvidenza = EVENTI
    .filter((e) => e.evidenza && isInArrivo(e.iso))
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .slice(0, HERO_EVENTI.max)
    /* l'evento principale (`grande`) apre la griglia e la lettura */
    .sort((a, b) => Number(!!b.evidenza.grande) - Number(!!a.evidenza.grande));

  if (inEvidenza.length === 0) return <Manifesto asHero />;

  return (
    <>
      <HeroEventi eventi={inEvidenza} />
      <Manifesto />
    </>
  );
}

/* Apertura orchestrata, una sola volta al caricamento: il titolo sale
   parola per parola, le carte emergono dal basso (mai in diagonale, come
   i cristalli del resto del sito), poi ogni carta si "versa" con la sua
   identità: l'arco del brindisi si riempie dal basso come un calice,
   il titolo della locandina si svela, la goccia scende lungo il filo;
   nella carta Pe' Fratte i crinali salgono dietro il nome dell'uscita.
   Con prefers-reduced-motion non parte nulla: tutto è già al suo posto. */
function useApertura() {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(scope);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        /* Arrivo sempre esplicito (y: 0, opacity: 1): alcune carte hanno una
           transizione CSS sul transform, e un semplice from() leggerebbe come
           punto d'arrivo un valore a metà transizione. */
        const sale = (targets, y, vars, pos) =>
          tl.fromTo(targets, { y, opacity: 0 }, { y: 0, opacity: 1, ...vars }, pos);

        sale(q(".hero-eventi-testa .kicker"), 14, { duration: 0.5 }, 0);
        tl.fromTo(q(".hero-eventi-parola"), { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.08 }, 0.1);
        sale(q(".hero-eventi-griglia > *"), 56, { duration: 1, stagger: 0.15 }, 0.35);

        /* In Vino Veritas */
        if (q(".carta-ivv").length) {
          tl.fromTo(q(".carta-ivv-arco"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power2.inOut" }, 0.65);
          tl.fromTo(q(".carta-ivv-video"), { scale: 1.12 }, { scale: 1, duration: 1.6, ease: "power2.out" }, 0.65);
          tl.fromTo(q(".carta-ivv-titolo"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power2.inOut" }, 0.9);
          sale(q(".carta-ivv-meta, .carta-ivv-quando, .carta-ivv-lead, .carta-ivv-azioni > *"), 16, { duration: 0.6, stagger: 0.07 }, 1.05);
          tl.fromTo(q(".carta-ivv-filetto"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 0.6 }, 1.1);
          tl.fromTo(q(".carta-ivv-filo"), { scaleY: 0 }, { scaleY: 1, transformOrigin: "top center", duration: 0.5, ease: "power2.in" }, 1.2);
          tl.fromTo(q(".carta-ivv-goccia"), { y: -70, scaleY: 1.25, opacity: 0 }, { y: 0, scaleY: 1, opacity: 1, duration: 0.9, ease: "bounce.out" }, 1.55);
        }

        /* Pe' Fratte */
        if (q(".carta-pf").length) {
          sale(q(".carta-pf .pf-paesaggio"), 80, { duration: 1.2 }, 0.8);
          sale(q(".carta-pf-nome"), 28, { duration: 0.7 }, 0.95);
          sale(q(".carta-pf .pf-tessera-meta, .carta-pf-data, .carta-pf .pf-tessera-desc, .carta-pf-chip, .carta-pf-azioni > *"), 14, { duration: 0.55, stagger: 0.06 }, 1.1);
        }

      });
    },
    { scope }
  );

  return scope;
}

function HeroEventi({ eventi }) {
  const scope = useApertura();
  const solo = eventi.length === 1;

  return (
    <section className="hero-eventi" aria-labelledby="hero-eventi-titolo" ref={scope}>
      <div className="container">
        <header className="hero-eventi-testa">
          <p className="kicker">{HERO_EVENTI.kicker}</p>
          <h1 className="hero-eventi-titolo" id="hero-eventi-titolo">
            {HERO_EVENTI.titolo.split(" ").map((parola, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className="hero-eventi-riga">
                  <span className="hero-eventi-parola">{parola}</span>
                </span>
              </Fragment>
            ))}
          </h1>
        </header>

        <div className={"hero-eventi-griglia" + (solo ? " is-solo" : "")}>
          {eventi.map((evento) =>
            evento.evidenza.stile === "in-vino-veritas" ? (
              <CartaInVinoVeritas key={evento.iso} evento={evento} />
            ) : (
              <CartaPeFratte key={evento.iso} evento={evento} />
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* Carta In Vino Veritas: la carta e il rosso vino della locandina,
   con il video del brindisi dentro un arco come le porte del paese vecchio. */
function CartaInVinoVeritas({ evento }) {
  const e = evento.evidenza;
  const videoRef = useRef(null);

  /* Stessa cautela del video del manifesto: niente download automatico,
     parte via JS solo se non si preferisce meno movimento e la rete regge. */
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = navigator.connection;
    const slowConnection = conn?.saveData || /2g/.test(conn?.effectiveType || "");
    if (reducedMotion || slowConnection) return;
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <article className={"carta-ivv" + (e.grande ? " is-grande" : "")}>
      {/* la goccia della locandina: filo sottile e cerchio rosso vino */}
      <span className="carta-ivv-filo" aria-hidden="true"></span>
      <span className="carta-ivv-goccia" aria-hidden="true"></span>
      <div className="carta-ivv-arco">
        <video
          ref={videoRef}
          className="carta-ivv-video"
          poster={e.poster + ".jpg"}
          preload="none"
          muted
          loop
          playsInline
          aria-label={e.videoAlt}
        >
          <source src={e.video} type="video/mp4" />
        </video>
      </div>

      <div className="carta-ivv-corpo">
        <p className="carta-ivv-meta">{etichettaMancanti(evento.iso)}</p>
        <h2 className="carta-ivv-titolo">
          <picture>
            <source srcSet={e.titoloImg + ".webp"} type="image/webp" />
            <img src={e.titoloImg + ".png"} alt={evento.title} width="780" height="295" />
          </picture>
        </h2>
        <hr className="carta-ivv-filetto" />
        <div className="carta-ivv-quando">
          <p className="carta-ivv-data">
            <strong>{evento.date.replace(/^\S+\s/, "")}</strong>
            <span>{e.ora}</span>
          </p>
          <p className="carta-ivv-luogo">{e.luogo}<br />Cave (RM)</p>
        </div>
        <p className="carta-ivv-lead">{e.lead}</p>
        <div className="carta-ivv-azioni">
          <a className="carta-ivv-cta" href={COMMUNITY.inviteUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" />
            Entra nella community
          </a>
          <a className="carta-ivv-cta carta-ivv-cta-ghost" href={SOCIAL.instagramUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" />
            Seguici su Instagram
          </a>
        </div>
      </div>
    </article>
  );
}

/* Carta Pe' Fratte: la versione "bosco" del design system del gruppo,
   la stessa della tessera in Community, con il paesaggio al tramonto. */
function CartaPeFratte({ evento }) {
  const scope = useNatura();
  const e = evento.evidenza;
  const meta = evento.title.split(": ").pop();
  const gratuita = evento.percorso?.partecipazione;

  return (
    <article className="pf-tessera carta-pf" data-scena data-in-cima ref={scope}>
      <Paesaggio variante="tramonto" />
      <Foglia x="82%" y="6%" size={22} tono="oro" velocita={0.6} giro={200} />
      <Foglia x="12%" y="58%" size={16} tono="salvia" velocita={0.4} giro={-240} />

      <div className="pf-tessera-corpo">
        <p className="pf-tessera-meta">
          Pe' Fratte · Uscita {String(e.numeroUscita).padStart(2, "0")} · {etichettaMancanti(evento.iso)}
        </p>
        <h2 className="carta-pf-nome">{meta}</h2>
        <p className="carta-pf-data">{evento.date}</p>
        <p className="pf-tessera-desc">{evento.desc}</p>
        {gratuita && <p className="carta-pf-chip">Partecipazione {gratuita.toLowerCase()}</p>}
        <div className="carta-pf-azioni">
          <a href={COMMUNITY.inviteUrl} target="_blank" rel="noopener noreferrer" className="pf-tessera-cta">
            Entra nella community
          </a>
          <a href="/pe-fratte/" className="carta-pf-link">Scopri Pe' Fratte</a>
        </div>
      </div>
    </article>
  );
}
