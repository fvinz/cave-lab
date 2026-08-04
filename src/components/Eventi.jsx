import useReveal from "../hooks/useReveal.js";
import { EVENTI } from "../content.js";

export default function Eventi() {
  const scope = useReveal();

  return (
    <section className="section section-continua section-eventi" id="eventi" ref={scope}>
      <div className="container">
        <p className="kicker" data-reveal>Elemento 03 · In laboratorio</p>
        <h2 className="section-title" data-reveal>Eventi &amp; progetti in corso</h2>
        <p className="section-text" data-reveal>
          Il quaderno degli esperimenti di Cave Lab: quello che bolle in pentola questa stagione.
        </p>

        <ol className="lab-timeline" data-reveal-stagger>
          {EVENTI.map((evento, i) => (
            <li className="lab-step" key={evento.title}>
              <span className="lab-step-index">{String(i + 1).padStart(2, "0")}</span>
              <div className="lab-step-card">
                <span className="lab-step-date">{evento.date}</span>
                <h3 className="lab-step-title">{evento.title}</h3>
                <p className="lab-step-text">{evento.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
