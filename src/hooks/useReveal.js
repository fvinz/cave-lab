import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Anima al scroll gli elementi [data-reveal] e i figli di
   [data-reveal-stagger] dentro il contenitore restituito.
   Rispetta prefers-reduced-motion. */
export default function useReveal() {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        scope.current.querySelectorAll("[data-reveal]").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%" },
            }
          );
        });

        scope.current.querySelectorAll("[data-reveal-stagger]").forEach((group) => {
          gsap.fromTo(
            group.children,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power3.out",
              stagger: 0.08,
              scrollTrigger: { trigger: group, start: "top 85%" },
            }
          );
        });
      });
    },
    { scope }
  );

  return scope;
}
