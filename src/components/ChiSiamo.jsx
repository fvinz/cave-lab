import Icon from "./Icon.jsx";
import useReveal from "../hooks/useReveal.js";
import { VALORI } from "../content.js";

/* Ogni valore ha il colore dell'elemento corrispondente nella
   tavola periodica delle attività, così le due sezioni si parlano. */
const VALORE_COLORI = ["#9D7BFF", "#3ECF9A", "#5AD7E0", "#FF7DAE"];

export default function ChiSiamo() {
  const scope = useReveal();

  return (
    <section className="section section-continua section-chi-siamo" id="chi-siamo" ref={scope}>
      <div className="container">
        <div className="chi-siamo-inner">
          <div className="section-copy" data-reveal>
            <p className="kicker">Elemento 01 · Identità</p>
            <h2 className="section-title">Chi siamo</h2>
            <p className="section-text">
              Siamo un gruppo di giovani di Cave che ha deciso di smettere di aspettare che
              "qualcuno faccia qualcosa" per il proprio paese — e ha aperto un laboratorio.
            </p>
            <p className="section-text">  
              Ci mettiamo dentro idee, energie ed errori (ci stanno, fanno parte
              dell'esperimento), e ne tiriamo fuori eventi, iniziative culturali e progetti
              che fanno bene alla comunità.
            </p>
            <p className="section-text">
              Niente camici bianchi: solo tanta voglia di sperimentare insieme, un pizzico di
              follia creativa e la convinzione che il territorio si promuove meglio{" "}
              <em>vivendolo</em>, non solo raccontandolo.
            </p>
          </div>

          <ul className="valori-list" data-reveal-stagger aria-label="I valori di Cave Lab">
            {VALORI.map((v, i) => (
              <li key={v} className="valore" style={{ "--valore-color": VALORE_COLORI[i] }}>
                <span className="valore-mark" aria-hidden="true">
                  <Icon name="spark" />
                </span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
