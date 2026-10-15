import { classifica, sceltaValida, scadenzaRete, statoSondaggio, tokenValido, vincitrici } from "./regole.js";

/* Una richiesta al sondaggio, senza HTTP né Redis: li mettono
   api/sondaggio.js (Vercel) e vite.config.js (sviluppo).
   La classifica esce solo per chi ha votato mentre il voto è aperto, e per
   tutti dopo la pubblicazione. Durante l'attesa non esce per nessuno. */
export async function gestisci({ metodo, token, mete, rete, ora }, { config, archivio }) {
  if (!config.attivo) return { status: 404, corpo: { errore: "non-attivo" } };
  const stato = statoSondaggio(config, ora);
  const scheda = () => (tokenValido(token) ? archivio.leggiScheda(token) : null);

  if (metodo === "GET") {
    return { status: 200, corpo: await corpoStato(config, archivio, stato, await scheda()) };
  }
  if (metodo !== "POST") return { status: 405, corpo: { errore: "metodo" } };

  if (stato === "prima") return { status: 403, corpo: { errore: "prima", stato, haVotato: false } };
  if (stato === "attesa" || stato === "chiuso") {
    return { status: 403, corpo: { errore: "chiuso", ...(await corpoStato(config, archivio, stato, await scheda())) } };
  }
  if (!tokenValido(token) || !sceltaValida(config, mete)) {
    return { status: 400, corpo: { errore: "scelta-non-valida" } };
  }

  const nuova = { mete: [...mete], t: ora.toISOString() };
  const esito = await archivio.registra({
    token,
    scheda: nuova,
    rete: rete || "sconosciuta",
    tetto: config.tettoPerRete,
    scadenzaRete: scadenzaRete(config),
  });
  if (esito === "tetto") return { status: 429, corpo: { errore: "tetto" } };
  if (esito === "gia-votato") {
    return { status: 409, corpo: { errore: "gia-votato", ...(await corpoStato(config, archivio, stato, await scheda())) } };
  }
  return { status: 200, corpo: await corpoStato(config, archivio, stato, nuova) };
}

async function corpoStato(config, archivio, stato, scheda) {
  const corpo = { stato, haVotato: Boolean(scheda) };
  if (scheda) corpo.scelte = scheda.mete;
  if ((scheda && stato === "aperto") || stato === "chiuso") {
    const { votanti, voti } = await archivio.conteggi();
    const mete = classifica(config, voti);
    corpo.risultati = { votanti, mete, ...(stato === "chiuso" ? vincitrici(config, mete) : {}) };
  }
  return corpo;
}
