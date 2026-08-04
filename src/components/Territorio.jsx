import useReveal from "../hooks/useReveal.js";
import { TERRITORIO_FOTO } from "../content.js";

export default function Territorio() {
  const scope = useReveal();

  return (
    <section className="section section-atto section-territorio" id="territorio" ref={scope}>
      <div className="container section-grid section-grid-reverse">
        <figure className="territorio-visual" data-reveal>
          <img
            className="territorio-foto"
            src={TERRITORIO_FOTO.src}
            alt={TERRITORIO_FOTO.alt}
            width="1100"
            height="825"
            loading="lazy"
          />
          <figcaption className="territorio-credito">
            Foto di{" "}
            <a href={TERRITORIO_FOTO.creditoUrl} target="_blank" rel="noopener noreferrer">
              {TERRITORIO_FOTO.credito}
            </a>{" "}
            ·{" "}
            <a href={TERRITORIO_FOTO.licenzaUrl} target="_blank" rel="noopener noreferrer">
              {TERRITORIO_FOTO.licenza}
            </a>
          </figcaption>
        </figure>
        <div className="section-copy" data-reveal>
          <p className="kicker">Elemento 05 · Radici</p>
          <h2 className="section-title">Il nostro laboratorio a cielo aperto: Cave</h2>
          <p className="section-text">
            Tra i Monti Prenestini, a due passi da Roma, Cave è un piccolo borgo con una
            storia grande: vicoli medievali, tradizioni artigiane e una comunità che non
            smette di reinventarsi.
          </p>
          <p className="section-text">
            Noi crediamo che raccontare questo territorio non basti: va vissuto, animato e
            reso accessibile a chi lo abita e a chi lo scopre per la prima volta. Ogni
            evento che organizziamo è un piccolo esperimento per farlo succedere.
          </p>
          <a href="#galleria" className="link-inline">Guarda gli scatti dal territorio ↓</a>
        </div>
      </div>
    </section>
  );
}
