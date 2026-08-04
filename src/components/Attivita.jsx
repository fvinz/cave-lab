import useReveal from "../hooks/useReveal.js";
import { ELEMENTI } from "../content.js";

export default function Attivita() {
  const scope = useReveal();

  return (
    <section className="section section-atto section-attivita" id="attivita" ref={scope}>
      <div className="container">
        <p className="kicker kicker-center" data-reveal>Elemento 02 · Cosa facciamo</p>
        <h2 className="section-title section-title-center" data-reveal>
          La nostra tavola periodica delle attività
        </h2>
        <p className="section-text section-text-center" data-reveal>
          Ogni progetto di Cave Lab nasce combinando un po' di questi elementi.
          Il risultato non è mai lo stesso due volte — è la parte divertente.
        </p>

        <div className="periodic-grid" data-reveal-stagger>
          {ELEMENTI.map((el, i) => (
            <article
              key={el.symbol}
              className="element-card"
              style={{ "--tile-color": el.color }}
            >
              <span className="element-number">{String(i + 1).padStart(2, "0")}</span>
              <span className="element-symbol">{el.symbol}</span>
              <h3 className="element-name">{el.name}</h3>
              <p className="element-desc">{el.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
