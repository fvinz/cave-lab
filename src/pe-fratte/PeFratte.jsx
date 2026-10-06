import { useEffect, useId, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Analytics } from "@vercel/analytics/react";
import PfIcon from "./PfIcon.jsx";
import { FilaDiPini, Foglia, Paesaggio } from "./Natura.jsx";
import useNatura from "./useNatura.js";
import CookieBanner, { openCookieBanner } from "../components/CookieBanner.jsx";
import { COMMUNITY, EVENTI, PE_FRATTE } from "../content.js";
import { isInArrivo } from "../date.js";

/* Le uscite sono le voci di EVENTI del gruppo "Pf" */
const USCITE = EVENTI.filter((e) => e.gruppo === "Pf");
const prossime = USCITE.filter((u) => isInArrivo(u.iso)).sort((a, b) => a.iso.localeCompare(b.iso));
const fatte = USCITE.filter((u) => !isInArrivo(u.iso)).sort((a, b) => b.iso.localeCompare(a.iso));

/* Fondi delle sezioni (devono coincidere con pe-fratte.css):
   notte = uscite, bosco = come funziona e chiusura, muschio = foto e archivio */
const VERDI = { notte: "#16271D", muschio: "#1C3325", bosco: "#24402F" };
const haMuschio = PE_FRATTE.galleria.length > 0 || fatte.length > 0;

/* Senza uscite in calendario la pagina non si apre su sezioni vuote:
   la hero racconta l'ultima uscita fatta e "Prossime uscite" sparisce.
   Le ancore seguono quello che c'è davvero. */
const ultima = fatte[0];
const conFoto = new Set(PE_FRATTE.galleria.map((m) => m.uscita));
const ANCORA_USCITE = prossime.length > 0 ? "#uscite" : "#galleria";

/* "Pe' Fratte: Monte Gennaro" → "Monte Gennaro" */
const meta = (u) => u.title.split(": ").pop();

function DifficoltaBadge({ chiave }) {
  const d = PE_FRATTE.difficolta[chiave];
  if (!d) return null;
  return (
    <span className={"pf-diff pf-diff-" + d.tono} title={d.nota}>
      {d.label}
    </span>
  );
}

/* Condizioni di partecipazione della singola uscita (es. "Gratuita") */
function Partecipazione({ valore }) {
  if (!valore) return null;
  return (
    <span className="pf-quota" title="Partecipazione a questa uscita">
      {valore}
    </span>
  );
}

/* Dati sentiero in mono, formato fisso: 9,4 KM · ↑ 410 M · 3–4 H */
function DatiSentiero({ p }) {
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

/* Stessa etichetta della home: porta alla community WhatsApp di Cave Lab,
   dentro la quale c'è il gruppo Pe' Fratte */
function BottoneGruppo({ variant = "accent", children = "Entra nella community" }) {
  return (
    <a
      href={COMMUNITY.inviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={"pf-btn pf-btn-" + variant}
    >
      <PfIcon name="whatsapp" />
      {children}
    </a>
  );
}

function Header() {
  return (
    <header className="pf-header">
      <div className="pf-container pf-header-inner">
        <a href="/" className="pf-back">
          <PfIcon name="arrowLeft" />
          <span>
            Torna a <span className="pf-cavelab pf-back-logo" role="img" aria-label="Cave Lab"></span>
          </span>
        </a>
        {/* Marchio nudo (currentColor) usato come maschera: si colora in oro */}
        <a href="#top" className="pf-header-brand" aria-label="Pe' Fratte, torna in cima">
          <span className="pf-marchio" aria-hidden="true"></span>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const prossima = prossime[0];
  return (
    <section className="pf-hero" id="top">
      <Paesaggio variante="alba" />
      {/* Foglie nei vuoti tra le colonne, lontano dai testi. Le foglie
          stanno solo qui e nella chiusura: in ogni sezione sarebbero troppe. */}
      <Foglia x="54%" y="6%" size={30} tono="sabbia" velocita={1.4} giro={220} soloDesktop />
      <Foglia x="57%" y="30%" size={20} tono="salvia" velocita={0.9} giro={-160} soloDesktop />
      <Foglia x="92%" y="4%" size={26} tono="oro" velocita={1.2} giro={260} />
      <div className="pf-container pf-hero-grid">
        <div className="pf-hero-copy">
          <h1 className="pf-hero-logo" data-reveal>
            <img
              src="/pe-fratte/logo-oro.svg"
              alt="Pe' Fratte, un'idea Cave Lab"
              width="1110"
              height="374"
            />
          </h1>
          <p className="pf-meta" data-reveal>Comunità trekking · Cave (RM)</p>
          <p className="pf-lead" data-reveal>{PE_FRATTE.intro}</p>
          <div className="pf-hero-actions" data-reveal>
            <BottoneGruppo />
            <a href={ANCORA_USCITE} className="pf-btn pf-btn-secondary">
              Vedi le uscite
            </a>
          </div>
          <p className="pf-note" data-reveal>
            Si apre la community WhatsApp di Cave Lab: dentro trovi il gruppo Pe' Fratte.
          </p>
        </div>

        <aside className="pf-prossima" aria-label={prossima || !ultima ? "Prossima uscita" : "Ultima uscita"} data-reveal>
          <p className="pf-prossima-label">{prossima || !ultima ? "Prossima uscita" : "Ultima uscita"}</p>
          {prossima ? (
            <>
              <p className="pf-prossima-data">{prossima.date}</p>
              <p className="pf-prossima-titolo">{meta(prossima)}</p>
              {prossima.percorso?.zona && (
                <p className="pf-zona">
                  <PfIcon name="mapPin" />
                  {prossima.percorso.zona}
                </p>
              )}
              {prossima.percorso && <DatiSentiero p={prossima.percorso} />}
              {prossima.percorso?.partecipazione && (
                <p className="pf-prossima-quota">
                  Partecipazione: <strong>{prossima.percorso.partecipazione.toLowerCase()}</strong>
                </p>
              )}
              <a href={"#uscita-" + prossima.iso} className="pf-link">
                Tutti i dettagli <PfIcon name="arrowRight" />
              </a>
            </>
          ) : ultima ? (
            <>
              <p className="pf-prossima-data">{ultima.date}</p>
              <p className="pf-prossima-titolo">{meta(ultima)}</p>
              {ultima.percorso?.zona && (
                <p className="pf-zona">
                  <PfIcon name="mapPin" />
                  {ultima.percorso.zona}
                </p>
              )}
              {ultima.percorso && <DatiSentiero p={ultima.percorso} />}
              <p className="pf-prossima-vuota">Le prossime date arrivano prima nel gruppo.</p>
              <a href={conFoto.has(ultima.iso) ? "#foto-" + ultima.iso : "#fatte-titolo"} className="pf-link">
                {conFoto.has(ultima.iso) ? "Guarda le foto" : "Tutte le uscite fatte"} <PfIcon name="arrowRight" />
              </a>
            </>
          ) : (
            <p className="pf-prossima-vuota">Le prossime date arrivano prima nel gruppo.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

function UscitaCard({ uscita, inEvidenza }) {
  const p = uscita.percorso || {};
  const haDettagli = Boolean(p.km || p.ritrovoOra || p.programma);
  return (
    <article className={"pf-card" + (inEvidenza ? " is-evidenza" : "")} id={"uscita-" + uscita.iso} data-reveal>
      <div className="pf-card-top">
        <span className="pf-card-data">{uscita.date}</span>
        <span className="pf-card-badge">
          <DifficoltaBadge chiave={p.difficolta} />
          <Partecipazione valore={p.partecipazione} />
        </span>
      </div>
      <h3 className="pf-card-titolo">{meta(uscita)}</h3>
      {p.zona && (
        <p className="pf-zona">
          <PfIcon name="mapPin" />
          {p.zona}
        </p>
      )}
      <DatiSentiero p={p} />

      {haDettagli ? (
        <div className="pf-card-dettagli">
          {(p.ritrovoOra || p.partenzaOra) && (
            <ul className="pf-orari">
              {p.ritrovoOra && (
                <li>
                  <span className="pf-orario">{p.ritrovoOra}</span>
                  <span>
                    Ritrovo a Cave ·{" "}
                    <a href={PE_FRATTE.ritrovo.maps} target="_blank" rel="noopener noreferrer">
                      {PE_FRATTE.ritrovo.luogo}
                      <PfIcon name="externalLink" />
                    </a>
                  </span>
                </li>
              )}
              {p.partenzaOra && (
                <li>
                  <span className="pf-orario">~{p.partenzaOra}</span>
                  <span>
                    Inizio camminata
                    {p.partenzaMaps && (
                      <>
                        {" · "}
                        <a href={p.partenzaMaps} target="_blank" rel="noopener noreferrer">
                          punto di partenza
                          <PfIcon name="externalLink" />
                        </a>
                      </>
                    )}
                  </span>
                </li>
              )}
            </ul>
          )}
          {p.programma && <p className="pf-programma">{p.programma}</p>}
          {p.portare?.length > 0 && (
            <div className="pf-portare">
              <p className="pf-portare-titolo">
                <PfIcon name="backpack" /> Cosa portare
              </p>
              <ul>
                {p.portare.map((cosa) => (
                  <li key={cosa}>{cosa}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="pf-card-attesa">{uscita.desc}</p>
      )}

      <div className="pf-card-azioni">
        {/* L'oro è raro: resta alle CTA principali, qui bosco */}
        <BottoneGruppo variant="primary">Ci sto</BottoneGruppo>
      </div>
    </article>
  );
}

function Uscite() {
  if (prossime.length === 0) return null;
  return (
    <section className="pf-section" id="uscite" aria-labelledby="uscite-titolo">
      <div className="pf-container">
        <p className="pf-meta" data-reveal>Calendario</p>
        <h2 className="pf-h2" id="uscite-titolo" data-reveal>Prossime uscite</h2>
        <div className="pf-card-grid">
          {prossime.map((u, i) => (
            <UscitaCard key={u.iso} uscita={u} inEvidenza={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComeFunziona() {
  return (
    <section className="pf-section pf-section-bosco" aria-labelledby="come-titolo">
      <div className="pf-container">
        <p className="pf-meta pf-meta-sabbia" data-reveal>Come funziona</p>
        <h2 className="pf-h2" id="come-titolo" data-reveal>Zaino in spalla</h2>
        <ol className="pf-regole">
          {PE_FRATTE.regole.map((r, i) => (
            <li key={r.titolo} className="pf-regola" data-reveal>
              <span className="pf-regola-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="pf-regola-titolo">{r.titolo}</h3>
              <p>{r.testo}</p>
            </li>
          ))}
        </ol>
        <p className="pf-ritrovo">
          <PfIcon name="flag" />
          <span>
            Chi parte da Cave si ritrova qui:{" "}
            <a href={PE_FRATTE.ritrovo.maps} target="_blank" rel="noopener noreferrer">
              {PE_FRATTE.ritrovo.luogo}
            </a>
            . L'orario cambia a ogni uscita.
          </span>
        </p>
      </div>
    </section>
  );
}

/* Clip breve senza audio: parte da sola in loop solo quando è visibile.
   Con prefers-reduced-motion resta ferma sul poster, con i controlli. */
function VideoClip({ v }) {
  const ref = useRef(null);
  const [fermo, setFermo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFermo(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={v.src}
      poster={v.poster}
      width={v.w}
      height={v.h}
      muted
      loop
      playsInline
      preload="none"
      controls={fermo}
      aria-label={v.alt}
    />
  );
}

function Galleria() {
  const media = PE_FRATTE.galleria;
  if (media.length === 0) return null;

  /* Raggruppa per uscita, dalla più recente */
  const gruppi = [...new Set(media.map((m) => m.uscita))]
    .sort((a, b) => b.localeCompare(a))
    .map((iso) => ({
      uscita: USCITE.find((u) => u.iso === iso),
      iso,
      larghi: media.filter((m) => m.uscita === iso && m.largo),
      altri: media.filter((m) => m.uscita === iso && !m.largo),
    }));

  return (
    <section className="pf-section pf-section-muschio" id="galleria" aria-labelledby="galleria-titolo">
      <div className="pf-container">
        <p className="pf-meta" data-reveal>Dal sentiero</p>
        <h2 className="pf-h2" id="galleria-titolo" data-reveal>Le nostre uscite</h2>

        {gruppi.map((g) => (
          <GruppoGalleria key={g.iso} g={g} />
        ))}
      </div>
    </section>
  );
}

/* Per ogni uscita: il pezzo grande e i primi scatti; il resto si apre
   a richiesta, così la galleria non si mangia la pagina. Gli scatti
   chiusi non vengono nemmeno caricati. */
const SCATTI_VISIBILI = 6;

function GruppoGalleria({ g }) {
  const [aperta, setAperta] = useState(false);
  const idGriglia = useId();
  const nascosti = g.altri.length - SCATTI_VISIBILI;
  const scatti = aperta ? g.altri : g.altri.slice(0, SCATTI_VISIBILI);

  /* aprendo o chiudendo la pagina cambia altezza: i trigger dello
     scroll vanno ricalcolati (non serve al primo render) */
  const montato = useRef(false);
  useEffect(() => {
    if (montato.current) ScrollTrigger.refresh();
    montato.current = true;
  }, [aperta]);

  return (
    <div className="pf-galleria-gruppo" id={"foto-" + g.iso}>
      {g.uscita && (
        <p className="pf-galleria-uscita">
          <span className="pf-galleria-nome">{meta(g.uscita)}</span>
          <span className="pf-galleria-data">{g.uscita.date}</span>
        </p>
      )}
      {g.larghi.map((m) => (
        <figure key={m.src} className="pf-media pf-media-largo" data-reveal>
          {m.tipo === "video" ? <VideoClip v={m} /> : <FotoMedia f={m} />}
        </figure>
      ))}
      <div className="pf-galleria" id={idGriglia}>
        {scatti.map((m, i) => (
          <figure
            key={m.src}
            className={"pf-media" + (m.tipo === "video" ? " pf-media-video" : "")}
            /* solo i primi entrano con l'animazione; gli altri compaiono subito */
            data-reveal={i < SCATTI_VISIBILI ? "" : undefined}
          >
            {m.tipo === "video" ? <VideoClip v={m} /> : <FotoMedia f={m} />}
          </figure>
        ))}
      </div>
      {nascosti > 0 && (
        <button
          type="button"
          className="pf-btn pf-btn-secondary pf-galleria-altre"
          aria-expanded={aperta}
          aria-controls={idGriglia}
          onClick={() => setAperta(!aperta)}
        >
          {aperta ? "Mostra meno" : `Mostra tutte (${g.altri.length})`}
        </button>
      )}
    </div>
  );
}

function FotoMedia({ f }) {
  return (
    <picture>
      <source srcSet={f.src.replace(/\.jpg$/, ".webp")} type="image/webp" />
      <img src={f.src} alt={f.alt} width={f.w} height={f.h} loading="lazy" decoding="async" />
    </picture>
  );
}

function Archivio() {
  if (fatte.length === 0) return null;
  return (
    <section className="pf-section pf-section-muschio" aria-labelledby="fatte-titolo">
      <div className="pf-container">
        <p className="pf-meta" data-reveal>Archivio</p>
        <h2 className="pf-h2" id="fatte-titolo" data-reveal>Uscite fatte</h2>
        <ul className="pf-archivio">
          {fatte.map((u) => (
            <li key={u.iso} data-reveal>
              <span className="pf-archivio-data">{u.date}</span>
              <span className="pf-archivio-nome">{meta(u)}</span>
              {u.percorso && <DatiSentiero p={u.percorso} />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CtaFinale() {
  return (
    <section className="pf-cta" aria-labelledby="cta-titolo">
      <Paesaggio variante="tramonto" />
      <Foglia x="12%" y="10%" size={30} tono="oro" velocita={1.2} giro={-220} />
      <Foglia x="82%" y="16%" size={24} tono="sabbia" velocita={1} giro={240} />
      <div className="pf-container pf-cta-inner">
        <h2 className="pf-h2" id="cta-titolo">{PE_FRATTE.titolo}</h2>
        <p>Entra nella community, scegli l'uscita nel gruppo Pe' Fratte e scrivi "ci sto". Al resto pensiamo insieme.</p>
        <BottoneGruppo />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="pf-footer">
      <div className="pf-container pf-footer-inner">
        <img src="/pe-fratte/logo-oro.svg" alt="Pe' Fratte, un'idea Cave Lab" className="pf-footer-logo" width="1110" height="374" loading="lazy" />
        <p>
          Pe' Fratte è la comunità trekking di{" "}
          <a href="/" className="pf-footer-brand-link" aria-label="Cave Lab">
            <span className="pf-cavelab pf-footer-logo-inline" aria-hidden="true"></span>
          </a>
        </p>
        <p className="pf-footer-legal">
          © {new Date().getFullYear()} Cave Lab · <a href="/privacy">Privacy</a> ·{" "}
          <button type="button" onClick={openCookieBanner}>
            Preferenze cookie
          </button>
        </p>
      </div>
    </footer>
  );
}

export default function PeFratte() {
  const scope = useNatura();
  return (
    <div ref={scope}>
      <a className="pf-skip-link" href={ANCORA_USCITE}>
        Vai alle uscite
      </a>
      <Header />
      <main>
        <Hero />
        <Uscite />
        <FilaDiPini fondo={VERDI.notte} colore={VERDI.bosco} />
        <ComeFunziona />
        {haMuschio && <FilaDiPini fondo={VERDI.bosco} colore={VERDI.muschio} />}
        <Galleria />
        <Archivio />
        {haMuschio && <FilaDiPini fondo={VERDI.muschio} colore={VERDI.bosco} />}
        <CtaFinale />
      </main>
      <Footer />
      <CookieBanner />
      <Analytics />
    </div>
  );
}
