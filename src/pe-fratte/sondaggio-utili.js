import { tokenValido } from "../../api/_lib/regole.js";

/* Codice casuale del dispositivo per il sondaggio (vedi informativa privacy).
   Se la memoria del browser manca o è bloccata, il codice vale per questa visita. */
export const CHIAVE_TOKEN = "pf-sondaggio";

export function leggiToken(storage, nuovo = () => crypto.randomUUID()) {
  try {
    const salvato = storage?.getItem(CHIAVE_TOKEN);
    if (tokenValido(salvato)) return salvato;
    const token = nuovo();
    storage?.setItem(CHIAVE_TOKEN, token);
    return token;
  } catch {
    return nuovo();
  }
}

/* Ordine delle mete mescolato una volta per dispositivo: chi sta in cima a una
   lista lunga prende voti in più, così il vantaggio si distribuisce */
function hash32(testo) {
  let h = 0x811c9dc5;
  for (let i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function generatore(seme) {
  let a = seme;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ordineMescolato(elementi, seme) {
  const caso = generatore(hash32(String(seme)));
  const copia = [...elementi];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(caso() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* "giovedì 22 ottobre alle 23:59", sempre in ora italiana */
const GIORNO = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Rome" });
const ORA = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

export function giornoEOra(iso) {
  const d = new Date(iso);
  return `${GIORNO.format(d)} alle ${ORA.format(d)}`;
}

/* Quanto manca a `verso` (chiusura o pubblicazione): due unità al massimo,
   giorni e ore, poi ore e minuti, poi minuti. I secondi arrotondano al
   minuto successivo; a scadenza raggiunta restituisce null. */
const UNITA = {
  giorni: ["giorno", "giorni"],
  ore: ["ora", "ore"],
  minuti: ["minuto", "minuti"],
};
const parte = (valore, chiave) => ({ valore, unita: UNITA[chiave][valore === 1 ? 0 : 1] });

export function contoAllaRovescia(verso, ora) {
  const ms = new Date(verso).getTime() - ora.getTime();
  if (ms <= 0) return null;
  const minuti = Math.ceil(ms / 60000);
  const g = Math.floor(minuti / 1440);
  const o = Math.floor((minuti % 1440) / 60);
  const m = minuti % 60;
  const parti = g > 0 ? [parte(g, "giorni"), parte(o, "ore")] : o > 0 ? [parte(o, "ore"), parte(m, "minuti")] : [parte(m, "minuti")];
  const testo = parti
    .filter((p, i) => i === 0 || p.valore > 0)
    .map((p) => `${p.valore} ${p.unita}`)
    .join(" e ");
  return { parti, testo };
}
