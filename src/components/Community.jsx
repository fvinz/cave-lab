import Icon from "./Icon.jsx";
import GruppoPeFratte from "./GruppoPeFratte.jsx";
import useReveal from "../hooks/useReveal.js";
import { COMMUNITY, EVENTI } from "../content.js";
import { isInArrivo } from "../date.js";

export default function Community() {
  const scope = useReveal();

  return (
    <section className="section section-continua section-community" id="community" ref={scope}>
      <div className="container">
        <p className="kicker kicker-center" data-reveal>Elemento 03 · Reazione a catena</p>
        <h2 className="section-title section-title-center" data-reveal>
          La community di Cave Lab
        </h2>
        <p className="section-text section-text-center" data-reveal>
          Ne fanno già parte <strong>{COMMUNITY.membri} persone</strong>.
          Su WhatsApp abbiamo un nucleo e tanti gruppi funzionali: entri nella community,
          ricevi date e aggiornamenti, e scegli i gruppi delle attività che ti interessano.
        </p>

        <div className="community-grid" data-reveal-stagger>
          {/* Il nucleo: canale principale + ingresso */}
          <article className="community-nucleo">
            <span className="community-label">Nucleo · Canale principale</span>
            <h3 className="community-title">{COMMUNITY.nucleo.title}</h3>
            <p className="community-desc">{COMMUNITY.nucleo.desc}</p>
            <a
              href={COMMUNITY.inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-community"
            >
              <Icon name="whatsapp" />
              Entra nella community
            </a>
            <p className="community-note">Si apre WhatsApp: dentro trovi anche i gruppi tematici.</p>
          </article>

          {/* Gruppi funzionali attivi */}
          {COMMUNITY.gruppi.map((g) => {
            const uscite = EVENTI.filter((e) => e.gruppo === g.symbol)
              .sort((a, b) => a.iso.localeCompare(b.iso));
            /* Un gruppo con un'identità propria usa la sua tessera */
            if (g.stile === "pe-fratte") {
              return <GruppoPeFratte key={g.symbol} gruppo={g} uscite={uscite} />;
            }
            return (
              <article key={g.symbol} className="element-card community-gruppo" style={{ "--tile-color": g.color }}>
                <span className="element-number">Gruppo · {g.tema}</span>
                <span className="element-symbol">{g.symbol}</span>
                <h3 className="element-name">{g.name}</h3>
                <p className="element-desc">{g.desc}</p>
                {uscite.length > 0 && (
                  <>
                    <h4 className="community-uscite-title">
                      <Icon name="mountain" /> Uscite
                    </h4>
                    <ul className="community-uscite">
                      {uscite.map((u) => {
                        const conclusa = !isInArrivo(u.iso);
                        return (
                          <li key={u.iso} className={conclusa ? "is-conclusa" : undefined}>
                            <span className="community-uscita-data">{u.date}</span>
                            <span className="community-uscita-meta">
                              {conclusa && <span className="community-uscita-stato">Fatta</span>}
                              {u.title.split("— ").pop()}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
                {g.pagina && (
                  <a href={g.pagina} className="community-pagina">
                    {g.paginaCta}
                    <Icon name="arrowRight" />
                  </a>
                )}
              </article>
            );
          })}

          {/* Elemento non ancora scoperto: come le caselle vuote di Mendeleev */}
          <article className="element-card community-ignoto" aria-label="Prossimi gruppi, non ancora attivi">
            <span className="element-number">In arrivo</span>
            <span className="element-symbol" aria-hidden="true">?</span>
            <h3 className="element-name">Elemento non ancora scoperto</h3>
            <p className="element-desc">
              {COMMUNITY.prossimamente} Resta nella community per sapere quando si attivano.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
