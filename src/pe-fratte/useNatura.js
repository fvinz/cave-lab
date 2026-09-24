import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Contenitore che fa da riferimento per lo scroll: una sezione della
   pagina, oppure un elemento [data-scena] (es. la tessera nella home) */
const SCENA = "[data-scena], section";

/* Hook: collega gli elementi [data-*] dentro lo scope allo scroll */
export default function useNatura() {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;

        /* La hero è già in cima al caricamento: si anima da lì. Le altre
           sezioni si animano da quando entrano dal basso. */
        const inizio = (sezione) => (sezione.classList.contains("pf-hero") ? "top top" : "top bottom");

        /* Parallasse: ogni livello scorre di n px mentre la sua sezione
           attraversa lo schermo */
        root.querySelectorAll("[data-parallax]").forEach((el) => {
          const sezione = el.closest(SCENA) || root;
          gsap.to(el, {
            y: Number(el.dataset.parallax),
            x: Number(el.dataset.deriva || 0),
            ease: "none",
            scrollTrigger: { trigger: sezione, start: inizio(sezione), end: "bottom top", scrub: 0.6 },
          });
        });

        /* Filari di pini: crescono dal suolo mentre entrano in vista */
        root.querySelectorAll("[data-cresci]").forEach((el) => {
          gsap.fromTo(
            el,
            /* origine sul suolo già dal primo fotogramma */
            { scaleY: 0.45, transformOrigin: "50% 100%" },
            {
              scaleY: 1,
              transformOrigin: "50% 100%",
              ease: "none",
              scrollTrigger: { trigger: el.closest(".pf-fila-pini"), start: "top bottom", end: "bottom 55%", scrub: 0.6 },
            }
          );
        });

        /* Il sentiero si disegna scendendo: parte già accennato */
        root.querySelectorAll("[data-sentiero]").forEach((el) => {
          const sezione = el.closest(SCENA) || root;
          gsap.fromTo(
            el,
            { strokeDashoffset: 0.72 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: sezione.classList.contains("pf-hero")
                ? { trigger: sezione, start: "top top", end: "60% top", scrub: 0.6 }
                : { trigger: sezione, start: "top 75%", end: "bottom bottom", scrub: 0.6 },
            }
          );
        });

        /* Foglie: cadono e girano mentre la sezione attraversa lo schermo */
        root.querySelectorAll("[data-foglia]").forEach((el) => {
          const sezione = el.closest(SCENA) || root;
          const v = Number(el.dataset.velocita || 1);
          gsap.fromTo(
            el,
            { y: -60 * v, rotation: 0 },
            {
              y: 220 * v,
              x: 30 * v,
              rotation: Number(el.dataset.giro || 180),
              ease: "none",
              scrollTrigger: { trigger: sezione, start: "top bottom", end: "bottom top", scrub: 0.8 },
            }
          );
        });
      });
    },
    { scope }
  );

  return scope;
}
