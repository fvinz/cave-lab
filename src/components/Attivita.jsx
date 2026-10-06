import { Fragment } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import useReveal from "../hooks/useReveal.js";
import { ELEMENTI } from "../content.js";

/* Da dove parte ogni elemento prima della reazione: sparsi sul banco,
   storti, quasi spenti. Valori fissi (non casuali) perché la scena sia
   sempre la stessa, nello stesso ordine della tavola. */
const SPARSO = [
  { x: -70, y: 110, rotate: -7 },
  { x: 0, y: 160, rotate: 5 },
  { x: 70, y: 110, rotate: 8 },
  { x: -90, y: 140, rotate: 6 },
  { x: 10, y: 190, rotate: -5 },
  { x: 90, y: 140, rotate: -8 },
];

/* La reazione: scorrendo, gli elementi lasciano il banco e prendono il
   loro posto nella tavola uno alla volta; quando la tavola è completa
   compare l'equazione, Cu + Am + Ev + So + Te + Cr → Cave Lab.
   Su schermi larghi la tavola resta ferma (pin) mentre la reazione si
   compie; su telefono ogni elemento si sistema mentre entra in vista.
   Con prefers-reduced-motion non parte nulla: tutto è già al suo posto. */
function useReazione(scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(scope);

      mm.add(
        {
          largo: "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
          stretto: "(max-width: 900px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const slots = q(".element-slot");
          const termini = q(".reazione > *");
          const stage = q(".periodic-stage")[0];

          if (ctx.conditions.largo) {
            /* Si ferma tutta la sezione (titolo compreso) se entra sotto
               l'header, altrimenti solo la tavola; se nemmeno quella
               entra, la reazione segue lo scroll senza fermarsi. */
            const spazio = window.innerHeight - 140;
            const contenuto = scope.current.querySelector(".container");
            const blocco = contenuto.offsetHeight < spazio ? contenuto : stage.offsetHeight < spazio ? stage : null;
            const tl = gsap.timeline({
              defaults: { ease: "power2.out" },
              scrollTrigger: {
                trigger: blocco || stage,
                start: blocco ? "center 56%" : "top 80%",
                end: blocco ? "+=120%" : "bottom 45%",
                pin: !!blocco,
                scrub: 0.6,
              },
            });
            slots.forEach((slot, i) => {
              tl.fromTo(slot, { ...SPARSO[i], opacity: 0.15 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 1 }, i * 0.35);
            });
            tl.fromTo(termini, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.12 }, ">-0.2");
            tl.fromTo(q(".reazione-risultato"), { scale: 0.95 }, { scale: 1, duration: 0.4 }, "<");
            /* la tavola completa resta ferma un momento prima di ripartire */
            tl.to({}, { duration: 0.6 });
            return;
          }

          /* Su telefono le tessere occupano tutta la larghezza: arrivano
             solo dal basso, perché uno spostamento laterale o una rotazione
             le farebbe sporgere dallo schermo (scroll orizzontale). */
          slots.forEach((slot) => {
            gsap.fromTo(
              slot,
              { y: 70, opacity: 0.15 },
              {
                y: 0, opacity: 1, ease: "power2.out",
                scrollTrigger: { trigger: slot, start: "top 98%", end: "top 70%", scrub: 0.5 },
              }
            );
          });
          gsap.fromTo(termini, { y: 14, opacity: 0 }, {
            y: 0, opacity: 1, stagger: 0.12, ease: "power2.out",
            scrollTrigger: { trigger: q(".reazione")[0], start: "top 95%", end: "top 70%", scrub: 0.5 },
          });
        }
      );
    },
    { scope }
  );
}

export default function Attivita() {
  const scope = useReveal();
  useReazione(scope);

  return (
    <section className="section section-atto section-attivita" id="attivita" ref={scope}>
      <div className="container">
        <p className="kicker kicker-center" data-reveal>Elemento 02 · Cosa facciamo</p>
        <h2 className="section-title section-title-center" data-reveal>
          La nostra tavola periodica delle attività
        </h2>
        <p className="section-text section-text-center" data-reveal>
          Ogni progetto di Cave Lab nasce combinando un po' di questi elementi.
          Il risultato non è mai lo stesso due volte, ed è la parte divertente.
        </p>

        <div className="periodic-stage">
          <div className="periodic-grid">
            {ELEMENTI.map((el, i) => (
              /* lo slot si muove con lo scroll, la tessera resta libera per l'hover */
              <div className="element-slot" key={el.symbol}>
                <article className="element-card" style={{ "--tile-color": el.color }}>
                  <span className="element-number">{String(i + 1).padStart(2, "0")}</span>
                  <span className="element-symbol">{el.symbol}</span>
                  <h3 className="element-name">{el.name}</h3>
                  <p className="element-desc">{el.desc}</p>
                </article>
              </div>
            ))}
          </div>

          <p className="visually-hidden">
            La reazione di Cave Lab: {ELEMENTI.map((el) => el.name.toLowerCase()).join(", ")} danno Cave Lab.
          </p>
          <p className="reazione" aria-hidden="true">
            {ELEMENTI.map((el, i) => (
              <Fragment key={el.symbol}>
                <span className="reazione-simbolo" style={{ "--tile-color": el.color }}>{el.symbol}</span>
                {i < ELEMENTI.length - 1 && <span className="reazione-segno">+</span>}
              </Fragment>
            ))}
            <span className="reazione-segno reazione-freccia">→</span>
            <span className="reazione-risultato">Cave Lab</span>
          </p>
        </div>
      </div>
    </section>
  );
}
