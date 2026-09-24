import { isInArrivo } from "../date.js";
import { Foglia, Paesaggio } from "../pe-fratte/Natura.jsx";
import useNatura from "../pe-fratte/useNatura.js";

/* Tessera del gruppo Pe' Fratte nella Community: esce dalla tavola
   periodica e parla la lingua della pagina /pe-fratte/ — fondo bosco,
   logo oro, timbro oro — con un piccolo paesaggio (crinali, sole,
   sentiero, stormo) e foglie che si muovono con lo scroll.
   Gli elementi naturali sono gli stessi della pagina (Natura.jsx);
   gli stili sono in styles.css, sezione "Tessera Pe' Fratte". */
export default function GruppoPeFratte({ gruppo, uscite }) {
  const scope = useNatura();

  return (
    <article className="pf-tessera" data-scena ref={scope}>
      <Paesaggio variante="alba" />
      <Foglia x="84%" y="4%" size={22} tono="oro" velocita={0.6} giro={200} />
      {/* nel cielo sopra i crinali, lontano dai testi */}
      <Foglia x="46%" y="64%" size={18} tono="sabbia" velocita={0.35} giro={-220} />
      <Foglia x="80%" y="60%" size={16} tono="salvia" velocita={0.4} giro={260} />

      <div className="pf-tessera-corpo">
        <p className="pf-tessera-meta">Gruppo · {gruppo.tema}</p>
        <h3 className="pf-tessera-logo">
          <img src="/pe-fratte/logo-oro.svg" alt={gruppo.name + " — un'idea Cave Lab"} width="1110" height="374" loading="lazy" />
        </h3>
        <p className="pf-tessera-desc">{gruppo.desc}</p>

        {uscite.length > 0 && (
          <ul className="pf-tessera-uscite" aria-label="Uscite">
            {uscite.map((u) => {
              const fatta = !isInArrivo(u.iso);
              return (
                <li key={u.iso} className={fatta ? "is-fatta" : undefined}>
                  <span className="pf-tessera-data">{u.date}</span>
                  <span className="pf-tessera-nome">
                    {fatta && <span className="pf-tessera-fatta">Fatta</span>}
                    {u.title.split("— ").pop()}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {gruppo.pagina && (
          <a href={gruppo.pagina} className="pf-tessera-cta">
            {gruppo.paginaCta}
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
