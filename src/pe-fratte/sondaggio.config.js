/* Sondaggio "Le mete di novembre" (spec: docs/superpowers/specs/2026-10-15-sondaggio-pe-fratte-design.md).
   Lo leggono sia la pagina sia la funzione api/sondaggio.js: è l'unico posto
   dove cambiare mete e orari.
   - `id` delle mete: stabile, mai rinominato dopo l'apertura (i voti sono legati all'id)
   - orari con offset esplicito: dal 19 al 23 ottobre vale l'ora legale (+02:00)
   - tra `chiusura` e `pubblicazione` non si vota e la classifica non si vede (nemmeno a chi ha votato)
   - km/dislivello/durata facoltativi: un dato non annunciato non si scrive
   - `link`: la scheda del percorso (komoot), si apre in una nuova scheda
   - `attivo: false` spegne sezione e API */
export const SONDAGGIO = {
  id: "novembre-2026",
  attivo: true,
  /* Annunciato da lunedì 19 alle 19:00, ma aperto già dalle 18:30; si vota fino a mercoledì 21 alle 23:59; classifica giovedì 22 alle 18:00 */
  apertura: "2026-10-19T18:30:00+02:00",
  chiusura: "2026-10-21T23:59:00+02:00",
  pubblicazione: "2026-10-22T18:00:00+02:00",
  voti: 3,
  vincitrici: 3,
  tettoPerRete: 10,
  /* Le 9 mete proposte dal gruppo (percorsi komoot condivisi, link senza i
     parametri di condivisione). Dati come li riporta komoot: km, salita e tempo
     di cammino stimato; difficoltà Facile/Moderato/Difficile → facile/intermedia/impegnativa. */
  mete: [
    { id: "monte-crepacuore", nome: "Monte Crepacuore", zona: "Monti Ernici, Guarcino", difficolta: "intermedia", km: "10,9", dislivello: "460", durata: "3:35 h",
      link: "https://www.komoot.com/it-it/smarttour/34341347" },
    { id: "monte-viglio", nome: "Monte Viglio", zona: "Serra Sant'Antonio, Monti Simbruini", difficolta: "impegnativa", km: "11,1", dislivello: "630", durata: "4:03 h",
      link: "https://www.komoot.com/it-it/smarttour/14973736" },
    { id: "monte-camicia", nome: "Monte Camicia", zona: "Fonte Vetica, Gran Sasso", difficolta: "impegnativa", km: "9,2", dislivello: "920", durata: "5:10 h",
      link: "https://www.komoot.com/it-it/smarttour/e970147457" },
    { id: "monte-semprevisa", nome: "Monte Semprevisa", zona: "Pian della Faggeta, Monti Lepini", difficolta: "intermedia", km: "9,1", dislivello: "660", durata: "3:35 h",
      link: "https://www.komoot.com/it-it/smarttour/e926903383" },
    { id: "monte-vettore", nome: "Monte Vettore", zona: "Forca di Presta, Monti Sibillini", difficolta: "impegnativa", km: "10,2", dislivello: "900", durata: "4:19 h",
      link: "https://www.komoot.com/it-it/smarttour/e1042699759" },
    { id: "salomone-tuscolo", nome: "Monte Salomone e Tuscolo", zona: "Monte Compatri, Castelli Romani", difficolta: "intermedia", km: "11,7", dislivello: "380", durata: "3:32 h",
      link: "https://www.komoot.com/it-it/smarttour/37866573" },
    { id: "redentore-lungo", nome: "Monte Redentore, anello lungo", zona: "Fossa Massaraccio, Formia", difficolta: "impegnativa", km: "15,1", dislivello: "760", durata: "5:22 h",
      link: "https://www.komoot.com/it-it/smarttour/6940370" },
    { id: "redentore-corto", nome: "Monte Redentore, anello corto", zona: "Fossa Massaraccio, Formia", difficolta: "intermedia", km: "9,4", dislivello: "490", durata: "3:14 h",
      link: "https://www.komoot.com/it-it/smarttour/6940367" },
    { id: "monte-cimino", nome: "Monte Cimino", zona: "Faggeta del Cimino, Viterbo", difficolta: "intermedia", km: "9,9", dislivello: "370", durata: "3:06 h",
      link: "https://www.komoot.com/it-it/smarttour/6964072" },
  ],
};
