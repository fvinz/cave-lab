import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Icon from "./Icon.jsx";
import useReveal from "../hooks/useReveal.js";
import { COMMUNITY, EVENTI } from "../content.js";
import { isInArrivo } from "../date.js";

const GRUPPI = Object.fromEntries(COMMUNITY.gruppi.map((g) => [g.symbol, g]));

/* Il quaderno che si scrive: scorrendo, la spina della timeline si
   traccia verso il basso e accende il numero di ogni esperimento quando
   lo raggiunge; nell'archivio gli esperimenti conclusi si spuntano uno
   alla volta. Con prefers-reduced-motion la spina è già tracciata, i
   numeri accesi e le spunte al loro posto. */
function useQuaderno(scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(scope);

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = q(".lab-timeline")[0];
        if (timeline) {
          /* la punta della spina e l'accensione dei numeri seguono la
             stessa linea dello schermo (62%), così si incontrano */
          timeline.classList.add("is-viva");
          gsap.fromTo(timeline, { "--filo": 0 }, {
            "--filo": 1, ease: "none",
            scrollTrigger: { trigger: timeline, start: "top 62%", end: "bottom 62%", scrub: 0.4 },
          });
          q(".lab-step").forEach((step) => {
            ScrollTrigger.create({ trigger: step, start: "top 62%", toggleClass: "is-acceso" });
          });
        }

        const archivio = q(".lab-archivio-list")[0];
        if (archivio) {
          const righe = q(".lab-archivio-list li");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: archivio, start: "top 80%", end: "bottom 55%", scrub: 0.4 },
          });
          righe.forEach((riga, i) => {
            tl.fromTo(riga.querySelector(".lab-spunta"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 0.6 }, i * 0.5);
            tl.fromTo(riga, { opacity: 0.6 }, { opacity: 1, ease: "none", duration: 0.6 }, i * 0.5);
          });
        }

        return () => timeline?.classList.remove("is-viva");
      });
    },
    { scope }
  );
}

export default function Eventi() {
  const scope = useReveal();
  useQuaderno(scope);

  const inArrivo = EVENTI.filter((e) => isInArrivo(e.iso)).sort((a, b) => a.iso.localeCompare(b.iso));
  const conclusi = EVENTI.filter((e) => !isInArrivo(e.iso)).sort((a, b) => b.iso.localeCompare(a.iso));

  return (
    <section className="section section-continua section-eventi" id="eventi" ref={scope}>
      <div className="container">
        <p className="kicker" data-reveal>Elemento 04 · In laboratorio</p>
        <h2 className="section-title" data-reveal>Eventi &amp; progetti in corso</h2>
        <p className="section-text" data-reveal>
          Il quaderno degli esperimenti di Cave Lab: quello che bolle in pentola questa stagione.
        </p>

        {inArrivo.length > 0 ? (
          <ol className="lab-timeline" data-reveal-stagger>
            {inArrivo.map((evento, i) => {
              const gruppo = GRUPPI[evento.gruppo];
              return (
                <li className="lab-step" key={evento.title}>
                  <span className="lab-step-index">{String(i + 1).padStart(2, "0")}</span>
                  <div className="lab-step-card">
                    <span className="lab-step-date">{evento.date}</span>
                    <h3 className="lab-step-title">{evento.title}</h3>
                    <p className="lab-step-text">{evento.desc}</p>
                    {gruppo && (
                      <a
                        href={COMMUNITY.inviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lab-step-gruppo"
                        style={{ "--tile-color": gruppo.color }}
                      >
                        <span className="lab-step-gruppo-symbol" aria-hidden="true">{gruppo.symbol}</span>
                        Entra nella community
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="lab-vuoto" data-reveal>
            Nuovi esperimenti in preparazione: le date arrivano per prime nella community.
          </p>
        )}

        {conclusi.length > 0 && (
          <div className="lab-archivio" data-reveal>
            <h3 className="lab-archivio-title">Esperimenti conclusi</h3>
            <ul className="lab-archivio-list">
              {conclusi.map((evento) => (
                <li key={evento.title}>
                  <span className="lab-archivio-date">{evento.date}</span>
                  <span className="lab-archivio-name">
                    <Icon name="check" className="lab-spunta" />
                    {evento.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
