import PfIcon from "./PfIcon.jsx";
import { PE_FRATTE } from "../content.js";

/* Pezzi comuni alle card delle uscite e alle mete del sondaggio */
export function DifficoltaBadge({ chiave }) {
  const d = PE_FRATTE.difficolta[chiave];
  if (!d) return null;
  return (
    <span className={"pf-diff pf-diff-" + d.tono} title={d.nota}>
      {d.label}
    </span>
  );
}

/* Dati sentiero in mono, formato fisso: 9,4 KM · ↑ 410 M · 3–4 H */
export function DatiSentiero({ p }) {
  const dati = [
    p.km && { icon: "route", testo: `${p.km} km`, label: "Lunghezza" },
    p.dislivello && { icon: "mountain", testo: `↑ ${p.dislivello} m`, label: "Dislivello" },
    p.durata && { icon: "clock", testo: p.durata, label: "Durata camminata" },
  ].filter(Boolean);
  if (dati.length === 0) return null;
  return (
    <dl className="pf-dati">
      {dati.map((d) => (
        <div key={d.icon} className="pf-dato">
          <dt className="pf-visually-hidden">{d.label}</dt>
          <dd>
            <PfIcon name={d.icon} />
            {d.testo}
          </dd>
        </div>
      ))}
    </dl>
  );
}
