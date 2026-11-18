import { useEffect, useRef, useState } from "react";
import "./nome-uscita.css";

/* Il nome della meta. Se all'ultimo si è cambiata montagna (`invece` è la
   meta annunciata), lo dice come il reel: la meta annunciata in piccolo,
   barrata da una riga d'oro, e sotto quella fatta davvero con la spunta.
   La riga si traccia quando il nome entra nello schermo; con
   prefers-reduced-motion è già tracciata. */
export default function NomeUscita({ u }) {
  const nome = u.title.split(": ").pop();
  if (!u.invece) return nome;
  return <CambioMeta prima={u.invece} dopo={nome} />;
}

function CambioMeta({ prima, dopo }) {
  const ref = useRef(null);
  const [barrato, setBarrato] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setBarrato(true);
      return;
    }
    const io = new IntersectionObserver(
      ([voce]) => {
        if (voce.isIntersecting) {
          setBarrato(true);
          io.disconnect();
        }
      },
      { threshold: 1, rootMargin: "0px 0px -15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={"pf-cambio" + (barrato ? " is-barrato" : "")}>
      {/* prima la meta fatta: con column-reverse sta sotto, e la sua riga
          diventa la linea di base del nome (la data accanto si allinea lì) */}
      <span className="pf-cambio-dopo">
        {dopo}
        <svg className="pf-cambio-spunta" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <s className="pf-cambio-prima">
        <span className="pf-cambio-sr">, al posto del </span>
        {prima}
        <span className="pf-cambio-riga" aria-hidden="true" />
      </s>
    </span>
  );
}
