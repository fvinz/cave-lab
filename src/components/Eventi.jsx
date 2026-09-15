import useReveal from "../hooks/useReveal.js";
import { COMMUNITY, EVENTI } from "../content.js";
import { isInArrivo } from "../date.js";

const GRUPPI = Object.fromEntries(COMMUNITY.gruppi.map((g) => [g.symbol, g]));

export default function Eventi() {
  const scope = useReveal();

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
                        Partecipa dal gruppo {gruppo.name}
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
                  <span className="lab-archivio-name">{evento.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
