import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PfIcon from "./PfIcon.jsx";
import { DatiSentiero, DifficoltaBadge } from "./Sentiero.jsx";
import CurveDiLivello from "./CurveDiLivello.jsx";
import useAdesso from "./useAdesso.js";
import { contoAllaRovescia, giornoEOra, inPercentuale, ordineMescolato, scadenzaPassata } from "./sondaggio-utili.js";
import { COMMUNITY } from "../content.js";

/* Sondaggio "Le mete di novembre". Non applica regole: mostra quello che
   dice il server (useSondaggio) e gli manda le tre scelte.
   `inHero`: mentre si vota e fino all'annuncio è la hero della pagina;
   dopo l'annuncio torna una sezione sotto la hero di sempre. */
export default function Sondaggio({ config, s, inHero = false }) {
  const ora = useAdesso(10000);
  const titoloRisultati = useRef(null);
  const appenaVotato = useRef(false);
  const montato = useRef(false);
  const fase = s.caricamento
    ? "caricamento"
    : s.irraggiungibile
      ? "irraggiungibile"
      : s.risultati
        ? "risultati"
        : s.haVotato || s.stato === "attesa"
          ? "riepilogo"
          : "scheda";

  /* Il link /pe-fratte#sondaggio (WhatsApp, home) arriva prima che React
     disegni la sezione: il browser non trova l'ancora e resta in cima.
     Appena la sezione c'è, ci si porta lì una volta sola. */
  const ancoraFatta = useRef(false);
  useEffect(() => {
    if (!s.visibile || ancoraFatta.current || window.location.hash !== "#sondaggio") return;
    ancoraFatta.current = true;
    requestAnimationFrame(() => {
      document.getElementById("sondaggio")?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }, [s.visibile]);

  /* Passata la scadenza che si sta aspettando (chiusura, poi annuncio) la
     pagina chiede da sola lo stato nuovo, senza ricaricare: chi aspetta le
     18:00 vede comparire la classifica. Un piccolo ritardo casuale sparpaglia
     le richieste; se il server non è ancora passato, si riprova poco dopo. */
  const ultimoControllo = useRef(0);
  useEffect(() => {
    if (s.caricamento || !scadenzaPassata(s.stato, config, ora)) return;
    if (Date.now() - ultimoControllo.current < 25000) return;
    ultimoControllo.current = Date.now();
    const id = setTimeout(s.ricarica, Math.random() * 15000);
    return () => clearTimeout(id);
  }, [ora, s.stato, s.caricamento, s.ricarica, config]);

  /* cambiando fase la sezione cambia altezza: i trigger più in basso vanno ricalcolati */
  useEffect(() => {
    if (montato.current) ScrollTrigger.refresh();
    montato.current = true;
  }, [fase, s.visibile]);

  /* dopo il voto il focus (e lo scroll) passa all'esito: la classifica, o
     il riepilogo se il voto è arrivato a sondaggio chiuso. La lista lunga
     sparisce, e senza questo su telefono l'esito resterebbe fuori schermo. */
  useEffect(() => {
    if ((fase === "risultati" || fase === "riepilogo") && appenaVotato.current) {
      appenaVotato.current = false;
      /* focus() da solo non tiene conto dell'header fisso: lo scroll lo fa
         scrollIntoView, che rispetta scroll-margin-top */
      titoloRisultati.current?.focus({ preventScroll: true });
      titoloRisultati.current?.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [fase]);

  if (!s.visibile) return null;

  return (
    <section
      className={"pf-sondaggio " + (inHero ? "pf-sondaggio-hero" : "pf-section")}
      id="sondaggio"
      aria-labelledby="sondaggio-titolo"
    >
      <CurveDiLivello />
      <div className="pf-container pf-sondaggio-dentro">
        {inHero ? (
          <TestaHero config={config} s={s} ora={ora} />
        ) : (
          <>
            <p className="pf-meta">Sondaggio</p>
            <h2 className="pf-h2" id="sondaggio-titolo">
              Le mete di novembre
            </h2>
          </>
        )}

        {fase === "caricamento" && (
          <p className="pf-sondaggio-nota" role="status">
            Carico il sondaggio…
          </p>
        )}
        {fase === "irraggiungibile" && (
          <div className="pf-sondaggio-nota" role="status">
            <p>Sondaggio non raggiungibile, riprova tra poco.</p>
            <button type="button" className="pf-btn pf-btn-secondary" onClick={s.ricarica}>
              Riprova
            </button>
          </div>
        )}
        {fase === "scheda" && (
          <Scheda
            config={config}
            s={s}
            onInvio={() => {
              appenaVotato.current = true;
            }}
          />
        )}
        {fase === "riepilogo" && <Riepilogo config={config} s={s} esitoRef={titoloRisultati} />}
        {fase === "risultati" && <Risultati config={config} s={s} titoloRef={titoloRisultati} />}
      </div>
    </section>
  );
}

/* Testa della hero: il titolo enorme e, accanto, la scadenza che conta
   adesso (chiusura del voto, poi annuncio della classifica) */
function TestaHero({ config, s, ora }) {
  const attesa = s.stato === "attesa";
  const verso = attesa ? config.pubblicazione : config.chiusura;
  const manca = contoAllaRovescia(verso, ora);
  return (
    <header className="pf-sondaggio-testa">
      <h1 className="pf-sondaggio-titolo" id="sondaggio-titolo">
        {attesa ? "Le mete di" : "Dove andiamo"}{" "}
        <span>{attesa ? "novembre" : "a novembre?"}</span>
      </h1>
      <div className="pf-sondaggio-quando">
        <p className="pf-sondaggio-scadenza">
          {attesa ? "La classifica si svela" : "Si vota fino a"} <strong>{giornoEOra(verso)}</strong>
        </p>
        {manca && (
          <p className="pf-sondaggio-mancano">
            <PfIcon name="clock" />
            Mancano {manca.testo}
          </p>
        )}
        <a href={COMMUNITY.inviteUrl} target="_blank" rel="noopener noreferrer" className="pf-sondaggio-community">
          <PfIcon name="whatsapp" />
          Entra nella community
        </a>
      </div>
    </header>
  );
}

function Scheda({ config, s, onInvio }) {
  const [scelte, setScelte] = useState([]);
  const mete = useMemo(() => ordineMescolato(config.mete, s.token), [config.mete, s.token]);
  const idBase = useId();
  const piene = scelte.length === config.voti;
  const inCorso = s.invio === "in-corso";

  const cambia = (id) =>
    setScelte((prima) =>
      prima.includes(id) ? prima.filter((x) => x !== id) : prima.length < config.voti ? [...prima, id] : prima
    );

  const invia = (evento) => {
    evento.preventDefault();
    if (!piene || inCorso) return;
    onInvio();
    s.vota(scelte);
  };

  return (
    <form className="pf-sondaggio-form" onSubmit={invia}>
      <p className="pf-lead">
        Scegli le {config.voti} mete che vorresti fare: le {config.vincitrici} più votate diventano le uscite di
        novembre.
      </p>
      <fieldset className="pf-sondaggio-mete">
        <legend className="pf-visually-hidden">Scegli {config.voti} mete</legend>
        <ul>
          {mete.map((m) => {
            const scelta = scelte.includes(m.id);
            const spenta = !scelta && piene;
            const id = `${idBase}-${m.id}`;
            return (
              <li key={m.id} className={"pf-voce" + (scelta ? " is-scelta" : "") + (spenta ? " is-spenta" : "")}>
                {/* la tavola del segnavia: carta con la punta a freccia */}
                <span className="pf-voce-tavola" aria-hidden="true"></span>
                <input
                  id={id}
                  type="checkbox"
                  className="pf-voce-check"
                  checked={scelta}
                  disabled={spenta || inCorso}
                  onChange={() => cambia(m.id)}
                  aria-describedby={`${id}-zona ${id}-misure`}
                />
                <label htmlFor={id} className="pf-voce-etichetta">
                  <span className="pf-voce-segno" aria-hidden="true">
                    <PfIcon name="check" />
                  </span>
                  <span className="pf-voce-nome">{m.nome}</span>
                </label>
                {m.zona && (
                  <p id={id + "-zona"} className="pf-zona pf-voce-zona" title={m.zona}>
                    <PfIcon name="mapPin" />
                    <span>{m.zona}</span>
                  </p>
                )}
                <div className="pf-voce-piede">
                  <div id={id + "-misure"} className="pf-voce-misure">
                    <DifficoltaBadge chiave={m.difficolta} />
                    <DatiSentiero p={m} />
                  </div>
                  {m.link && (
                    <a className="pf-voce-link" href={m.link} target="_blank" rel="noopener noreferrer">
                      Vedi su komoot
                      <PfIcon name="externalLink" />
                      <span className="pf-visually-hidden"> (si apre in una nuova scheda)</span>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {/* Gli errori stanno nella barra: su telefono resta in vista mentre si
          scorre, quindi il messaggio compare accanto al bottone appena premuto */}
      <div className="pf-sondaggio-barra">
        {s.invio === "errore" && (
          <p className="pf-sondaggio-errore" role="alert">
            Il voto non è arrivato. Le tue scelte sono ancora qui: riprova.
          </p>
        )}
        {s.invio === "tetto" && (
          <p className="pf-sondaggio-errore" role="alert">
            Da questa rete sono già arrivati molti voti. Se sei sulla Wi-Fi di casa o di un locale, riprova con la rete
            dati del telefono.
          </p>
        )}
        <p className="pf-sondaggio-conta" aria-live="polite">
          {scelte.length} di {config.voti}
        </p>
        <button type="submit" className="pf-btn pf-btn-accent" disabled={!piene || inCorso}>
          {inCorso
            ? "Invio in corso…"
            : piene
              ? "Conferma il voto, non si può cambiare"
              : `Scegline ancora ${config.voti - scelte.length}`}
        </button>
      </div>
    </form>
  );
}

function NonContato() {
  return (
    <p className="pf-sondaggio-avviso" role="status">
      Il sondaggio si è chiuso prima che il tuo voto arrivasse: non è stato contato.
    </p>
  );
}

/* Senza classifica: chi ha già votato e riapre la pagina (la classifica
   parziale si vede solo subito dopo il voto) e, dopo la chiusura, tutti
   fino alla pubblicazione */
function Riepilogo({ config, s, esitoRef }) {
  const nome = new Map(config.mete.map((m) => [m.id, m.nome]));
  return (
    <div className="pf-risultati" ref={esitoRef} tabIndex={-1}>
      {s.avviso === "non-contato" && <NonContato />}
      <p className="pf-lead">
        {s.stato === "attesa" ? "Il voto è chiuso: grazie a chi ha partecipato." : "Hai già votato, grazie!"}
      </p>
      {s.haVotato && (
        <p className="pf-risultati-nota">Il tuo voto: {s.scelte.map((id) => nome.get(id) ?? id).join(", ")}.</p>
      )}
      <p className="pf-note">
        La classifica completa esce {giornoEOra(config.pubblicazione)}: torna qui a quell'ora per vederla.
      </p>
    </div>
  );
}

function Risultati({ config, s, titoloRef }) {
  const { risultati } = s;
  const chiuso = s.stato === "chiuso";
  const perId = new Map(config.mete.map((m) => [m.id, m]));
  const vincenti = new Set(risultati.vincitrici ?? []);
  const massimo = Math.max(1, ...risultati.mete.map((m) => m.percentuale));

  return (
    <div className="pf-risultati">
      {s.avviso === "non-contato" && <NonContato />}
      <h3 className="pf-risultati-titolo" ref={titoloRef} tabIndex={-1}>
        {chiuso ? "Classifica finale" : "Come sta andando"}
      </h3>
      <p className="pf-risultati-nota">
        Percentuali sul totale dei voti. {chiuso ? "Il sondaggio è chiuso." : `Si chiude ${giornoEOra(config.chiusura)}.`}
      </p>
      {chiuso && risultati.pariMerito && (
        <p className="pf-risultati-nota">
          Pari merito al terzo posto: le mete evidenziate sono più di {config.vincitrici}, si decide nel gruppo.
        </p>
      )}
      <ol className="pf-classifica">
        {risultati.mete.map((m) => {
          const meta = perId.get(m.id);
          if (!meta) return null;
          return (
            <li key={m.id} className={"pf-classifica-voce" + (vincenti.has(m.id) ? " is-vincitrice" : "")}>
              <div className="pf-classifica-testa">
                <span className="pf-classifica-nome">{meta.nome}</span>
                {vincenti.has(m.id) && <span className="pf-classifica-tag">Si va</span>}
                {s.scelte.includes(m.id) && <span className="pf-classifica-tuo">Il tuo voto</span>}
                <span className="pf-classifica-voti">{inPercentuale(m.percentuale)}</span>
              </div>
              <span className="pf-classifica-barra" aria-hidden="true">
                <span style={{ "--quota": m.percentuale / massimo }} />
              </span>
            </li>
          );
        })}
      </ol>
      {!chiuso && (
        <p className="pf-note">
          Questa classifica la vedi solo adesso. Quella finale esce {giornoEOra(config.pubblicazione)}.
        </p>
      )}
    </div>
  );
}
