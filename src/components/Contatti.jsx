import Icon from "./Icon.jsx";
import useReveal from "../hooks/useReveal.js";
import { SOCIAL } from "../content.js";

/* Contatti diretti: nessun form intermedio, così ogni messaggio
   arriva davvero a qualcuno dell'associazione. */
const CANALI = [
  {
    icon: "whatsapp",
    label: "Scrivici su WhatsApp",
    value: SOCIAL.whatsappLabel,
    hint: "Il modo più veloce: ti rispondiamo dal telefono dell'associazione.",
    href: `https://wa.me/${SOCIAL.whatsapp}?text=${encodeURIComponent(
      "Ciao Cave Lab! Ho visto il sito e vorrei saperne di più."
    )}`,
    color: "var(--color-green)",
    external: true,
    primary: true,
  },
  {
    icon: "instagram",
    label: "Mandaci un DM",
    value: SOCIAL.instagramHandle,
    hint: "Siamo attivi ogni giorno tra storie, reel e messaggi.",
    href: SOCIAL.instagramUrl,
    color: "var(--color-pink)",
    external: true,
  },
  {
    icon: "mail",
    label: "Scrivici una mail",
    value: SOCIAL.email,
    hint: "Per proposte, collaborazioni e richieste più lunghe.",
    href: `mailto:${SOCIAL.email}?subject=${encodeURIComponent("Ciao Cave Lab!")}`,
    color: "var(--color-violet-solid)",
  },
];

export default function Contatti() {
  const scope = useReveal();

  return (
    <section className="section section-continua section-contatti" id="contatti" ref={scope}>
      <div className="container">
        <p className="kicker kicker-center" data-reveal>Elemento 07 · Reazione finale</p>
        <h2 className="section-title section-title-center" data-reveal>
          Unisciti all'esperimento
        </h2>
        <p className="section-text section-text-center" data-reveal>
          Non serve nessun requisito e non c'è nessun modulo da compilare: scrivici
          e ti raccontiamo come funziona, quando ci vediamo e come dare una mano.
          Ogni buona reazione parte da due elementi che si incontrano.
        </p>

        <ul className="contatti-canali" data-reveal-stagger>
          {CANALI.map((c) => (
            <li key={c.icon}>
              <a
                href={c.href}
                className={"canale" + (c.primary ? " canale-primary" : "")}
                style={{ "--canale-color": c.color }}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span className="canale-icon" aria-hidden="true">
                  <Icon name={c.icon} />
                </span>
                <span className="canale-body">
                  <span className="canale-label">{c.label}</span>
                  <span className="canale-value">{c.value}</span>
                  <span className="canale-hint">{c.hint}</span>
                </span>
                <Icon name="arrowRight" className="canale-arrow" />
              </a>
            </li>
          ))}
        </ul>

        <p className="contatti-luogo" data-reveal>
          <Icon name="pin" />
          <span>Ci trovi a {SOCIAL.luogo} — il laboratorio è tutto il paese.</span>
        </p>
      </div>
    </section>
  );
}
