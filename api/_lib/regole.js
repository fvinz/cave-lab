/* Regole del sondaggio: funzioni pure, senza Redis né HTTP.
   Le usa il server (gestore.js) e, per lo stato iniziale, anche la pagina. */

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/* Decide solo l'orologio di chi chiama: sul server è quello che conta.
   "attesa": votazione chiusa, classifica non ancora pubblica (per nessuno). */
export function statoSondaggio(config, ora) {
  const t = ora.getTime();
  if (t < Date.parse(config.apertura)) return "prima";
  if (t < Date.parse(config.chiusura)) return "aperto";
  if (t < Date.parse(config.pubblicazione)) return "attesa";
  return "chiuso";
}

export function tokenValido(token) {
  return typeof token === "string" && UUID_V4.test(token);
}

/* Esattamente `config.voti` mete, tutte diverse e presenti in configurazione */
export function sceltaValida(config, mete) {
  if (!Array.isArray(mete) || mete.length !== config.voti) return false;
  const ammesse = new Set(config.mete.map((m) => m.id));
  return mete.every((id) => typeof id === "string" && ammesse.has(id)) && new Set(mete).size === mete.length;
}

/* Tutte le mete della configurazione, dalla più votata; a pari voti per nome.
   I conteggi possono arrivare come stringhe (Redis); id sconosciuti ignorati. */
export function classifica(config, voti) {
  const nome = new Map(config.mete.map((m) => [m.id, m.nome]));
  return config.mete
    .map((m) => ({ id: m.id, voti: Number(Object.hasOwn(voti, m.id) ? voti[m.id] : 0) || 0 }))
    .sort((a, b) => b.voti - a.voti || nome.get(a.id).localeCompare(nome.get(b.id), "it"));
}

/* Vince chi ha almeno i voti della meta in posizione `config.vincitrici`
   (e almeno un voto): a pari merito le vincitrici possono essere di più. */
export function vincitrici(config, ordinata) {
  const soglia = ordinata[config.vincitrici - 1]?.voti ?? 0;
  const vinte = ordinata.filter((m) => m.voti > 0 && m.voti >= soglia).map((m) => m.id);
  return { vincitrici: vinte, pariMerito: vinte.length > config.vincitrici };
}

/* L'hash della rete si cancella da solo sette giorni dopo la chiusura */
export function scadenzaRete(config) {
  return Math.floor(Date.parse(config.chiusura) / 1000) + 7 * 24 * 60 * 60;
}
